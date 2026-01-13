import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import './HomePage.css';

export function HomePage() {
    return (
        <div className="home-page">
            <div className="hero-section">
                <h1 className="hero-title">Bienvenido a PoolChain Raffles</h1>
                <p className="hero-subtitle">
                    Sistema revolucionario con múltiples ganadores - Fee 5%
                </p>
            </div>

            <div className="products-grid">
                <ProductCard
                    title="PoolChain Raffles"
                    description="Sistema único con grupos de ganadores (17-60 ganadores por sorteo según nivel). El 95% del fondo se distribuye entre participantes."
                    features={[
                        { bold: "17-60 ganadores", text: " por sorteo según nivel" },
                        { bold: "95% retorna", text: " en premios y devoluciones" },
                        { bold: "Nadie pierde todo", text: " - recuperación mínima 52%" },
                        { bold: "Chainlink VRF", text: " - selección verificable" }
                    ]}
                    link="/poolchain"
                    infoLink="/poolchain-info"
                />
            </div>
        </div>
    );
}

function ProductCard({ title, description, features, link, infoLink }) {
    const navigate = useNavigate();
    const { isConnected } = useAccount();

    const handleEnterClick = (e) => {
        e.preventDefault();
        if (isConnected) {
            // Si está conectado, va a la plataforma
            navigate(link);
        } else {
            // Si NO está conectado, muestra un mensaje o scroll al header
            alert('Por favor, conecta tu wallet usando el botón "Connect Wallet" en la parte superior derecha.');
        }
    };

    return (
        <div className="product-card-gold">
            <div className="card-content">
                <h2 className="card-title-gold">{title}</h2>
                <p className="card-description-gold">{description}</p>

                <ul className="features-list">
                    {features.map((feature, index) => (
                        <li key={index} className="feature-item-gold">
                            <span className="check-icon-gold">✓</span>
                            <span>
                                <strong>{feature.bold}</strong>
                                {feature.text}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="card-actions">
                    <button onClick={handleEnterClick} className="enter-btn-gold">
                        Entrar a la Plataforma →
                    </button>
                    {infoLink && (
                        <Link to={infoLink} className="info-btn-gold">
                            📚 Ver Información Completa
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
