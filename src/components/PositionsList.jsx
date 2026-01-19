import PositionCard from './PositionCard'
import './PositionsList.css'

export default function PositionsList({ positionIds, onClaim, onClaimAll, totalBalance }) {
    if (!positionIds || positionIds.length === 0) {
        return (
            <div className="positions-empty">
                <p>No tienes posiciones</p>
                <p className="empty-hint">Crea tu primera posición con el botón "Nueva Posición"</p>
            </div>
        )
    }

    const allPositions = positionIds.filter(id => id !== undefined)
    const canClaimAll = parseFloat(totalBalance) >= 1

    return (
        <div className="positions-list">
            <div className="positions-section">
                <div className="positions-header">
                    <h3>✅ Posiciones Activas ({allPositions.length})</h3>
                    {canClaimAll && allPositions.length > 1 && (
                        <button
                            className="claim-all-button"
                            onClick={onClaimAll}
                        >
                            Claim Todo ({totalBalance} USDT)
                        </button>
                    )}
                </div>

                <div className="positions-grid">
                    {allPositions.map((positionId) => (
                        <PositionCard
                            key={positionId}
                            positionId={positionId}
                            onClaim={onClaim}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
