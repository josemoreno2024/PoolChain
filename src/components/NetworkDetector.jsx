import { useState } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { opBNB } from '../web3/config'
import './NetworkDetector.css'

const RECOMMENDED_NETWORKS = {
    204: { name: 'opBNB', gas: '$0.001', priority: 1 },
    56: { name: 'BSC', gas: '$0.10', priority: 2 },
    137: { name: 'Polygon', gas: '$0.01', priority: 3 },
}

const NETWORK_NAMES = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    56: 'BSC',
    97: 'BSC Testnet',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
    204: 'opBNB',
    5611: 'opBNB Testnet',
    42161: 'Arbitrum',
    10: 'Optimism',
}

export default function NetworkDetector({ onShowGuide }) {
    const { isConnected } = useAccount()
    const chainId = useChainId()
    const { switchChain, isPending } = useSwitchChain()
    const [isDismissed, setIsDismissed] = useState(false)

    if (!isConnected || isDismissed) return null

    const isRecommended = RECOMMENDED_NETWORKS[chainId]
    if (isRecommended) return null // Usuario ya está en red recomendada

    const currentNetwork = NETWORK_NAMES[chainId] || `Red ${chainId}`
    const bestNetwork = RECOMMENDED_NETWORKS[204] // opBNB por defecto

    const handleSwitch = async () => {
        try {
            await switchChain({ chainId: 204 }) // opBNB
        } catch (error) {
            console.error('Error switching network:', error)
            // Si falla el switch automático, mostrar guía manual
            onShowGuide?.()
        }
    }

    const handleAddUSDT = async () => {
        try {
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3', // USDT en opBNB
                        symbol: 'USDT',
                        decimals: 18,
                        image: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
                    }
                }
            })

            if (wasAdded) {
                console.log('✅ USDT agregado a MetaMask')
            }
        } catch (error) {
            console.error('Error agregando USDT:', error)
        }
    }

    return (
        <div className="network-detector">
            <div className="network-detector-content">
                <div className="network-detector-icon">⚠️</div>
                <div className="network-detector-info">
                    <div className="network-detector-title">Red No Óptima Detectada</div>
                    <div className="network-detector-details">
                        Estás en: <strong>{currentNetwork}</strong>
                        <br />
                        Recomendado: <strong>opBNB</strong> (gas ~{bestNetwork.gas} por transacción)
                        <br />
                        <span className="auto-setup-label">⚡ Sistema automático para MetaMask</span>
                    </div>
                </div>
                <div className="network-detector-actions">
                    <button
                        onClick={handleSwitch}
                        disabled={isPending}
                        className="network-switch-button"
                        title="Cambia automáticamente a la red opBNB"
                    >
                        {isPending ? '⏳ Cambiando...' : '🌐 Cambia a Red opBNB'}
                    </button>
                    <button
                        onClick={handleAddUSDT}
                        className="network-add-usdt-button"
                        title="Importa el token USDT de opBNB a tu wallet"
                    >
                        💰 Importa USDT
                    </button>
                    <button
                        onClick={() => onShowGuide?.()}
                        className="network-guide-button"
                    >
                        Guía Manual
                    </button>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="network-dismiss-button"
                        title="Cerrar"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    )
}
