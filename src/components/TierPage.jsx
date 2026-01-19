import { useState } from 'react'
import { useAccount } from 'wagmi'
import { getTier } from '../sandigital/config/tiers'
import Dashboard from './Dashboard'
import './TierPage.css'

export function TierPage({ tierId, onConnectWallet, onShowNetworkGuide }) {
    const { isConnected, address } = useAccount()
    const tier = getTier(tierId)

    if (!tier) {
        return (
            <div className="tier-page-error">
                <h1>Tier no encontrado</h1>
                <p>El tier "{tierId}" no existe.</p>
                <a href="/">Volver al selector de tiers</a>
            </div>
        )
    }

    // 🔒 AUTENTICACIÓN SIMPLIFICADA: Solo requiere wallet conectada
    if (isConnected) {
        return <Dashboard key={tierId} userAddress={address} tierConfig={tier} />
    }

    // Si no está conectado, mostrar landing del tier
    return (
        <div className="tier-page">
            <div className="tier-hero" style={{ background: tier.gradient }}>
                <div className="container">
                    <div className="tier-hero-content">
                        <div className="tier-icon-large">{tier.icon}</div>
                        <h1>SAN Digital</h1>
                        <p className="tier-tagline">{tier.description}</p>

                        <button onClick={onConnectWallet} className="connect-button-hero">
                            Conectar Wallet y Comenzar
                        </button>

                        <p className="wallet-hint">
                            Conecta tu wallet para participar y conocer SanDigital2026.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Características Generales de SAN Digital */}
                <section className="tier-features-section">
                    <h2>Fortalezas de SAN Digital</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <p><strong>Seguridad Blockchain:</strong> Contratos inteligentes auditados en opBNB garantizan transparencia total y cero manipulación.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🤝</div>
                            <p><strong>Sistema ROSCA Digital:</strong> Inspirado en sistemas tradicionales de ahorro colectivo, pero automatizado y sin intermediarios.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <p><strong>Un Solo Aporte:</strong> Participas una vez, recibes tu número de registro y automáticamente te conviertes en receptor.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <p><strong>Transparencia Total:</strong> Todas las transacciones son verificables en blockchain. Sin secretos, sin sorpresas.</p>
                        </div>
                    </div>
                </section>

                {/* ¿Por qué SAN Digital es Diferente? */}
                <section className="tier-how-it-works">
                    <h2>¿Por qué SAN Digital NO es una Pirámide?</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">🚫</div>
                            <h3>Pirámides: Solo Ganan los Primeros</h3>
                            <p>Los esquemas piramidales colapsan cuando no entran nuevos miembros. Los últimos pierden todo. <strong>Es insostenible por diseño.</strong></p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">✅</div>
                            <h3>SAN Digital: Todos Ganan</h3>
                            <p><strong>Cada participante recibe su turno garantizado</strong> más pagos globales constantes. El sistema está diseñado para que nadie se quede sin recibir.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">🔐</div>
                            <h3>Código Inmutable = Confianza Cero</h3>
                            <p>No confías en personas, confías en <strong>código verificable en blockchain</strong>. El contrato ejecuta pagos automáticamente. Sin intermediarios, sin excusas.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">🎯</div>
                            <h3>Un Aporte, Múltiples Beneficios</h3>
                            <p>Entras una vez y recibes: <strong>1)</strong> Tu turno de salida garantizado <strong>2)</strong> Pagos globales de cada nueva entrada <strong>3)</strong> Transparencia total en blockchain.</p>
                        </div>
                    </div>

                    <div style={{
                        maxWidth: '800px',
                        margin: '40px auto 0',
                        padding: '24px',
                        background: 'rgba(76, 175, 80, 0.1)',
                        borderLeft: '4px solid #4CAF50',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#4CAF50' }}>💡 La Diferencia Clave</h3>
                        <p style={{ margin: 0, lineHeight: '1.8' }}>
                            En SAN Digital, <strong>nadie se queda sin recibir</strong>. Los pagos globales son automáticos y constantes.
                            No dependes de reclutar a otros para ganar. Simplemente participas una vez y el contrato inteligente
                            te garantiza recibir tu turno de salida + todos los globales acumulados. <strong>Es lógico, factible y transparente.</strong>
                        </p>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="tier-cta-section">
                    <div className="cta-box" style={{ borderColor: tier.color }}>
                        <h2>¿Listo para participar?</h2>
                        <p>Conecta tu wallet y únete a la nueva era del ahorro colectivo descentralizado</p>
                        <button
                            onClick={onConnectWallet}
                            className="cta-button"
                            style={{ background: tier.gradient }}
                        >
                            Conectar Wallet Ahora
                        </button>
                        <div className="tier-links">
                            <a href="/">← Volver al selector de tiers</a>
                            <button onClick={() => onShowNetworkGuide?.(tierId)} className="link-button">
                                Configurar Red
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
