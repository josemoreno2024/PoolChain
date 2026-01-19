import './NetworkRecommendations.css'

const NETWORKS = [
    {
        name: 'opBNB',
        icon: '⭐',
        gas: '~$0.001',
        speed: '1-2 segundos',
        security: 'Alta',
        recommended: true,
        description: 'La opción más económica para transacciones frecuentes'
    },
    {
        name: 'BSC',
        icon: '✅',
        gas: '~$0.10',
        speed: '3 segundos',
        security: 'Alta',
        description: 'Buena alternativa con costos moderados'
    },
    {
        name: 'Polygon',
        icon: '✅',
        gas: '~$0.01',
        speed: '2 segundos',
        security: 'Alta',
        description: 'Excelente balance entre costo y velocidad'
    }
]

export default function NetworkRecommendations({ onShowGuide }) {
    return (
        <div className="network-recommendations">
            <div className="recommendations-header">
                <h3>💡 Redes Recomendadas para SanDigital2026</h3>
                <p>Elige la red que mejor se adapte a tus necesidades</p>
            </div>

            <div className="networks-grid">
                {NETWORKS.map((network) => (
                    <div
                        key={network.name}
                        className={`network-card ${network.recommended ? 'recommended' : ''}`}
                    >
                        {network.recommended && (
                            <div className="recommended-badge">Recomendada</div>
                        )}

                        <div className="network-card-header">
                            <span className="network-icon">{network.icon}</span>
                            <h4>{network.name}</h4>
                        </div>

                        <div className="network-stats">
                            <div className="stat">
                                <span className="stat-label">Gas por TX:</span>
                                <span className="stat-value">{network.gas}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Velocidad:</span>
                                <span className="stat-value">{network.speed}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Seguridad:</span>
                                <span className="stat-value">{network.security}</span>
                            </div>
                        </div>

                        <p className="network-description">{network.description}</p>

                        <button
                            onClick={() => onShowGuide?.(network.name.toLowerCase())}
                            className="configure-button"
                        >
                            Configurar {network.name}
                        </button>
                    </div>
                ))}
            </div>

            <div className="recommendations-footer">
                <p>
                    <strong>💰 Ahorro estimado:</strong> Usando opBNB en lugar de Ethereum ahorras hasta $50 por transacción
                </p>
                <p>
                    <strong>⚡ Velocidad:</strong> Todas las redes recomendadas confirman en segundos, no minutos
                </p>
            </div>
        </div>
    )
}
