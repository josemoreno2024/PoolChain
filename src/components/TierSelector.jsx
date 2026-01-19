import { useNavigate } from 'react-router-dom'
import { getAllTiers, getCommissionPercentage } from '../sandigital/config/tiers'
import './TierSelector.css'

export default function TierSelector() {
    const navigate = useNavigate()
    const tiers = getAllTiers()

    const handleSelectTier = (tierId) => {
        navigate(`/${tierId}`)
    }

    return (
        <div className="tier-selector-page">
            <div className="tier-selector-hero">
                <h1>SAN Digital 2026</h1>
                <p className="hero-subtitle">
                    Participación Colectiva en Blockchain
                </p>
                <p className="hero-description">
                    Elige el nivel que mejor se adapte a tu perfil
                </p>
                <div style={{ marginTop: '20px' }}>
                    <a
                        href="/info"
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}
                    >
                        📚 ¿Cómo funciona el sistema? Aprende más aquí →
                    </a>
                </div>
            </div>

            <div className="container">
                <div className="tiers-grid">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`tier-card ${tier.popular ? 'popular' : ''} ${tier.premium ? 'premium' : ''}`}
                            style={{ borderColor: tier.color }}
                        >
                            {tier.popular && (
                                <div className="tier-badge popular-badge">
                                    ⭐ Más Popular
                                </div>
                            )}
                            {tier.premium && (
                                <div className="tier-badge premium-badge">
                                    👑 Premium
                                </div>
                            )}

                            <div className="tier-header">
                                <div className="tier-icon">{tier.icon}</div>
                                <h2>{tier.name}</h2>
                            </div>

                            <div className="tier-amounts">
                                <div className="amount-box entry">
                                    <span className="amount-label">Entrada</span>
                                    <span className="amount-value">{tier.entry} USDT</span>
                                </div>
                                <div className="amount-arrow">→</div>
                                <div className="amount-box exit">
                                    <span className="amount-value">{tier.exit} USDT</span>
                                </div>
                            </div>

                            <p className="tier-description">{tier.description}</p>

                            <ul className="tier-features">
                                {tier.features.map((feature, index) => (
                                    <li key={index}>✓ {feature}</li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectTier(tier.id)}
                                className="tier-select-button"
                                style={{ background: tier.gradient }}
                            >
                                Comenzar con {tier.name}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="tier-comparison">
                    <h3>💡 ¿Cuál elegir?</h3>
                    <div className="comparison-grid">
                        <div className="comparison-item">
                            <strong>💎 Micro:</strong> Si quieres probar el sistema con bajo riesgo
                        </div>
                        <div className="comparison-item">
                            <strong>⭐ Standard:</strong> El más equilibrado, ideal para la mayoría
                        </div>
                        <div className="comparison-item">
                            <strong>🔥 Plus:</strong> Mayor capital, mismo gas de $1
                        </div>
                        <div className="comparison-item">
                            <strong>👑 Premium:</strong> Para participantes serios con alto volumen
                        </div>
                        <div className="comparison-item">
                            <strong>💰 Elite:</strong> Alto volumen, máxima eficiencia
                        </div>
                        <div className="comparison-item">
                            <strong>🚀 Ultra:</strong> El tier más exclusivo y premium
                        </div>
                    </div>
                </div>

                <div className="tier-info">
                    <h3>📊 Todos los tiers mantienen:</h3>
                    <ul>
                        <li>✅ Ratio 2x (duplicas tu entrada)</li>
                        <li>✅ Gas sistema $1</li>
                        <li>✅ Mismo nivel de seguridad</li>
                        <li>✅ Contratos independientes</li>
                        <li>✅ Transparencia total</li>
                    </ul>
                    <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <a href="/info" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '600', display: 'inline-block', padding: '12px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', transition: 'all 0.3s' }}>
                            📚 ¿Cómo funciona el sistema? Aprende más aquí →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
