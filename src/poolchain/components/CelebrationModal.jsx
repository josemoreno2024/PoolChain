import { useEffect } from 'react';
import './CelebrationModal.css';

export function CelebrationModal({ isOpen, onClose, winners, userGroup }) {
    useEffect(() => {
        if (isOpen) {
            // Auto-close after animation (8 seconds)
            const timer = setTimeout(() => {
                onClose();
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="celebration-overlay">
            <div className="celebration-modal">
                {/* Confetti Animation */}
                <div className="confetti-container">
                    {[...Array(100)].map((_, i) => (
                        <div key={i} className="confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            backgroundColor: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)]
                        }}></div>
                    ))}
                </div>

                {/* Fireworks */}
                <div className="fireworks">
                    <div className="firework"></div>
                    <div className="firework"></div>
                    <div className="firework"></div>
                </div>

                {/* Main Content */}
                <div className="celebration-content">
                    <div className="celebration-icon-burst">🎉</div>

                    <h1 className="celebration-title">
                        ¡SORTEO COMPLETADO!
                    </h1>

                    <div className="celebration-subtitle">
                        <span className="explosion-text">💥 ¡BOOM! 💥</span>
                        <p>100 Ganadores Seleccionados</p>
                    </div>

                    {/* Winners Stats */}
                    <div className="winners-stats">
                        <div className="stat-bubble group-a-bubble">
                            <div className="bubble-number">10</div>
                            <div className="bubble-label">Grupo A 🏆</div>
                        </div>
                        <div className="stat-bubble group-b-bubble">
                            <div className="bubble-number">20</div>
                            <div className="bubble-label">Grupo B 🥇</div>
                        </div>
                        <div className="stat-bubble group-c-bubble">
                            <div className="bubble-number">30</div>
                            <div className="bubble-label">Grupo C 🥈</div>
                        </div>
                        <div className="stat-bubble group-d-bubble">
                            <div className="bubble-number">40</div>
                            <div className="bubble-label">Grupo D 🥉</div>
                        </div>
                    </div>

                    {/* User Status */}
                    {userGroup && (
                        <div className="user-winner-banner">
                            <div className="winner-crown">👑</div>
                            <div className="winner-text">
                                <h3>¡FELICIDADES, GANASTE!</h3>
                                <p>Grupo {userGroup.name}</p>
                            </div>
                            <div className="winner-crown">👑</div>
                        </div>
                    )}

                    <div className="celebration-message">
                        <p>🎊 La blockchain ha hablado 🎊</p>
                        <p className="celebration-submessage">Verifica tus premios abajo</p>
                    </div>
                </div>

                {/* Animated Stars */}
                <div className="stars-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="star" style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>⭐</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
