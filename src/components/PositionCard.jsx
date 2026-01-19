import { formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import addresses from '../contracts/addresses.json'
import SanDigitalABI from '../contracts/SanDigital2026.json'
import Tooltip from './Tooltip'
import './PositionCard.css'

export default function PositionCard({ positionId, onClaim }) {
    // Leer información de la posición
    const { data: positionInfo } = useReadContract({
        address: addresses.sanDigital2026,
        abi: SanDigitalABI,
        functionName: 'getPositionInfo',
        args: [positionId],
        // watch: true, // DESACTIVADO para evitar spam de RPC
    })

    const { data: positionBalance } = useReadContract({
        address: addresses.sanDigital2026,
        abi: SanDigitalABI,
        functionName: 'getPositionBalance',
        args: [positionId],
        // watch: true, // DESACTIVADO para evitar spam de RPC
    })

    if (!positionInfo) return null

    const balance = positionBalance ? formatUnits(positionBalance, 6) : '0.00'
    const saldoTurno = positionInfo[4] ? formatUnits(positionInfo[4], 6) : '0.00'
    const saldoGlobal = positionInfo[5] ? formatUnits(positionInfo[5], 6) : '0.00'
    const isActive = positionInfo[2]
    const hasExited = positionInfo[3]

    // No mostrar posiciones completadas y cobradas
    if (hasExited && parseFloat(balance) === 0) return null

    const progress = (parseFloat(balance) / 40) * 100
    const canClaim = parseFloat(balance) >= 1

    const status = hasExited ? 'Completado' : isActive ? 'Activo' : 'Inactivo'
    const statusClass = hasExited ? 'completed' : isActive ? 'active' : 'inactive'

    return (
        <div className={`position-card ${statusClass}`}>
            <div className="position-header">
                <span className={`position-status ${statusClass}`}>{status}</span>
            </div>

            <div className="position-body">
                {/* Balance Total */}
                <div className="position-balance">
                    <div className="balance-label">
                        Saldo Acumulado
                        <Tooltip text="Total que has acumulado en esta posición. Incluye recompensas de turno y globales. Puedes retirarlo cuando quieras." />
                    </div>
                    <div className="balance-value">{balance} USDT</div>
                </div>

                {/* Barra de Progreso */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">
                        {balance} / 40 USDT ({progress.toFixed(1)}%)
                    </div>
                </div>

                {/* Desglose */}
                <div className="position-breakdown">
                    <div className="breakdown-item">
                        <span className="breakdown-label">
                            Turno:
                            <Tooltip text="Recompensas que recibes cuando estás en el turno. Cada nueva entrada te da 10 USDT." position="top" />
                        </span>
                        <span className="breakdown-value">{saldoTurno} USDT</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">
                            Global:
                            <Tooltip text="Recompensas distribuidas entre todos. Cada nueva entrada reparte 9 USDT entre todas las posiciones activas." position="top" />
                        </span>
                        <span className="breakdown-value">{saldoGlobal} USDT</span>
                    </div>
                </div>

                {/* Botón Claim - Mostrar si activo O completado con saldo */}
                {((isActive && !hasExited) || (hasExited && parseFloat(balance) > 0)) && canClaim && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <button
                            className="claim-button"
                            onClick={() => onClaim(positionId)}
                        >
                            {hasExited ? '💰 Cobrar Ciclo Completado' : 'Claim'} ({balance} USDT)
                        </button>
                        <Tooltip text={hasExited ? "Retira el saldo final de tu ciclo completado. Pagas tu propio gas." : "Retira tu saldo acumulado a tu wallet. Puedes hacerlo cuando quieras, el mínimo es 1 USDT."} position="right" />
                    </div>
                )}

                {isActive && !canClaim && (
                    <div className="claim-disabled">
                        Mínimo 1 USDT para claim
                    </div>
                )}

                {hasExited && parseFloat(balance) === 0 && (
                    <div className="position-completed">
                        <div className="completion-badge">
                            <span className="badge-icon">✅</span>
                            <div className="badge-content">
                                <strong>Ciclo Completado y Cobrado</strong>
                                <span className="payout-info">40 USDT transferidos a tu wallet</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
