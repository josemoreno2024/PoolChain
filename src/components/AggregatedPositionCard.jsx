import { formatUnits } from 'viem'
import './PositionCard.css'
import Tooltip from './Tooltip'

export default function AggregatedPositionCard({ totalBalance, activeCount, onClaimAll }) {
    const balance = totalBalance ? formatUnits(totalBalance, 6) : '0.00'
    const progress = (parseFloat(balance) / 40) * 100
    const canClaim = parseFloat(balance) >= 1
    const hasActivePositions = activeCount && Number(activeCount) > 0

    return (
        <div className={`position-card ${hasActivePositions ? 'active' : 'completed'}`}>
            <div className="position-header">
                <span className={`position-status ${hasActivePositions ? 'active' : 'completed'}`}>
                    {hasActivePositions ? 'Activo' : 'Sin Posiciones Activas'}
                </span>
            </div>

            <div className="position-body">
                <div className="position-balance">
                    <div className="balance-label">
                        Balance Pendiente
                        <Tooltip text={hasActivePositions
                            ? `Balance acumulado de tus ${Number(activeCount)} posiciones activas. Se actualiza con cada nueva transacción en el sistema.`
                            : 'Tu saldo disponible para retirar. Aunque no tengas posiciones activas, puedes cobrar lo acumulado.'
                        } />
                    </div>
                    <div className="balance-value">{balance} USDT</div>
                </div>

                {/* Barra de Progreso */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                    <div className="progress-text">
                        {balance} / 40 USDT ({progress.toFixed(1)}%)
                    </div>
                </div>

                {/* Info */}
                <div className="info-text" style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
                    {hasActivePositions
                        ? `💼 ${Number(activeCount)} posición${Number(activeCount) > 1 ? 'es' : ''} activa${Number(activeCount) > 1 ? 's' : ''}`
                        : '💼 0 posiciones activas - Puedes crear una nueva o cobrar tu saldo'}
                </div>

                {/* Botón Claim */}
                {canClaim && (
                    <button
                        className="claim-button"
                        onClick={onClaimAll}
                        style={{ marginTop: '15px' }}
                    >
                        💸 Claim Todo ({balance} USDT)
                    </button>
                )}
            </div>
        </div>
    )
}
