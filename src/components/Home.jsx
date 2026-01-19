import './Home.css'
import FAQ from './FAQ'

export default function Home({ onConnectWallet, onShowNetworkGuide }) {
    return (
        <div className="home">
            <section className="hero" style={{ padding: '40px 20px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <div className="container">
                    <div className="hero-content fade-in" style={{ textAlign: 'center' }}>
                        <h1>📚 Información del Sistema</h1>
                        <p className="subtitle">
                            Aprende cómo funciona SAN Digital 2026 antes de participar
                        </p>
                        <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 32px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
                            ← Volver a Selección de Tiers
                        </a>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="container">
                    <h2 className="text-center mb-xl">¿Cómo funciona?</h2>
                    <div className="steps">
                        <div className="step card">
                            <div className="step-number">1</div>
                            <h3>Aporte único</h3>
                            <p>Elige tu tier (10, 20, 30, 40, 50 o 100 USDT) y entra una sola vez. Sin cuotas recurrentes. 100% descentralizado y blindado en blockchain.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">2</div>
                            <h3>Distribución automática</h3>
                            <p>~50% al turno actual, ~45% al global (todos acumulan), $1 gas del sistema.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">3</div>
                            <h3>Acumulación progresiva</h3>
                            <p>Todos acumulan desde el inicio. El turno avanza cuando alguien alcanza la salida (2x).</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">4</div>
                            <h3>Retiro manual</h3>
                            <p>Usa claim() cuando quieras retirar tu saldo acumulado. Sin restricciones.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">5</div>
                            <h3>Posiciones ilimitadas</h3>
                            <p>Puedes crear múltiples posiciones. Cada una acumula independientemente.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">6</div>
                            <h3>Transparencia total</h3>
                            <p>Código verificable en blockchain. Matemática sostenible: aporte = retorno potencial.</p>
                        </div>
                    </div>
                </div>
            </section>

            <FAQ />

            <section className="back-to-tiers-section" style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
                <div className="container">
                    <a href="/" style={{ display: 'inline-block', padding: '16px 40px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1.1rem', transition: 'all 0.3s' }}>
                        ← Volver a Selección de Tiers
                    </a>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <p>SAN Digital 2026 — Sistema de participación comunitaria</p>
                    <p className="disclaimer">
                        No es una inversión. No promete rentabilidad. Participación voluntaria bajo tu propia responsabilidad.
                    </p>
                </div>
            </footer>
        </div>
    )
}
