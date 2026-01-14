import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import Welcome from './sandigital/components/Welcome'
import Home from './components/Home'
import { GlobalAdminButton } from './components/GlobalAdminButton'
import { DisconnectButton } from './components/DisconnectButton'
import { AdminRoute } from './components/AdminRoute'
import WalletSelector from './shared/components/ui/WalletSelector'
import NetworkDetector from './components/NetworkDetector'
import NetworkGuide from './components/NetworkGuide'
import TierSelector from './components/TierSelector'
import { TierPage } from './components/TierPage'
import ErrorModal from './components/ErrorModal'
import { Header } from './shared/components/common/Header'
import { HomePage } from './sandigital/pages/HomePage'
import { SanDigitalPage } from './sandigital/pages/SanDigitalPage'
import { PoolChainPage } from './poolchain/pages/PoolChainPage'
import { PoolChainInfo } from './poolchain/components/PoolChainInfo'
import { AddTestnetButton } from './components/AddTestnetButton'

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

    // Estados para errores
    const [error, setError] = useState(null)

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

    // Auto-aprobar si la wallet ya está conectada (evita que el usuario quede atrapado)
    useEffect(() => {
        if (isConnected && !userWantsToConnect) {
            setUserWantsToConnect(true)
        }
    }, [isConnected, userWantsToConnect])

    // Auto-cerrar modal de wallet cuando se conecta exitosamente
    useEffect(() => {
        if (isConnected && showWalletSelector) {
            setShowWalletSelector(false)
        }
    }, [isConnected, showWalletSelector])

    return (
        <BrowserRouter>
            {/* Botón flotante para agregar testnet */}
            <AddTestnetButton />

            {/* Header with navigation */}
            <Header />

            {/* Botón de admin global - aparece cuando wallet de admin está conectada */}
            <GlobalAdminButton />

            {/* Botón de desconexión - REMOVIDO: redundante con Header wallet button */}
            {/* <DisconnectButton /> */}

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

            {/* Error Modal */}
            <ErrorModal
                isOpen={error !== null}
                onClose={() => setError(null)}
                title={error?.title}
                message={error?.message}
                details={error?.details}
            />

            {/* Network Detector Banner (solo si conectado) */}
            {isConnected && (
                <NetworkDetector onShowGuide={handleShowNetworkGuide} />
            )}

            <Routes>
                {/* Ruta principal - HomePage con selección de productos */}
                <Route path="/" element={<HomePage />} />

                {/* SanDigital 4Funds - Selector de tiers */}
                <Route
                    path="/sandigital"
                    element={
                        isAuthenticated
                            ? <SanDigitalPage />
                            : <Welcome
                                onConnectWallet={handleConnectClick}
                                isConnected={isConnected}
                            />
                    }
                />

                {/* PoolChain Lottery */}
                <Route
                    path="/poolchain"
                    element={
                        isAuthenticated
                            ? <PoolChainPage />
                            : <Welcome
                                onConnectWallet={handleConnectClick}
                                isConnected={isConnected}
                            />
                    }
                />

                {/* PoolChain Information Page - Public */}
                <Route
                    path="/poolchain-info"
                    element={<PoolChainInfo />}
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
