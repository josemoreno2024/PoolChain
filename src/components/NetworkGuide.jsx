import { useState } from 'react'
import './NetworkGuide.css'

const NETWORKS = {
    opBNBTestnet: {
        name: 'opBNB Testnet',
        chainId: 5611,
        rpcUrl: 'https://opbnb-testnet-rpc.bnbchain.org',
        currency: 'BNB',
        explorer: 'https://testnet.opbnbscan.com',
        gas: 'GRATIS (testnet)',
        recommended: true,
        isTestnet: true
    },
    opBNB: {
        name: 'opBNB Mainnet',
        chainId: 204,
        rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
        currency: 'BNB',
        explorer: 'https://opbnbscan.com',
        gas: '~$0.001',
        recommended: true
    },
    bsc: {
        name: 'BNB Smart Chain',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org',
        currency: 'BNB',
        explorer: 'https://bscscan.com',
        gas: '~$0.10'
    },
    polygon: {
        name: 'Polygon Mainnet',
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        currency: 'MATIC',
        explorer: 'https://polygonscan.com',
        gas: '~$0.01'
    }
}

export default function NetworkGuide({ isOpen, onClose, defaultNetwork = 'opBNB' }) {
    const [selectedWallet, setSelectedWallet] = useState('metamask')
    const [selectedNetwork, setSelectedNetwork] = useState(defaultNetwork)
    const [copied, setCopied] = useState(false)

    if (!isOpen) return null

    const network = NETWORKS[selectedNetwork]

    const copyConfig = () => {
        const config = `Nombre: ${network.name}
RPC URL: ${network.rpcUrl}
Chain ID: ${network.chainId}
Símbolo: ${network.currency}
Explorador: ${network.explorer}`

        navigator.clipboard.writeText(config)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const walletInstructions = {
        metamask: [
            'Abre tu extensión de MetaMask',
            'Haz clic en el selector de red (arriba)',
            'Selecciona "Agregar red"',
            'Haz clic en "Agregar red manualmente"',
            'Ingresa los datos de configuración',
            'Haz clic en "Guardar"',
            '¡Listo! Ya puedes usar ' + network.name
        ],
        safepal: [
            'Abre SafePal Extension',
            'Haz clic en el icono de red (arriba)',
            'Selecciona "Agregar red personalizada"',
            'Ingresa los datos de configuración',
            'Haz clic en "Agregar"',
            'Selecciona la nueva red',
            '¡Listo! Ya puedes usar ' + network.name
        ],
        coinbase: [
            'Abre Coinbase Wallet',
            'Ve a Configuración → Redes',
            'Haz clic en "Agregar red"',
            'Ingresa los datos de configuración',
            'Guarda los cambios',
            'Selecciona la nueva red',
            '¡Listo! Ya puedes usar ' + network.name
        ],
        mobile: [
            'Abre tu wallet móvil',
            'Ve a Configuración o Ajustes',
            'Busca "Redes" o "Networks"',
            'Selecciona "Agregar red personalizada"',
            'Ingresa los datos de configuración',
            'Guarda y selecciona la nueva red',
            '¡Listo! Ya puedes usar ' + network.name
        ]
    }

    return (
        <div className="network-guide-overlay" onClick={onClose}>
            <div className="network-guide-modal" onClick={(e) => e.stopPropagation()}>
                <div className="network-guide-header">
                    <h2>📚 Guía de Configuración de Redes</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="network-guide-body">
                    {/* Selector de Red */}
                    <div className="network-selector">
                        <label>Selecciona la red:</label>
                        <div className="network-tabs">
                            {Object.entries(NETWORKS).map(([key, net]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedNetwork(key)}
                                    className={`network-tab ${selectedNetwork === key ? 'active' : ''} ${net.recommended ? 'recommended' : ''}`}
                                >
                                    {net.recommended && '⭐ '}
                                    {net.name}
                                    <span className="network-gas">{net.gas}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selector de Wallet */}
                    <div className="wallet-selector-guide">
                        <label>Selecciona tu wallet:</label>
                        <div className="wallet-tabs">
                            <button
                                onClick={() => setSelectedWallet('metamask')}
                                className={selectedWallet === 'metamask' ? 'active' : ''}
                            >
                                🦊 MetaMask
                            </button>
                            <button
                                onClick={() => setSelectedWallet('safepal')}
                                className={selectedWallet === 'safepal' ? 'active' : ''}
                            >
                                🔐 SafePal
                            </button>
                            <button
                                onClick={() => setSelectedWallet('coinbase')}
                                className={selectedWallet === 'coinbase' ? 'active' : ''}
                            >
                                💙 Coinbase
                            </button>
                            <button
                                onClick={() => setSelectedWallet('mobile')}
                                className={selectedWallet === 'mobile' ? 'active' : ''}
                            >
                                📱 Móvil
                            </button>
                        </div>
                    </div>

                    {/* Datos de Configuración */}
                    <div className="network-config">
                        <div className="config-header">
                            <h3>Datos de Configuración</h3>
                            <button onClick={copyConfig} className="copy-button">
                                {copied ? '✅ Copiado' : '📋 Copiar Todo'}
                            </button>
                        </div>
                        <div className="config-data">
                            <div className="config-item">
                                <label>Nombre de la Red:</label>
                                <code>{network.name}</code>
                            </div>
                            <div className="config-item">
                                <label>RPC URL:</label>
                                <code>{network.rpcUrl}</code>
                            </div>
                            <div className="config-item">
                                <label>Chain ID:</label>
                                <code>{network.chainId}</code>
                            </div>
                            <div className="config-item">
                                <label>Símbolo de Moneda:</label>
                                <code>{network.currency}</code>
                            </div>
                            <div className="config-item">
                                <label>Explorador de Bloques:</label>
                                <code>{network.explorer}</code>
                            </div>
                        </div>
                    </div>

                    {/* Instrucciones Paso a Paso */}
                    <div className="step-by-step">
                        <h3>Pasos para Configurar</h3>
                        <ol>
                            {walletInstructions[selectedWallet].map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ol>
                    </div>

                    {/* Video Tutorial (opcional) */}
                    <div className="tutorial-links">
                        <p>¿Necesitas ayuda visual?</p>
                        <a
                            href={
                                selectedWallet === 'metamask'
                                    ? 'https://www.youtube.com/results?search_query=como+agregar+red+metamask+español'
                                    : selectedWallet === 'safepal'
                                        ? 'https://www.youtube.com/results?search_query=como+agregar+red+safepal+español'
                                        : selectedWallet === 'coinbase'
                                            ? 'https://www.youtube.com/results?search_query=como+agregar+red+coinbase+wallet+español'
                                            : 'https://www.youtube.com/results?search_query=como+agregar+red+personalizada+wallet+español'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            📺 Ver tutorial en video (Español)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
