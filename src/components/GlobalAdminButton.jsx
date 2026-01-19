import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import './GlobalAdminButton.css'

export function GlobalAdminButton() {
    const { address, isConnected } = useAccount()
    const navigate = useNavigate()
    const [showPrompt, setShowPrompt] = useState(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    // Wallet de admin
    const ADMIN_WALLET = '0x1D6E67C6DF802A9cF021924F829513550ffE0024'
    const ADMIN_PASSWORD_HASH = 'MTIz' // "123"

    // Verificar si es admin Y wallet está conectada
    const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET.toLowerCase()

    const handleSubmit = (e) => {
        e.preventDefault()
        const inputHash = btoa(password)

        if (inputHash === ADMIN_PASSWORD_HASH) {
            // Redirigir a admin panel
            navigate('/admin')
            setShowPrompt(false)
            setError('')
            setPassword('')
        } else {
            setError('Contraseña incorrecta')
            setPassword('')
        }
    }

    // No mostrar si no es admin
    if (!isAdmin) return null

    return (
        <>
            {/* Botón flotante */}
            {!showPrompt && (
                <button
                    onClick={() => setShowPrompt(true)}
                    className="global-admin-trigger"
                    title="Acceso Administrativo"
                >
                    ⚙️
                </button>
            )}

            {/* Modal de contraseña */}
            {showPrompt && (
                <div className="global-admin-overlay">
                    <div className="global-admin-prompt">
                        <div className="prompt-header">
                            <h3>🔐 Acceso Administrativo</h3>
                            <button
                                onClick={() => {
                                    setShowPrompt(false)
                                    setError('')
                                    setPassword('')
                                }}
                                className="close-prompt"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña de administrador"
                                autoFocus
                                className="admin-password-input"
                            />
                            {error && <div className="prompt-error">{error}</div>}
                            <button type="submit" className="admin-access-btn">
                                Acceder
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
