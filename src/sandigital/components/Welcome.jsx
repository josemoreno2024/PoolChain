import { useState } from 'react'
import './Welcome.css'

export default function Welcome({ onConnectWallet, isConnected }) {
    return (
        <div className="welcome-page">
            {/* Hero Principal */}
            <section className="welcome-hero">
                <div className="welcome-container">
                    <div className="welcome-content">
                        <div className="welcome-logo">
                            <h1 className="welcome-title">SAN Digital 2026</h1>
                            <p className="welcome-tagline">Participación Colectiva en Blockchain</p>
                        </div>

                        <div className="welcome-description">
                            <p className="lead-text">
                                Sistema descentralizado de ahorro colectivo basado en contratos inteligentes.
                                Transparente, seguro y matemáticamente sostenible.
                            </p>
                        </div>

                        {/* Características Clave */}
                        <div className="key-features">
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span className="feature-text">100% en Blockchain</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span className="feature-text">Un solo aporte</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💰</span>
                                <span className="feature-text">Retorno 2x</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span className="feature-text">Transparencia total</span>
                            </div>
                        </div>

                        {/* Enlace a Información Completa */}
                        <div className="info-link-section" style={{ textAlign: 'center', marginTop: '20px', marginBottom: '-90px' }}>
                            <a
                                href="/tier-info"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                📚 Ver Información Completa y FAQ →
                            </a>
                        </div>

                        {/* Botón de Conexión - REMOVIDO: redundante con Header */}
                        {/* 
                        {!isConnected ? (
                            <div className="connect-section">
                                <div className="connect-button-wrapper">
                                    <button
                                        onClick={onConnectWallet}
                                        className="connect-wallet-btn"
                                    >
                                        🔐 Conectar Wallet para Comenzar
                                    </button>
                                    <div className="help-tooltip">
                                        <button className="help-icon" type="button">?</button>
                                        <div className="welcome-tooltip-content">
                                            <h4>¿Qué es una Wallet?</h4>
                                            <p>Una wallet (billetera digital) es como tu cuenta bancaria en blockchain. Te permite:</p>
                                            <ul>
                                                <li>✅ Guardar tus USDT de forma segura</li>
                                                <li>✅ Participar en SAN Digital</li>
                                                <li>✅ Recibir pagos automáticos</li>
                                            </ul>
                                            <p><strong>Recomendamos MetaMask</strong> - Es gratis y fácil de usar.</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="connect-hint">
                                    Necesitas conectar tu wallet para acceder a la plataforma
                                </p>
                                <a href="/info" className="faq-link">
                                    📚 Ver Información Completa y FAQ →
                                </a>
                            </div>
                        ) : (
                            <div className="connected-section">
                                <div className="success-message">
                                    ✅ Wallet Conectada - Acceso Permitido
                                </div>
                                <a href="/" className="enter-button">
                                    Conecta tu Wallet →
                                </a>
                            </div>
                        )}
                        */}
                    </div>
                </div>
            </section>

            {/* Información Esencial */}
            <section className="essential-info">
                <div className="welcome-container">
                    <h2>¿Qué es SAN Digital?</h2>
                    <div className="info-grid info-grid-4">
                        <div className="info-card">
                            <div className="info-icon">🎯</div>
                            <h3>ROSCA Digital Mejorada</h3>
                            <p>Basado en el sistema tradicional de ahorro colectivo (ROSCA), pero evolucionado con blockchain: sin intermediarios, 100% transparente y matemáticamente sostenible.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🔄</div>
                            <h3>Todos Reciben</h3>
                            <p>Cada participante recibe pagos globales automáticos. Nadie se queda sin recibir. Sistema matemáticamente sostenible.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🛡️</div>
                            <h3>Seguridad Garantizada</h3>
                            <p>Contratos inteligentes auditados en opBNB. Código inmutable y verificable. Sin posibilidad de manipulación.</p>
                        </div>
                        <div className="info-card info-card-highlight">
                            <div className="info-icon">⚡</div>
                            <h3>Red opBNB</h3>
                            <p><strong>Costos Ultra Bajos</strong> - Blockchain de alto rendimiento optimizada para transacciones rápidas y económicas. Gas mínimo, confirmaciones instantáneas, escalabilidad garantizada. Ideal para participación masiva.</p>
                            <div className="rights-badge">Powered by BNB Chain</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ¿Por qué es diferente? */}
            <section className="anti-pyramid-section">
                <div className="welcome-container">
                    <h2>¿Por qué SAN Digital es Diferente?</h2>
                    <div className="anti-pyramid-grid">
                        <div className="anti-pyramid-card">
                            <div className="card-number">1</div>
                            <h3>Sistema Matemáticamente Sostenible</h3>
                            <p>Las pirámides colapsan porque prometen retornos imposibles. SAN Digital usa un modelo ROSCA donde cada aporte se distribuye inmediatamente. No hay promesas de ganancias exponenciales.</p>
                        </div>
                        <div className="anti-pyramid-card">
                            <div className="card-number">2</div>
                            <h3>Todos Reciben Pagos Globales</h3>
                            <p>En una pirámide, solo los primeros ganan. Aquí, TODOS los participantes reciben pagos automáticos desde el inicio. El 45% de cada entrada va al fondo global que beneficia a todos.</p>
                        </div>
                        <div className="anti-pyramid-card">
                            <div className="card-number">3</div>
                            <h3>Código Inmutable en Blockchain</h3>
                            <p>Las pirámides dependen de operadores que pueden huir con el dinero. SAN Digital está en contratos inteligentes verificables. Nadie puede modificar las reglas ni robar fondos.</p>
                        </div>
                        <div className="anti-pyramid-card">
                            <div className="card-number">4</div>
                            <h3>Sistema Lineal por Turno</h3>
                            <p>El sistema funciona de forma lineal, cola por turno de forma global. Cualquier registro comprime la dispersión y activa el contrato a nivel mundial. Participación individual, sin necesidad de reclutar. Sistema descentralizado y automático.</p>
                        </div>
                    </div>
                    <div className="key-difference">
                        <strong>Diferencia Clave:</strong> Las pirámides prometen dinero fácil sin fundamento. SAN Digital es un sistema de ahorro colectivo transparente donde cada USDT que entra se distribuye según reglas matemáticas inmutables.
                    </div>
                </div>
            </section>

            {/* Comparativa ROSCA */}
            <section className="rosca-comparison">
                <div className="welcome-container">
                    <h2>Evolución del Sistema ROSCA</h2>
                    <p className="section-subtitle">
                        SAN Digital toma lo mejor de las ROSCAs tradicionales y lo mejora con blockchain
                    </p>
                    <div className="comparison-table">
                        <div className="comparison-row">
                            <div className="comparison-item traditional">
                                <h4>📋 ROSCA Tradicional</h4>
                                <p className="comparison-description">Sistema probado por generaciones</p>
                                <ul>
                                    <li>✓ Concepto de ahorro colectivo</li>
                                    <li>✓ Ayuda mutua entre participantes</li>
                                    <li>⚠️ Requiere organizador de confianza</li>
                                    <li>⚠️ Proceso manual</li>
                                    <li>⚠️ Limitado a grupos pequeños</li>
                                </ul>
                            </div>
                            <div className="comparison-item digital">
                                <h4>✅ SAN Digital (Blockchain)</h4>
                                <p className="comparison-description">Mismo concepto, tecnología superior</p>
                                <ul>
                                    <li>✓ Ahorro colectivo automatizado</li>
                                    <li>✓ Ayuda mutua sin intermediarios</li>
                                    <li>✓ Smart contracts = confianza garantizada</li>
                                    <li>✓ 100% automático y transparente</li>
                                    <li>✓ Escalable globalmente</li>
                                    <li>Imposible robar o manipular fondos</li>
                                    <li>Pagos instantáneos en blockchain</li>
                                    <li>Código verificable públicamente</li>
                                    <li>Escala global sin límites</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Indicadores de Confianza */}
            <section className="trust-indicators">
                <div className="welcome-container">
                    <h2>Indicadores de Confianza</h2>
                    <div className="trust-grid">
                        <div className="trust-item">
                            <span className="trust-icon">🔍</span>
                            <h4>Contratos Verificados</h4>
                            <p>Código fuente público en opBNBScan</p>
                        </div>
                        <div className="trust-item">
                            <span className="trust-icon">📖</span>
                            <h4>Open Source</h4>
                            <p>Cualquiera puede auditar el código</p>
                        </div>
                        <div className="trust-item">
                            <span className="trust-icon">🧮</span>
                            <h4>Matemática Clara</h4>
                            <p>Distribución 50% turno + 45% global + 5% gas</p>
                        </div>
                        <div className="trust-item">
                            <span className="trust-icon">🔐</span>
                            <h4>Sin Custodios</h4>
                            <p>Tus fondos siempre bajo tu control</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enlace a más información */}
            <section className="more-info-section">
                <div className="welcome-container">
                    <div className="info-cta">
                        <p>¿Quieres conocer más detalles técnicos antes de conectar?</p>
                        <a href="/info" className="info-link">
                            📚 Ver Información Completa y FAQ →
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="welcome-footer">
                <div className="welcome-container">
                    <p className="footer-text">SAN Digital 2026 — Sistema de participación comunitaria</p>
                    <p className="disclaimer">
                        No es una inversión. No promete rentabilidad. Participación voluntaria bajo tu propia responsabilidad.
                    </p>
                </div>
            </footer>
        </div>
    )
}
