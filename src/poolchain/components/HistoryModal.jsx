import React, { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { fetchUserLotteryHistory, getCachedHistory, setCachedHistory } from '../utils/historyUtils';
import { getDeployBlock } from '../config/deployBlocks';
import './HistoryModal.css';

export function HistoryModal({ isOpen, onClose, poolChainAddress, networkKey, userAddress }) {
    const [lotteries, setLotteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRound, setSelectedRound] = useState(null);

    const publicClient = usePublicClient();

    useEffect(() => {
        if (isOpen && publicClient && userAddress) {
            loadHistory();
        }
    }, [isOpen, publicClient, userAddress]);

    const loadHistory = async () => {
        setLoading(true);

        // Intentar cargar desde cache primero (cache por usuario)
        const cacheKey = `${networkKey}_${userAddress}`;
        const cached = getCachedHistory(cacheKey);
        if (cached) {
            setLotteries(cached);
            setLoading(false);
            return;
        }

        // Leer historial PERSONAL desde blockchain
        const fromBlock = getDeployBlock(networkKey);
        const history = await fetchUserLotteryHistory(publicClient, poolChainAddress, userAddress, fromBlock);

        setLotteries(history);
        setCachedHistory(cacheKey, history);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="history-modal-overlay" onClick={onClose}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h2>📜 Mi Historial</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="history-modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando tu historial desde blockchain...</p>
                        </div>
                    ) : lotteries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🎲</div>
                            <h3>Aún no has participado</h3>
                            <p>Cuando compres tickets en un sorteo, tu historial aparecerá aquí</p>
                        </div>
                    ) : (
                        <div className="lotteries-list">
                            {lotteries.map((lottery) => (
                                <div key={lottery.round} className="lottery-card">
                                    <div className="lottery-header">
                                        <span className="lottery-round">🎲 Sorteo #{lottery.round}</span>
                                        <span className="lottery-date">
                                            {new Date(lottery.timestamp * 1000).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    <div className="lottery-info">
                                        <div className="lottery-stats">
                                            <span className="stat-item">
                                                🎫 Compraste: <strong>{lottery.ticketsPurchased} ticket{lottery.ticketsPurchased !== 1 ? 's' : ''}</strong>
                                            </span>
                                            <span className="stat-item">
                                                💰 Invertiste: <strong>{lottery.totalCost} USDT</strong>
                                            </span>
                                            <span className="stat-item">
                                                🏆 Ganaste: <strong>{lottery.prizeWon} USDT</strong>
                                            </span>
                                        </div>
                                        <span className={`lottery-status status-${lottery.status.toLowerCase().replace(' ', '-')}`}>
                                            {lottery.status === 'Reclamado' ? '✅ Reclamado' :
                                                lottery.status === 'Pendiente' ? '💎 Pendiente' :
                                                    '○ Sin premio'}
                                        </span>
                                    </div>

                                    <button
                                        className="view-details-btn"
                                        onClick={() => setSelectedRound(lottery.round)}
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="history-modal-footer">
                    <button className="close-footer-btn" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Modal de detalles (nested modal) */}
            {selectedRound && (
                <RoundDetailsModal
                    round={selectedRound}
                    onClose={() => setSelectedRound(null)}
                />
            )}
        </div>
    );
}

function RoundDetailsModal({ round, onClose }) {
    return (
        <div className="details-modal-overlay" onClick={onClose}>
            <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="details-modal-header">
                    <h2>🎲 Sorteo #{round} - Detalles</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="details-modal-body">
                    <div className="detail-section">
                        <h3>📊 Información General</h3>
                        <p>Ronda: #{round}</p>
                        <p>Participantes: 100/100</p>
                        <p>Estado: ✅ Completado</p>
                    </div>

                    <div className="detail-section">
                        <h3>ℹ️ Nota</h3>
                        <p>
                            Los detalles completos de sorteos históricos estarán disponibles próximamente.
                            Por ahora, puedes ver la lista de sorteos completados.
                        </p>
                    </div>
                </div>

                <div className="details-modal-footer">
                    <button className="back-btn" onClick={onClose}>
                        ← Volver al Historial
                    </button>
                </div>
            </div>
        </div>
    );
}
