import { useAccount, useDisconnect } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import './DisconnectButton.css'

export function DisconnectButton() {
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const navigate = useNavigate()

    const handleDisconnect = async () => {
        try {
            // Limpiar estado guardado primero
            localStorage.removeItem('adminAuthenticated')

            // Desconectar wallet y esperar
            await disconnect()

            // Pequeña pausa para asegurar que el estado se actualice
            setTimeout(() => {
                // Redirigir a página de bienvenida
                navigate('/', { replace: true })
            }, 100)
        } catch (error) {
            console.error('Error al desconectar:', error)
            // Redirigir de todos modos
            navigate('/', { replace: true })
        }
    }

    // Solo mostrar si está conectado
    if (!isConnected) return null

    // Formatear dirección para mostrar
    const shortAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : ''

    return (
        <div className="disconnect-button-container">
            <div className="wallet-info">
                <span className="wallet-icon">🔗</span>
                <span className="wallet-address">{shortAddress}</span>
            </div>
            <button
                onClick={handleDisconnect}
                className="disconnect-btn"
                title="Desconectar Wallet"
            >
                Desconectar
            </button>
        </div>
    )
}
