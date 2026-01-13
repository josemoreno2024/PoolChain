import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import Welcome from './components/Welcome'
import Home from './components/Home'
import { GlobalAdminButton } from './components/GlobalAdminButton'
import { DisconnectButton } from './components/DisconnectButton'
import { AdminRoute } from './components/AdminRoute'
import WalletSelector from './components/WalletSelector'
import NetworkDetector from './components/NetworkDetector'
import NetworkGuide from './components/NetworkGuide'
import TierSelector from './components/TierSelector'
import { TierPage } from './components/TierPage'

function App() {
    const { address, isConnected, chain } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()

    // Estado que SOLO cambia cuando el usuario hace clic en "Conectar"
    const [userWantsToConnect, setUserWantsToConnect] = useState(false)

    // Manejar conexión de wallet - SOLO cuando usuario hace clic
    const handleConnect = () => {
        setUserWantsToConnect(true)

        const injectedConnector = connectors.find(c => c.id === 'injected')
        if (injectedConnector) {
            connect({ connector: injectedConnector })
        } else {
            alert('MetaMask no detectado. Por favor instala MetaMask.')
            setUserWantsToConnect(false)
        }
    }

    // Estados para wallet selector y network guide
    const [showWalletSelector, setShowWalletSelector] = useState(false)
    const [showNetworkGuide, setShowNetworkGuide] = useState(false)
    const [defaultNetwork, setDefaultNetwork] = useState('opBNB')

    // Manejar conexión - mostrar selector de wallet
    const handleConnectClick = () => {
        setShowWalletSelector(true)
    }

    // Cuando se conecta exitosamente
    const handleWalletConnected = () => {
        setUserWantsToConnect(true)
    }

    // Mostrar guía de red
    const handleShowNetworkGuide = (network = 'opBNB') => {
        setDefaultNetwork(network)
        setShowNetworkGuide(true)
    }

    // Manejar desconexión
    const handleDisconnect = () => {
        setUserWantsToConnect(false)
        disconnect()
    }

    // AUTENTICACIÓN SIMPLIFICADA: Solo requiere wallet conectada
    const isAuthenticated = isConnected && userWantsToConnect

    return (
        <BrowserRouter>
            {/* Botón de admin global - aparece cuando wallet de admin está conectada */}
            <GlobalAdminButton />

            {/* Botón de desconexión - aparece cuando wallet está conectada */}
            <DisconnectButton />

            {/* Wallet Selector Modal */}
            <WalletSelector
                isOpen={showWalletSelector}
                onClose={() => setShowWalletSelector(false)}
                onConnected={handleWalletConnected}
            />

            {/* Network Guide Modal - Solo en producción (opBNB), no en Sepolia */}
            {chain?.id !== 11155111 && (
                <NetworkGuide
                    isOpen={showNetworkGuide}
                    onClose={() => setShowNetworkGuide(false)}
                    defaultNetwork={defaultNetwork}
                />
            )}

            {/* Network Detector Banner (solo si conectado) */}
            {isConnected && (
                <NetworkDetector onShowGuide={handleShowNetworkGuide} />
            )}

            <Routes>
                {/* Ruta principal - Welcome o TierSelector según autenticación */}
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <TierSelector />
                            : <Welcome
                                onConnectWallet={handleConnectClick}
                                isConnected={isConnected}
                            />
                    }
                />

                {/* Ruta de Información/Educación */}
                <Route
                    path="/info"
                    element={
                        <Home
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />

                {/* Rutas de Tiers - Públicas */}
                <Route
                    path="/micro"
                    element={
                        <TierPage
                            tierId="micro"
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />
                <Route
                    path="/standard"
                    element={
                        <TierPage
                            tierId="standard"
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />
                <Route
                    path="/plus"
                    element={
                        <TierPage
                            tierId="plus"
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />
                <Route
                    path="/premium"
                    element={
                        <TierPage
                            tierId="premium"
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />
                <Route
                    path="/elite"
                    element={
                        <TierPage
                            tierId="elite"
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />
                <Route
                    path="/ultra"
                    element={
                        <TierPage
                            tierId="ultra"
                            onConnectWallet={handleConnectClick}
                            onShowNetworkGuide={handleShowNetworkGuide}
                        />
                    }
                />

                {/* Ruta protegida: Admin Panel con autenticación */}
                <Route path="/admin" element={<AdminRoute />} />

                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
