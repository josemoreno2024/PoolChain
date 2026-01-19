import './ProcessingModal.css'

export default function ProcessingModal({ isOpen, message }) {
    if (!isOpen) return null

    return (
        <div className="processing-modal-overlay">
            <div className="processing-modal">
                <div className="processing-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <h2 className="processing-title">Procesando Transacción</h2>
                <p className="processing-message">{message}</p>
                <div className="processing-tip">
                    <strong>⏳ Por favor espera...</strong>
                    <br />
                    No cierres esta página ni actualices el navegador.
                    <br />
                    La transacción se está registrando en la blockchain.
                </div>
            </div>
        </div>
    )
}
