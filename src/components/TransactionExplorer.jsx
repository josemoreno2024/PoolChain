import { useState } from 'react'
import './TransactionExplorer.css'

export default function TransactionExplorer({ userAddress, chainId }) {
    const [showGuide, setShowGuide] = useState(false)

    const getExplorerUrl = () => {
        if (chainId === 11155111) {
            return `https://sepolia.etherscan.io/address/${userAddress}#tokentxns`
        }
        // Mainnet u otras redes
        return `https://etherscan.io/address/${userAddress}#tokentxns`
    }

    const openExplorer = () => {
        window.open(getExplorerUrl(), '_blank')
    }

    return (
        <>
            <div className="transaction-explorer">
                <button className="explorer-button" onClick={openExplorer}>
                    <span className="explorer-icon">🔍</span>
                    <span className="explorer-text">Ver Mis Transacciones</span>
                    <span className="explorer-badge">Blockchain</span>
                </button>
                <button className="guide-button" onClick={() => setShowGuide(true)}>
                    <span className="guide-icon">❓</span>
                    <span className="guide-text">¿Cómo verificar?</span>
                </button>
            </div>

            {showGuide && (
                <div className="guide-modal-overlay" onClick={() => setShowGuide(false)}>
                    <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="guide-header">
                            <h2>🔍 Cómo Verificar Tus Transacciones</h2>
                            <button className="guide-close" onClick={() => setShowGuide(false)}>×</button>
                        </div>
                        <div className="guide-body">
                            <div className="guide-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h3>Haz click en "Ver Mis Transacciones"</h3>
                                    <p>Se abrirá Etherscan, el explorador oficial de blockchain de Ethereum.</p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h3>Verás la pestaña "Token Transfers (ERC-20)"</h3>
                                    <p>Se abrirá directamente en las transacciones de tokens (USDT). Verás todas tus transferencias ordenadas por fecha.</p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h3>Identifica tu transacción</h3>
                                    <p>Busca transacciones con el contrato SanDigital. Verás:</p>
                                    <ul>
                                        <li>✅ <strong>Success</strong> = Transacción exitosa</li>
                                        <li>⏳ <strong>Pending</strong> = En proceso</li>
                                        <li>❌ <strong>Failed</strong> = Falló (no se cobró gas)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="guide-step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h3>Verifica los detalles</h3>
                                    <p>Haz click en el hash de la transacción para ver:</p>
                                    <ul>
                                        <li>💰 Monto transferido</li>
                                        <li>⛽ Gas pagado</li>
                                        <li>📅 Fecha y hora exacta</li>
                                        <li>✅ Estado de confirmación</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="guide-tip">
                                <strong>💡 Tip:</strong> Todas las transacciones en blockchain son públicas y permanentes.
                                Si tu transacción aparece como "Success", tus fondos están seguros en el contrato.
                            </div>
                        </div>
                        <div className="guide-footer">
                            <button className="guide-action-button" onClick={openExplorer}>
                                🚀 Abrir Etherscan Ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
