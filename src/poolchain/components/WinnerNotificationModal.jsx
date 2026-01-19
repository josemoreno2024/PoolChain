import { useEffect } from 'react';
import './WinnerNotificationModal.css';

export function WinnerNotificationModal({ isOpen, onClose, userGroup, prize }) {
    useEffect(() => {
        if (isOpen) {
            // Auto-close after 6 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !userGroup) return null;

    const getGroupEmoji = (group) => {
        const emojis = {
            'A': '🏆',
            'B': '🥇',
            'C': '🥈',
            'D': '🥉'
        };
        return emojis[group] || '🎁';
    };

    const getGroupColor = (group) => {
        const colors = {
            'A': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'B': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            'C': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'D': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        };
        return colors[group] || colors['D'];
    };

    return (
        <div className="winner-notification-overlay">
            <div
                className="winner-notification-modal"
                style={{ background: getGroupColor(userGroup.name) }}
            >
                {/* Sparkles */}
                <div className="sparkles-container">
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="sparkle" style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>✨</div>
                    ))}
                </div>

                <div className="winner-content">
                    <div className="winner-emoji-large">
                        {getGroupEmoji(userGroup.name)}
                    </div>

                    <h2 className="winner-congrats">¡FELICIDADES!</h2>

                    <p className="winner-message">
                        Has sido seleccionado en el
                    </p>

                    <div className="winner-group-badge">
                        GRUPO {userGroup.name}
                    </div>

                    <div className="winner-prize-box">
                        <div className="prize-label">Tu Premio:</div>
                        <div className="prize-amount">{prize} USDT</div>
                        <div className="prize-icon">💰💸💰</div>
                    </div>

                    <div className="winner-instructions">
                        <p>🎊 Ve a la sección de premios para reclamar</p>
                        <p className="flash-text">¡Tu billetera ha sido bendecida! 🌟</p>
                    </div>
                </div>

                {/* Animated Coins */}
                <div className="coins-container">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="coin" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>🪙</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
