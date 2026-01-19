import React, { useState, useEffect } from 'react';
import { PositionGrid } from './PositionGrid';
import './PurchaseModal.css';

export function PurchaseModal({
    isOpen,
    onClose,
    tier,
    usdtBalance,
    participantCount,
    userTicketCount,
    selectedQuantity,
    setSelectedQuantity,
    calculateMaxTickets,
    onConfirm,
    isLoading,
    availablePositions = [],
    occupiedPositions = [], // Recibir directamente del hook
    userPositions = []
}) {
    const [selectedPositions, setSelectedPositions] = useState([]);

    // Clear selections when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedPositions([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const totalCost = (selectedPositions.length * tier.entry).toFixed(2);
    const userBalance = parseFloat(usdtBalance) || 0;
    const hasSufficientBalance = userBalance >= parseFloat(totalCost);
    const maxTickets = calculateMaxTickets();

    const handleConfirm = () => {
        if (selectedPositions.length > 0 && hasSufficientBalance) {
            // Ensure it's a valid array of numbers
            const positionsArray = Array.isArray(selectedPositions)
                ? selectedPositions
                : Object.values(selectedPositions);

            onConfirm(positionsArray);
        }
    };

    return (
        <div className="loading-overlay" onClick={onClose}>
            <div className="purchase-modal large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🎫 Comprar Tickets</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    {/* Ticket Price Info */}
                    <div className="price-info-box">
                        <span className="price-label">Precio por ticket:</span>
                        <span className="price-value">{tier.entry} USDT</span>
                    </div>

                    {/* Position Grid */}
                    <PositionGrid
                        occupiedPositions={occupiedPositions}
                        userPositions={userPositions}
                        selectedPositions={selectedPositions}
                        onPositionToggle={setSelectedPositions}
                        maxSelections={20}
                        userCurrentTickets={userTicketCount}
                    />

                    {/* Purchase Summary */}
                    <div className="purchase-summary">
                        <h4>📊 Resumen de Compra:</h4>
                        <div className="summary-row">
                            <span>Posiciones seleccionadas:</span>
                            <strong>{selectedPositions.length}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Precio unitario:</span>
                            <strong>{tier.entry} USDT</strong>
                        </div>
                        <div className="summary-row total">
                            <span>Total a pagar:</span>
                            <strong className="total-amount">{totalCost} USDT</strong>
                        </div>
                    </div>

                    {/* Balance & Availability Info */}
                    <div className="purchase-info">
                        <div className="info-row">
                            <span className="info-label">💰 Tu saldo:</span>
                            <span className={`info-value ${hasSufficientBalance ? 'sufficient' : 'insufficient'}`}>
                                {usdtBalance} USDT
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">📊 Cupos disponibles:</span>
                            <span className="info-value">{tier.maxSlots - participantCount} de {tier.maxSlots}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">🎫 Tus tickets actuales:</span>
                            <span className="info-value">{userTicketCount}/20</span>
                        </div>
                    </div>

                    {/* Warnings */}
                    {!hasSufficientBalance && selectedPositions.length > 0 && (
                        <div className="warning-box error">
                            ❌ <strong>Saldo insuficiente:</strong> Necesitas {totalCost} USDT pero solo tienes {usdtBalance} USDT.
                        </div>
                    )}

                    {selectedPositions.length === 0 && (
                        <div className="warning-box info">
                            💡 <strong>Selecciona tus posiciones:</strong> Haz click en los números del grid para elegir tus posiciones favoritas.
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button
                        className="modal-btn secondary"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="modal-btn primary"
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={selectedPositions.length === 0 || !hasSufficientBalance || isLoading}
                    >
                        {isLoading ? '⏳ Procesando...' :
                            selectedPositions.length === 0 ? 'Selecciona Posiciones' :
                                `✓ Comprar ${selectedPositions.length} Posición${selectedPositions.length > 1 ? 'es' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
