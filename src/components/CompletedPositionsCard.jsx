import { formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import addresses from '../contracts/addresses.json'
import SanDigitalABI from '../contracts/SanDigital2026.json'
import './PositionCard.css'

export default function CompletedPositionsCard({ userAddress, positionIds, onClaim }) {
    // Leer info de cada posición para filtrar completadas
    const completedPositions = []

    positionIds?.forEach(positionId => {
        const { data: positionInfo } = useReadContract({
            address: addresses.sanDigital2026,
            abi: SanDigitalABI,
            functionName: 'getPositionInfo',
            args: [positionId],
        })

        const { data: positionBalance } = useReadContract({
            address: addresses.sanDigital2026,
            abi: SanDigitalABI,
            functionName: 'getPositionBalance',
            args: [positionId],
        })

        if (positionInfo && positionInfo[3]) { // hasExited = true
            const balance = positionBalance ? formatUnits(positionBalance, 6) : '0.00'
            if (parseFloat(balance) > 0) {
                completedPositions.push({
                    id: positionId,
                    balance: balance
                })
            }
        }
    })

    if (completedPositions.length === 0) {
        return null
    }

    const totalCompleted = completedPositions.reduce((sum, p) => sum + parseFloat(p.balance), 0).toFixed(2)

    return (
        <div className="position-card completed" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="position-header">
                <span className="position-status completed">✅ Completado - Listo para Claim</span>
            </div>

            <div className="position-body">
                <div className="position-balance">
                    <div className="balance-label">
                        💰 Posiciones Completadas Pendientes
                    </div>
                    <div className="balance-value">{totalCompleted} USDT</div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.9 }}>
                    🎉 {completedPositions.length} posición{completedPositions.length > 1 ? 'es' : ''} completada{completedPositions.length > 1 ? 's' : ''} (#{completedPositions.map(p => Number(p.id) + 1).join(', #')})
                </div>

                <button
                    className="claim-button"
                    onClick={() => onClaim(completedPositions[0].id)}
                    style={{ marginTop: '15px', width: '100%' }}
                >
                    💸 Reclamar {totalCompleted} USDT
                </button>
            </div>
        </div>
    )
}
