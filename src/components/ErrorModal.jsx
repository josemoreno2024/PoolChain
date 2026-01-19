import './ErrorModal.css'

export default function ErrorModal({ isOpen, onClose, title, message, details }) {
    if (!isOpen) return null

    return (
        <div className="error-modal-overlay" onClick={onClose}>
            <div className="error-modal" onClick={(e) => e.stopPropagation()}>
                <div className="error-modal-header">
                    <div className="error-icon">⚠️</div>
                    <h2>{title || 'Error'}</h2>
                    <button className="error-close" onClick={onClose}>×</button>
                </div>
                <div className="error-modal-body">
                    <p className="error-message">{message}</p>
                    {details && (
                        <details className="error-details">
                            <summary>Detalles técnicos</summary>
                            <pre>{details}</pre>
                        </details>
                    )}
                </div>
                <div className="error-modal-footer">
                    <button className="error-button" onClick={onClose}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    )
}
