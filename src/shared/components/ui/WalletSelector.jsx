import { useState } from 'react'
import { useConnect } from 'wagmi'
import './WalletSelector.css'

export default function WalletSelector({ isOpen, onClose, onConnected }) {
    const { connect, connectors, isPending } = useConnect()
    const [selectedWallet, setSelectedWallet] = useState(null)

    if (!isOpen) return null

    const walletInfo = {
        'injected': {
            name: 'MetaMask / SafePal',
            icon: '🦊',
            description: 'Extensión de navegador',
            installUrl: 'https://metamask.io/download/'
        },
        'walletConnect': {
            name: 'Wallet Móvil (QR)',
            icon: '📱',
            description: 'Escanea código QR desde tu móvil',
            installUrl: 'https://walletconnect.com/'
        },
        'coinbaseWallet': {
            name: 'Coinbase Wallet',
            icon: '💙',
            description: 'Wallet de Coinbase',
            installUrl: 'https://www.coinbase.com/wallet'
        }
    }

    const handleConnect = async (connector) => {
        console.log('🔵 handleConnect called with connector:', connector.id)
        try {
            setSelectedWallet(connector.id)
            console.log('🔵 Calling connect...')
            await connect({ connector })
            console.log('✅ Connected successfully!')
            onConnected?.()
            onClose()
        } catch (error) {
            console.error('❌ Error connecting:', error)
            setSelectedWallet(null)
        }
    }

    return (
        <div className="wallet-selector-overlay" onClick={onClose}>
            <div className="wallet-selector-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wallet-selector-header">
                    <h2>Conectar tu Wallet</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="wallet-selector-body">
                    <p className="wallet-selector-description">
                        Selecciona tu wallet preferida para conectarte a SanDigital2026
                    </p>

                    <div className="wallet-list">
                        {connectors
                            .filter((connector) => {
                                // Solo mostrar 'injected' (MetaMask/SafePal)
                                return connector.id === 'injected'
                            })
                            .map((connector) => {
                                const info = walletInfo[connector.id] || {
                                    name: connector.name,
                                    icon: '🔐',
                                    description: 'Wallet compatible'
                                }

                                // Definir ayuda específica para cada wallet
                                const helpContent = {
                                    'injected': {
                                        title: 'MetaMask / SafePal',
                                        text: 'Extensiones de navegador más populares. MetaMask es la wallet más usada en el mundo. SafePal es una alternativa segura y fácil de usar.'
                                    },
                                    'walletConnect': {
                                        title: 'Conexión Móvil con QR',
                                        text: 'Conecta tu wallet móvil (MetaMask, Trust Wallet, SafePal, etc.) escaneando un código QR. Funciona con cualquier wallet compatible con WalletConnect.'
                                    },
                                    'default': {
                                        title: 'Wallet Compatible',
                                        text: 'Cualquier wallet compatible con Web3 puede conectarse. Asegúrate de tener una instalada en tu navegador.'
                                    }
                                }

                                const help = helpContent[connector.id] || helpContent['default']

                                return (
                                    <div key={connector.id} className="wallet-option-wrapper">
                                        <button
                                            onClick={() => handleConnect(connector)}
                                            disabled={isPending || selectedWallet === connector.id}
                                            className="wallet-option"
                                        >
                                            <div className="wallet-icon">{info.icon}</div>
                                            <div className="wallet-info">
                                                <div className="wallet-name">{info.name}</div>
                                                <div className="wallet-description">{info.description}</div>
                                            </div>
                                            {selectedWallet === connector.id && (
                                                <div className="wallet-loading">⏳</div>
                                            )}
                                        </button>
                                        <div className="wallet-help-tooltip">
                                            <button className="wallet-help-icon" type="button">?</button>
                                            <div className="wallet-tooltip-content">
                                                <h4>{help.title}</h4>
                                                <p>{help.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>

                    <div className="wallet-help">
                        <p>¿No tienes una wallet?</p>
                        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                            Instalar MetaMask
                        </a>
                        {' · '}
                        <a href="https://www.safepal.com/download" target="_blank" rel="noopener noreferrer">
                            Instalar SafePal
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
