import React, { useState, useEffect } from 'react';
import './PositionGrid.css';

export function PositionGrid({
    occupiedPositions = [],
    userPositions = [], // Posiciones que YA compraste
    selectedPositions = [],
    onPositionToggle,
    maxSelections = 20,
    userCurrentTickets = 0
}) {
    const totalPositions = 100;
    const maxAllowed = Math.max(0, maxSelections - userCurrentTickets);

    const handlePositionClick = (position) => {
        // Check if position is already occupied (by ANYONE - user or others)
        // Once a position is bought, no one can buy it again
        if (occupiedPositions.includes(position) || userPositions.includes(position)) {
            return; // Can't select any occupied position
        }

        // Check if already selected
        const isSelected = selectedPositions.includes(position);

        if (isSelected) {
            // Deselect
            onPositionToggle(selectedPositions.filter(p => p !== position));
        } else {
            // Check if can select more
            if (selectedPositions.length >= maxAllowed) {
                return; // Reached limit
            }
            // Select
            onPositionToggle([...selectedPositions, position]);
        }
    };

    const getPositionClass = (position) => {
        // All occupied positions (user's or others') look the same
        if (occupiedPositions.includes(position) || userPositions.includes(position)) {
            return 'position-cell occupied';
        }
        // Selected for purchase
        if (selectedPositions.includes(position)) {
            return 'position-cell selected';
        }
        // Available
        return 'position-cell available';
    };

    const getPositionContent = (position) => {
        // All occupied positions show lock icon
        if (occupiedPositions.includes(position) || userPositions.includes(position)) {
            return <><span className="lock-icon">🔒</span><span className="position-number">{position}</span></>;
        }
        if (selectedPositions.includes(position)) {
            return <><span className="check-icon">✓</span><span className="position-number">{position}</span></>;
        }
        return <span className="position-number">{position}</span>;
    };

    return (
        <div className="position-grid-container">
            <div className="grid-header">
                <h4>🎯 Selecciona tus Posiciones</h4>
                <div className="selection-counter">
                    <span className={`counter ${selectedPositions.length >= maxAllowed ? 'limit-reached' : ''}`}>
                        {selectedPositions.length}/{maxAllowed}
                    </span>
                    {selectedPositions.length >= maxAllowed && (
                        <span className="limit-warning">Límite alcanzado</span>
                    )}
                </div>
            </div>

            <div className="grid-legend">
                <div className="legend-item">
                    <span className="legend-box available"></span>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <span className="legend-box selected"></span>
                    <span>Seleccionado</span>
                </div>
                <div className="legend-item">
                    <span className="legend-box occupied"></span>
                    <span>Ocupado</span>
                </div>
            </div>

            <div className="position-grid">
                {Array.from({ length: totalPositions }, (_, i) => i + 1).map(position => (
                    <button
                        key={position}
                        className={getPositionClass(position)}
                        onClick={() => handlePositionClick(position)}
                        disabled={occupiedPositions.includes(position) ||
                            userPositions.includes(position) ||
                            (selectedPositions.length >= maxAllowed && !selectedPositions.includes(position))}
                        title={
                            (occupiedPositions.includes(position) || userPositions.includes(position))
                                ? `Posición ${position} - Ocupada`
                                : selectedPositions.includes(position)
                                    ? `Posición ${position} - Seleccionada (click para deseleccionar)`
                                    : `Posición ${position} - Disponible (click para seleccionar)`
                        }
                    >
                        {getPositionContent(position)}
                    </button>
                ))}
            </div>

            {selectedPositions.length > 0 && (
                <div className="selected-positions-summary">
                    <h5>📋 Posiciones Seleccionadas:</h5>
                    <div className="selected-list">
                        {selectedPositions.sort((a, b) => a - b).map(pos => (
                            <span key={pos} className="selected-badge" onClick={() => handlePositionClick(pos)}>
                                #{pos} ✕
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {selectedPositions.length === 0 && (
                <div className="empty-selection-message">
                    <p>👆 Haz click en los números para seleccionar tus posiciones favoritas</p>
                </div>
            )}
        </div>
    );
}
