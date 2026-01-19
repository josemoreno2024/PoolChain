import React from 'react';
import { formatTimeAgo, formatFrequency } from '../utils/historyUtils';
import './SystemActivityModal.css';

export function SystemActivityModal({
    isOpen,
    onClose,
    activity,
    currentRound,
    participantCount,
    maxSlots
}) {
    if (!isOpen || !activity) return null;

    const explorerBaseUrl = 'https://testnet.opbnbscan.com/tx/';

    return (
        <div className="activity-modal-overlay" onClick={onClose}>
            <div className="activity-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="activity-modal-header">
                    <h2>📊 Actividad del Sistema PoolChain</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="activity-modal-body">
                    {/* Estado Actual */}
                    <div className="activity-section">
                        <h3>🟢 Estado Actual</h3>
                        <div className="activity-stats">
                            <div className="stat-row">
                                <span className="stat-label">Contrato:</span>
                                <span className="stat-value status-active">✓ Activo</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Sorteo actual:</span>
                                <span className="stat-value">#{currentRound}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Estado:</span>
                                <span className="stat-value">
                                    {participantCount >= maxSlots ? '✓ Lleno' : '⏳ Recibiendo participantes'}
                                    ({participantCount}/{maxSlots})
                                </span>
                            </div>
                            {activity.lastRoundDate && (
                                <div className="stat-row">
                                    <span className="stat-label">Última ejecución:</span>
                                    <span className="stat-value">{formatTimeAgo(activity.lastRoundDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Estadísticas Generales */}
                    <div className="activity-section">
                        <h3>📊 Estadísticas Generales</h3>
                        <div className="activity-stats">
                            <div className="stat-row">
                                <span className="stat-label">Sorteos ejecutados:</span>
                                <span className="stat-value highlight">{activity.totalExecuted}</span>
                            </div>
                            {activity.firstRoundDate && (
                                <div className="stat-row">
                                    <span className="stat-label">Primer sorteo:</span>
                                    <span className="stat-value">
                                        {new Date(activity.firstRoundDate * 1000).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                            {activity.lastRoundDate && (
                                <div className="stat-row">
                                    <span className="stat-label">Último sorteo:</span>
                                    <span className="stat-value">
                                        {new Date(activity.lastRoundDate * 1000).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                            {activity.avgFrequencySeconds > 0 && (
                                <div className="stat-row">
                                    <span className="stat-label">Frecuencia observada:</span>
                                    <span className="stat-value">{formatFrequency(activity.avgFrequencySeconds)}</span>
                                </div>
                            )}
                            <div className="stat-row">
                                <span className="stat-label">Premios reclamados:</span>
                                <span className="stat-value highlight">{activity.totalClaimedUSDT} USDT</span>
                                <span className="stat-note">(verificable)</span>
                            </div>
                        </div>
                    </div>

                    {/* Últimos Sorteos */}
                    {activity.recentRounds.length > 0 && (
                        <div className="activity-section">
                            <h3>🎲 Últimos Sorteos</h3>
                            <div className="recent-rounds-list">
                                {activity.recentRounds.map((round) => (
                                    <div key={round.round} className="round-item">
                                        <div className="round-header">
                                            <span className="round-number">🎲 Sorteo #{round.round}</span>
                                            <span className="round-status">✅ Completado</span>
                                        </div>
                                        <div className="round-info">
                                            <span className="round-date">
                                                {new Date(round.timestamp * 1000).toLocaleString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <a
                                                href={`${explorerBaseUrl}${round.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="explorer-link"
                                            >
                                                🔗 Ver en explorador
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nota de Verificación */}
                    <div className="verification-note">
                        <span className="note-icon">🔎</span>
                        <p>
                            Todos los datos mostrados se obtienen directamente de eventos públicos
                            del blockchain y pueden verificarse en el explorador.
                        </p>
                    </div>
                </div>

                <div className="activity-modal-footer">
                    <button className="close-footer-btn" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
