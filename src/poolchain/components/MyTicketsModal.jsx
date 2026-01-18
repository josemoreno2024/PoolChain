import React, { useState } from 'react';
import './MyTicketsModal.css';

export function MyTicketsModal({
    isOpen,
    onClose,
    userPositions = [],
    currentRound = 1,
    tier = {},
    ticketPrice = 20,
    totalParticipants = 0
}) {
    const [activeTab, setActiveTab] = useState('activos');

    if (!isOpen) return null;

    // Calculate statistics
    const totalTickets = userPositions.length;
    const totalInvestment = (totalTickets * ticketPrice).toFixed(2);
    const winProbability = totalTickets > 0 ? ((totalTickets / 100) * 100).toFixed(1) : 0;
    const remainingTickets = 20 - totalTickets;

    // Sort positions for better display
    const sortedPositions = [...userPositions].sort((a, b) => Number(a) - Number(b));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="my-tickets-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>🎫 Mis Tickets</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Tab Switcher */}
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'activos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activos')}
                    >
                        Activos
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        Historial
                    </button>
                    <div
                        className="tab-indicator"
                        style={{ transform: activeTab === 'historial' ? 'translateX(100%)' : 'translateX(0)' }}
                    />
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'activos' ? (
                        <div className="activos-tab">
                            {/* Round Info */}
                            <div className="round-info-card">
                                <div className="round-badge">
                                    <span className="round-icon">🎰</span>
                                    <div className="round-details">
                                        <span className="round-label">Sorteo Actual</span>
                                        <span className="round-number">Round #{currentRound}</span>
                                    </div>
                                </div>
                            </div>

                            {totalTickets > 0 ? (
                                <>
                                    {/* Positions Display */}
                                    <div className="positions-section">
                                        <h3 className="section-title">
                                            <span className="title-icon">🎯</span>
                                            Tus Posiciones
                                        </h3>
                                        <div className="positions-grid">
                                            {sortedPositions.map((position) => (
                                                <div key={position} className="position-badge">
                                                    #{Number(position)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="stats-section">
                                        <div className="stat-card">
                                            <span className="stat-icon">🎫</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Total Tickets</span>
                                                <span className="stat-value">{totalTickets}/20</span>
                                            </div>
                                            <div className="stat-progress">
                                                <div
                                                    className="stat-progress-bar"
                                                    style={{ width: `${(totalTickets / 20) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-icon">💰</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Inversión Total</span>
                                                <span className="stat-value">{totalInvestment} USDT</span>
                                            </div>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-icon">📊</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Probabilidad de Ganar</span>
                                                <span className="stat-value">{winProbability}%</span>
                                            </div>
                                            <div className="stat-progress">
                                                <div
                                                    className="stat-progress-bar probability"
                                                    style={{ width: `${winProbability}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="info-box">
                                        <div className="info-row">
                                            <span className="info-label">🏆 Participantes Totales:</span>
                                            <span className="info-value">{totalParticipants}/100</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">🎯 Tickets Restantes:</span>
                                            <span className="info-value">{remainingTickets} disponibles</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🎫</div>
                                    <h3>No tienes tickets activos</h3>
                                    <p>Compra tickets para participar en el sorteo actual</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="historial-tab">
                            <div className="history-info-card">
                                <div className="history-icon">📜</div>
                                <h3>Historial de Participaciones</h3>
                                <p className="history-description">
                                    El contrato actual resetea los datos después de cada sorteo para optimizar costos de gas.
                                </p>
                                <div className="current-round-stats">
                                    <h4>📊 Estadísticas de la Ronda Actual</h4>
                                    <div className="history-stat-grid">
                                        <div className="history-stat">
                                            <span className="history-stat-label">Tickets Comprados</span>
                                            <span className="history-stat-value">{totalTickets}</span>
                                        </div>
                                        <div className="history-stat">
                                            <span className="history-stat-label">Inversión</span>
                                            <span className="history-stat-value">{totalInvestment} USDT</span>
                                        </div>
                                        <div className="history-stat">
                                            <span className="history-stat-label">Ronda</span>
                                            <span className="history-stat-value">#{currentRound}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="future-feature-note">
                                    <span className="note-icon">💡</span>
                                    <p>
                                        <strong>Próximamente:</strong> Actualizaremos el contrato para mantener un historial completo
                                        de todas tus participaciones y premios ganados.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
