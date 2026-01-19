import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { createTermsMessage, saveSignature } from '../web3/utils'
import './TermsModal.css'

export default function TermsModal({ onAccept, onCancel }) {
    const { address, chainId } = useAccount()
    const { signMessage, isPending, isError } = useSignMessage()
    const [error, setError] = useState(null)

    const handleAccept = async () => {
        if (!address || !chainId) {
            setError('Wallet no conectada')
            return
        }

        setError(null)

        try {
            const message = createTermsMessage(address, chainId)
            const signature = await signMessage({ message })
            saveSignature(address, signature, message, chainId)
            onAccept()
        } catch (err) {
            console.error('Signature error:', err)
            setError('Firma cancelada o rechazada')
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Términos y Condiciones</h2>

                <div className="terms-scroll">
                    <h3>1. Naturaleza del Sistema</h3>
                    <p>
                        SAN Digital 2026 es un sistema de participación comunitaria inspirado en el SAN tradicional,
                        ejecutado mediante un contrato inteligente en blockchain. <strong>No es una inversión</strong>,
                        no promete rentabilidad y no constituye un producto financiero regulado.
                    </p>

                    <h3>2. Participación Voluntaria</h3>
                    <p>
                        La participación es completamente voluntaria y bajo tu propia responsabilidad.
                        Al participar, reconoces que entiendes los riesgos asociados con tecnología blockchain
                        y sistemas de participación colectiva.
                    </p>

                    <h3>3. Distribución del Aporte</h3>
                    <p>
                        Cada aporte de 20 USDT se distribuye automáticamente según el modelo 10/9/1:
                    </p>
                    <ul>
                        <li><strong>10 USDT</strong> → Usuario en turno actual</li>
                        <li><strong>9 USDT</strong> → Distribución global entre todos los participantes activos</li>
                        <li><strong>1 USDT</strong> → Administración del sistema (5%)</li>
                    </ul>

                    {/* Resto de términos... */}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modal-actions">
                    <button onClick={onCancel} className="button-secondary">
                        Cancelar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="button-primary"
                        disabled={isPending}
                    >
                        {isPending ? 'Firmando...' : 'Firmar y Aceptar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
