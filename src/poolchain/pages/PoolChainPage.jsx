import { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePoolChain } from '../hooks/usePoolChain';
import Tooltip from '../components/Tooltip';
import { PurchaseModal } from '../components/PurchaseModal';
import './PoolChainPage.css';

export function PoolChainPage() {
    const [selectedTier, setSelectedTier] = useState(null);
    const { address } = useAccount();
    const {
        currentPool,
        participants,
        claimable,
        buyTicket,
        claim,
        isLoading
    } = usePoolChain();

    // Definición de los 9 niveles con patrón unificado
    const tiers = [
        {
            id: 'micro',
            name: 'Micro',
            icon: '💎',
            entry: 2,
            totalPool: 200,
            maxSlots: 100,
            groupA: { count: 10, prize: 5.82 },
            groupB: { count: 20, prize: 2.91 },
            groupC: { count: 30, prize: 1.29 },
            groupD: { count: 40, return: 0.97 },
            description: 'Ideal para comenzar con bajo riesgo - 100% ganan',
            badge: null
        },
        {
            id: 'mini',
            name: 'Mini',
            icon: '🌟',
            entry: 5,
            totalPool: 500,
            maxSlots: 100,
            groupA: { count: 10, prize: 14.70 },
            groupB: { count: 20, prize: 7.35 },
            groupC: { count: 30, prize: 3.27 },
            groupD: { count: 40, return: 2.45 },
            description: 'Accesible y con buenos retornos - 100% ganan',
            badge: null
        },
        {
            id: 'basico',
            name: 'Básico',
            icon: '⭐',
            entry: 10,
            totalPool: 1000,
            maxSlots: 100,
            groupA: { count: 10, prize: 29.40 },
            groupB: { count: 20, prize: 14.70 },
            groupC: { count: 30, prize: 6.53 },
            groupD: { count: 40, return: 4.90 },
            description: 'Perfecto para probar el sistema - 100% ganan',
            badge: null
        },
        {
            id: 'estandar',
            name: 'Estándar',
            icon: '🎯',
            entry: 20,
            totalPool: 2000,
            maxSlots: 100,
            groupA: { count: 10, prize: 58.80 },
            groupB: { count: 20, prize: 29.40 },
            groupC: { count: 30, prize: 13.07 },
            groupD: { count: 40, return: 9.80 },
            description: 'El más popular y equilibrado - 100% ganan',
            badge: '⭐ Más Popular'
        },
        {
            id: 'plus',
            name: 'Plus',
            icon: '🔥',
            entry: 40,
            totalPool: 4000,
            maxSlots: 100,
            groupA: { count: 10, prize: 117.60 },
            groupB: { count: 20, prize: 58.80 },
            groupC: { count: 30, prize: 26.13 },
            groupD: { count: 40, return: 19.60 },
            description: 'Para usuarios con más capital - 100% ganan',
            badge: null
        },
        {
            id: 'premium',
            name: 'Premium',
            icon: '💫',
            entry: 50,
            totalPool: 5000,
            maxSlots: 100,
            groupA: { count: 10, prize: 147 },
            groupB: { count: 20, prize: 73.50 },
            groupC: { count: 30, prize: 32.67 },
            groupD: { count: 40, return: 24.50 },
            description: 'Balance perfecto riesgo/retorno - 100% ganan',
            badge: null
        },
        {
            id: 'elite',
            name: 'Elite',
            icon: '👑',
            entry: 100,
            totalPool: 10000,
            maxSlots: 100,
            groupA: { count: 10, prize: 297 },
            groupB: { count: 20, prize: 148.50 },
            groupC: { count: 30, prize: 66 },
            groupD: { count: 40, return: 49.50 },
            description: 'Premios grandes, emoción máxima - 100% ganan',
            badge: null
        },
        {
            id: 'vip',
            name: 'VIP',
            icon: '💎',
            entry: 200,
            totalPool: 12000,
            maxSlots: 60,
            groupA: { count: 6, prize: 594 },
            groupB: { count: 12, prize: 297 },
            groupC: { count: 18, prize: 132 },
            groupD: { count: 24, return: 99 },
            description: 'Para jugadores serios - 100% ganan',
            badge: null
        },
        {
            id: 'diamante',
            name: 'Diamante',
            icon: '💠',
            entry: 500,
            totalPool: 30000,
            maxSlots: 60,
            groupA: { count: 6, prize: 1485 },
            groupB: { count: 12, prize: 742.50 },
            groupC: { count: 18, prize: 330 },
            groupD: { count: 24, return: 247.50 },
            description: 'Modelo exclusivo 60 participantes - 100% ganan',
            badge: '🔥 Premium'
        }
    ];

    // Si hay un tier seleccionado, mostrar dashboard
    if (selectedTier) {
        return (
            <TierDashboard
                tier={selectedTier}
                onBack={() => setSelectedTier(null)}
                address={address}
            />
        );
    }

    // Si no hay tier seleccionado, mostrar grid de selección
    return (
        <div className="poolchain-page">
            <div className="poolchain-hero">
                <h1>PoolChain Sorteos</h1>
                <p className="hero-subtitle">
                    Elige el sorteo que mejor se adapte a tu perfil
                </p>
                <a href="/poolchain-info" className="info-link-hero">
                    📚 ¿Cómo funciona el sistema? Aprende más aquí →
                </a>
            </div>

            <div className="poolchain-container">
                <div className="tiers-grid">
                    {tiers.map((tier) => (
                        <TierCard
                            key={tier.id}
                            tier={tier}
                            onSelect={() => setSelectedTier(tier)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TierCard({ tier, onSelect }) {
    return (
        <div className={`tier-card ${tier.badge ? 'tier-card-featured' : ''}`}>
            {tier.badge && <div className="tier-badge">{tier.badge}</div>}

            <div className="tier-icon">{tier.icon}</div>
            <h3 className="tier-name">{tier.name}</h3>

            <div className="tier-entry">
                <span className="entry-label">Entrada</span>
                <span className="entry-amount">{tier.entry} USDT</span>
            </div>

            <p className="tier-description">{tier.description}</p>

            <div className="tier-features">
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo A: {tier.groupA.count} ganan {tier.groupA.prize} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo B: {tier.groupB.count} ganan {tier.groupB.prize} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo C: {tier.groupC.count} ganan {tier.groupC.prize} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Grupo D: {tier.groupD.count} recuperan {tier.groupD.return} USDT c/u</span>
                </div>
                <div className="feature">
                    <span className="check">✓</span>
                    <span>Gas del sistema: {tier.entry === 2 ? '3%' : tier.entry <= 50 ? '2%' : '1%'}</span>
                </div>
            </div>

            <button onClick={onSelect} className="tier-select-btn">
                Participar en {tier.name} →
            </button>
        </div>
    );
}

function TierDashboard({ tier, onBack, address }) {
    const {
        usdtBalance,
        participantCount,
        currentPool,
        poolFilled,
        winnersSelected,
        hasParticipated,
        userTicketCount,
        userTicketIds,
        userPositions,
        allTickets,
        availablePositions,
        claimableAmount,
        isApproved,
        groupAWinners,
        groupBWinners,
        groupCWinners,
        groupDWinners,
        isInGroupA,
        isInGroupB,
        isInGroupC,
        isInGroupD,
        approveUSDT,
        buySpecificPositions,
        executeDraw,
        claimPrize,
        mintTestUSDT,
        refreshAllData,
        isLoading,
        currentRound
    } = usePoolChain();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState({ title: '', message: '', icon: '' });
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showTicketWallet, setShowTicketWallet] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const showSuccess = (title, message, icon = '✅') => {
        setSuccessData({ title, message, icon });
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 4000);
    };

    const formatAddress = (addr) => {
        if (!addr) return 'No conectada';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Calculate maximum tickets user can buy
    const calculateMaxTickets = () => {
        const userBalance = parseFloat(usdtBalance) || 0;
        const ticketPrice = tier.entry;
        const currentTickets = userTicketCount || 0;

        // Max by balance
        const maxByBalance = Math.floor(userBalance / ticketPrice);

        // Max by user limit (20 total)
        const maxByUserLimit = Math.max(0, 20 - currentTickets);

        // Max by pool capacity
        const maxByPoolCapacity = Math.max(0, tier.maxSlots - participantCount);

        // Max by transaction limit (10 per transaction)
        const maxByTransaction = 10;

        // Return the minimum of all constraints
        return Math.min(maxByBalance, maxByUserLimit, maxByPoolCapacity, maxByTransaction);
    };

    const openPurchaseModal = () => {
        // Check if approved first
        if (!isApproved(tier.entry)) {
            setShowApprovalModal(true);
            return;
        }

        // Reset to 1 ticket
        setSelectedQuantity(1);
        setShowPurchaseModal(true);
    };

    const handleApprove = async () => {
        try {
            await approveUSDT('1000');
            await refreshAllData();

            // Show success message
            showSuccess(
                'Aprobación Exitosa',
                'USDT aprobado correctamente. Ahora puedes comprar tickets.',
                '🎉'
            );

            // ✅ NEW: Automatically open purchase modal after approval
            setTimeout(() => {
                setShowPurchaseModal(true);
            }, 2000); // Wait 2 seconds for user to see success message

        } catch (error) {
            setErrorMessage('❌ Error al aprobar USDT: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const handleBuyTicket = async (positions) => {
        // positions is an array of position numbers, e.g. [1, 5, 13, 42]

        // Close purchase modal
        setShowPurchaseModal(false);

        const quantity = positions.length;
        const MAX_TICKETS_PER_USER = 20;
        const currentTickets = userTicketCount || 0;

        try {
            // Call the contract function with positions array
            await buySpecificPositions(positions);

            // ✅ Refresh all data immediately after purchase
            await refreshAllData();

            // Show success notification
            const newTotal = currentTickets + quantity;
            const remaining = MAX_TICKETS_PER_USER - newTotal;
            showSuccess(
                '¡Posiciones Compradas!',
                `Compraste ${quantity} posición${quantity !== 1 ? 'es' : ''}. Ahora tienes ${newTotal} ticket${newTotal !== 1 ? 's' : ''}. Puedes comprar ${remaining} más.`,
                '🎫'
            );
        } catch (error) {
            // Enhanced error handling
            let errorMsg = '❌ Error al comprar posiciones: ';

            if (error.message.includes('insufficient')) {
                errorMsg += 'Saldo USDT insuficiente. Verifica tu balance.';
            } else if (error.message.includes('allowance')) {
                errorMsg += 'Aprobación insuficiente. Aprueba USDT nuevamente.';
            } else if (error.message.includes('rejected')) {
                errorMsg += 'Transacción rechazada por el usuario.';
            } else if (error.message.includes('occupied')) {
                errorMsg += 'Una o más posiciones ya están ocupadas.';
            } else {
                errorMsg += error.message;
            }

            setErrorMessage(errorMsg);
            setShowError(true);
            setTimeout(() => setShowError(false), 7000);
        }
    };

    const handleExecuteDraw = async () => {
        if (!window.confirm('¿Ejecutar sorteo? Esta acción seleccionará los ganadores.')) return;

        try {
            await executeDraw();
            showSuccess(
                'Sorteo Ejecutado',
                'Los ganadores han sido seleccionados exitosamente.',
                '🎲'
            );
        } catch (error) {
            setErrorMessage('❌ Error al ejecutar sorteo: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const handleClaim = async () => {
        try {
            await claimPrize();
            await refreshAllData();
            showSuccess(
                'Premio Reclamado',
                'Tu premio ha sido transferido exitosamente a tu wallet.',
                '💰'
            );
        } catch (error) {
            setErrorMessage('❌ Error al reclamar premio: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const handleMintUSDT = async () => {
        try {
            await mintTestUSDT();
            await refreshAllData();
            showSuccess(
                'USDT Recibidos',
                '1,000 USDT de prueba han sido agregados a tu wallet.',
                '🎁'
            );
        } catch (error) {
            setErrorMessage('❌ Error al obtener USDT: ' + error.message);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    const getUserGroup = () => {
        if (isInGroupA) return { name: 'A', prize: tier.groupA.prize, color: '#10b981' };
        if (isInGroupB) return { name: 'B', prize: tier.groupB.prize, color: '#3b82f6' };
        if (isInGroupC) return { name: 'C', prize: tier.groupC.prize, color: '#f59e0b' };
        if (isInGroupD) return { name: 'D', prize: tier.groupD.return, color: '#ef4444' };
        return null;
    };

    const userGroup = getUserGroup();

    return (
        <div className="tier-dashboard">
            {/* Approval Info Modal */}
            {showApprovalModal && (
                <div className="loading-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔐 Aprobación de USDT Requerida</h3>
                            <button className="modal-close" onClick={() => setShowApprovalModal(false)}>✕</button>
                        </div>
                        <div className="modal-content">
                            <div className="modal-icon">💡</div>
                            <p className="modal-message">
                                Antes de comprar tickets, necesitas <strong>aprobar el contrato</strong> para que pueda usar tus USDT.
                            </p>
                            <div className="modal-steps">
                                <h4>📋 Pasos a seguir:</h4>
                                <ol>
                                    <li>
                                        <strong>Paso 1:</strong> Haz clic en el botón <span className="highlight">"1. Aprobar USDT"</span>
                                    </li>
                                    <li>
                                        <strong>Paso 2:</strong> Confirma la transacción en tu billetera (MetaMask)
                                    </li>
                                    <li>
                                        <strong>Paso 3:</strong> Espera a que se confirme la transacción
                                    </li>
                                    <li>
                                        <strong>Paso 4:</strong> Ahora podrás comprar tickets
                                    </li>
                                </ol>
                            </div>
                            <div className="modal-note">
                                ℹ️ <strong>Nota:</strong> Solo necesitas aprobar una vez. Después podrás comprar múltiples tickets sin aprobar nuevamente.
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn secondary" onClick={() => setShowApprovalModal(false)}>
                                Entendido
                            </button>
                            <button className="modal-btn primary" onClick={() => {
                                setShowApprovalModal(false);
                                handleApprove();
                            }}>
                                ✓ Aprobar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛒 Purchase Modal - Smart Ticket Selection */}
            <PurchaseModal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                tier={tier}
                usdtBalance={usdtBalance}
                participantCount={participantCount}
                userTicketCount={userTicketCount}
                selectedQuantity={selectedQuantity}
                setSelectedQuantity={setSelectedQuantity}
                calculateMaxTickets={calculateMaxTickets}
                onConfirm={handleBuyTicket}
                isLoading={isLoading}
                availablePositions={availablePositions}
                userPositions={userPositions}
            />

            {/* Loading Overlay - Blocks interaction during transactions */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-modal">
                        <div className="loading-spinner"></div>
                        <h3>Procesando Transacción</h3>
                        <p>Por favor espera mientras se confirma en la blockchain...</p>
                        <p className="loading-note">No cierres esta ventana</p>
                    </div>
                </div>
            )}

            {/* Success Modal - Elegant & Subtle */}
            {showSuccessModal && (
                <div className="success-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="success-icon-container">
                            <div className="success-icon-circle">
                                <span className="success-icon">{successData.icon}</span>
                            </div>
                        </div>
                        <h3 className="success-title">{successData.title}</h3>
                        <p className="success-message">{successData.message}</p>
                        <div className="success-progress-bar"></div>
                    </div>
                </div>
            )}

            {/* Error Notification */}
            {showError && (
                <div className="notification error-notification">
                    {errorMessage}
                </div>
            )}

            <div className="dashboard-container">
                {/* Large Title */}
                <h1 className="page-title">Dashboard → {tier.name}</h1>
                <p className="wallet-info-text">
                    <span className="wallet-label">Wallet:</span> {formatAddress(address)}
                </p>

                {/* Back Button */}
                <button onClick={onBack} className="back-button">
                    ← Volver a Selección de Tiers
                </button>

                {/* Balance Card */}
                <div className="balance-card">
                    <div className="balance-header">
                        <h3>Balance USDT</h3>
                        <Tooltip content="Tu saldo disponible de USDT para participar en el sorteo">
                            <span className="tooltip-icon">?</span>
                        </Tooltip>
                    </div>
                    <div className="balance-amount">
                        {usdtBalance} USDT
                    </div>
                    <p className="balance-info-text">
                        Balance disponible para participar
                    </p>
                    {parseFloat(usdtBalance) === 0 && (
                        <button onClick={handleMintUSDT} className="faucet-button">
                            🎁 Obtener 1,000 USDT de Prueba
                        </button>
                    )}
                </div>

                {/* Section Header: Información del Sorteo */}
                <div className="section-header">
                    <h2>
                        <span className="section-icon">🎯</span>
                        Información del Sorteo
                    </h2>
                    <Tooltip content="Detalles sobre el sorteo seleccionado: entrada, fondo total y cupos disponibles">
                        <span className="tooltip-icon">?</span>
                    </Tooltip>
                </div>

                {/* Tier Info */}
                <div className="tier-info-summary">
                    <h2>{tier.icon} {tier.name}</h2>
                    <p className="tier-summary-desc">{tier.description}</p>
                    <div className="tier-summary-stats">
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Entrada:</span>
                                <Tooltip content="Costo de cada ticket para participar en este sorteo">
                                    <span className="tooltip-icon">?</span>
                                </Tooltip>
                            </div>
                            <span className="stat-value">{tier.entry} USDT</span>
                        </div>
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Fondos Recaudados:</span>
                                <Tooltip content="Total de USDT recaudado hasta ahora en este sorteo">
                                    <span className="tooltip-icon">?</span>
                                </Tooltip>
                            </div>
                            <span className="stat-value">{currentPool} USDT</span>
                            <span className="stat-note">de {tier.totalPool} USDT</span>
                        </div>
                        <div className="stat-item">
                            <div className="stat-header">
                                <span className="stat-label">Cupos:</span>
                                <Tooltip content="Número máximo de participantes permitidos en este sorteo">
                                    <span className="tooltip-icon">?</span>
                                </Tooltip>
                            </div>
                            <span className="stat-value">{participantCount} / {tier.maxSlots}</span>
                        </div>
                    </div>
                </div>

                {/* Section Header: Estado del Pool */}
                <div className="section-header">
                    <h2>
                        <span className="section-icon">📊</span>
                        Estado del Pool (Tiempo Real)
                    </h2>
                    <Tooltip content="Progreso actual del sorteo: participantes, fondos acumulados y estado">
                        <span className="tooltip-icon">?</span>
                    </Tooltip>
                </div>

                {/* Pool Status */}
                <div className="pool-status-card">
                    <h3>📊 Estado del Pool</h3>
                    <div className="pool-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(participantCount / tier.maxSlots) * 100}%` }}
                            ></div>
                        </div>
                        <div className="progress-text">
                            {participantCount} / {tier.maxSlots} participantes
                        </div>
                    </div>
                    <div className="pool-stats">
                        <div className="pool-stat">
                            <span>Pool Actual:</span>
                            <strong>{currentPool} USDT</strong>
                        </div>
                        <div className="pool-stat">
                            <span>Estado:</span>
                            <strong className={poolFilled ? 'status-filled' : 'status-open'}>
                                {poolFilled ? '✓ Lleno' : '○ Abierto'}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Section Header: Tu Resumen */}
                <div className="section-header">
                    <h2>
                        <span className="section-icon">📊</span>
                        Tu Resumen
                    </h2>
                    <Tooltip content="Tu estado actual en este sorteo: participación y aprobación de USDT">
                        <span className="tooltip-icon">?</span>
                    </Tooltip>
                </div>

                {/* User Status */}
                {address && (
                    <div className="user-status-card">
                        <h3>👤 Tu Estado</h3>
                        <div className="status-grid">
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Participación:</span>
                                    <Tooltip content="Indica si ya compraste al menos un ticket en este sorteo">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className={hasParticipated ? 'status-yes' : 'status-no'}>
                                    {hasParticipated ? '✓ Participando' : '○ No participando'}
                                </strong>
                            </div>
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Premios Ganados:</span>
                                    <Tooltip content="Total de USDT que has ganado en todos los sorteos">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value">
                                    {claimableAmount ? `${claimableAmount} USDT` : '0 USDT'}
                                </strong>
                                <div className="status-extra-info">
                                    <span className="extra-info-item">Sorteos Ganados: 0</span>
                                    <span className="extra-info-item">
                                        Próximo Sorteo: ~{Math.ceil((tier.maxSlots - participantCount) / 5)}h
                                    </span>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Tus Tickets:</span>
                                    <Tooltip content="Número de tickets que has comprado en este sorteo">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value">
                                    {userTicketCount || 0} ticket{userTicketCount !== 1 ? 's' : ''}
                                </strong>
                            </div>
                            <div className="status-item">
                                <div className="stat-header">
                                    <span>Total Invertido:</span>
                                    <Tooltip content="Total de USDT que has gastado en tickets de este sorteo">
                                        <span className="tooltip-icon">?</span>
                                    </Tooltip>
                                </div>
                                <strong className="status-value">
                                    {((userTicketCount || 0) * tier.entry).toFixed(2)} USDT
                                </strong>
                                <div className="status-extra-info">
                                    <span className="extra-info-item">
                                        ROI Potencial: {claimableAmount ?
                                            `+${(((parseFloat(claimableAmount) / ((userTicketCount || 1) * tier.entry)) - 1) * 100).toFixed(0)}%` :
                                            '0%'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prize History Section */}
                {address && winnersSelected && parseFloat(claimableAmount) > 0 && (
                    <div className="prize-history-card">
                        <h3>🏆 Premio en Sorteo Actual</h3>
                        <div className="prize-details">
                            <div className="prize-info-row">
                                <span className="prize-label">Sorteo:</span>
                                <span className="prize-value">#{currentRound || 1}</span>
                            </div>
                            <div className="prize-info-row">
                                <span className="prize-label">Total Ganado:</span>
                                <span className="prize-amount">{claimableAmount} USDT</span>
                            </div>
                            <div className="prize-info-row">
                                <span className="prize-label">Grupos Ganadores:</span>
                                <div className="winning-groups">
                                    {isInGroupA && <span className="group-badge group-a">A</span>}
                                    {isInGroupB && <span className="group-badge group-b">B</span>}
                                    {isInGroupC && <span className="group-badge group-c">C</span>}
                                    {isInGroupD && <span className="group-badge group-d">D</span>}
                                </div>
                            </div>
                            <div className="prize-info-row">
                                <span className="prize-label">Estado:</span>
                                <span className="prize-status pending">⏳ Pendiente Reclamar</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cumulative Earnings - Always visible when connected */}
                {address && (
                    <div className="cumulative-earnings-card">
                        <h3>💰 Ganancias Históricas Totales</h3>
                        <div className="earnings-display">
                            <div className="total-earned">
                                <span className="earnings-label">Total Acumulado:</span>
                                <span className="earnings-amount">{claimableAmount || '0.00'} USDT</span>
                            </div>
                            <p className="earnings-note">
                                Este monto se actualiza automáticamente cada vez que ganas y reclamas premios
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="actions-card">
                    <h3>⚡ Acciones</h3>

                    {!address && (
                        <p className="action-note">Conecta tu wallet para participar</p>
                    )}

                    {address && (
                        <>
                            <button
                                onClick={handleApprove}
                                className="action-btn approve-btn"
                                disabled={isLoading || isApproved(tier.entry)}
                            >
                                {isApproved(tier.entry) ? '✓ USDT Aprobado' : isLoading ? '⏳ Aprobando...' : '1. Aprobar USDT'}
                            </button>

                            {!hasParticipated && (
                                <button
                                    onClick={openPurchaseModal}
                                    className="action-btn buy-btn"
                                    disabled={isLoading || poolFilled}
                                >
                                    {isLoading ? '⏳ Comprando...' :
                                        poolFilled ? '🔒 Pool Lleno' :
                                            !isApproved(tier.entry) ? '🎫 Comprar Tickets (Requiere Aprobación)' :
                                                `🎫 Comprar Tickets`}
                                </button>
                            )}

                            {hasParticipated && !poolFilled && (
                                <>
                                    <button
                                        onClick={handleBuyTicket}
                                        className="action-btn buy-more-btn"
                                        disabled={isLoading || (userTicketCount >= 20)}
                                    >
                                        {isLoading ? '⏳ Comprando...' :
                                            (userTicketCount >= 20) ? '🔒 Límite Alcanzado (20/20)' :
                                                `🎫 Comprar Otro Ticket (${tier.entry} USDT)`}
                                    </button>

                                    <div className="purchase-limit-info">
                                        <span className="tickets-count">
                                            📊 Tus tickets: <strong>{userTicketCount || 0}/20</strong>
                                        </span>
                                        <span className="limit-note">
                                            {userTicketCount >= 20 ?
                                                '✓ Máximo alcanzado' :
                                                `Puedes comprar ${20 - (userTicketCount || 0)} más`}
                                        </span>
                                    </div>
                                </>
                            )}

                            {hasParticipated && !winnersSelected && (
                                <div className="waiting-status">
                                    ⏳ Esperando a que se llene el pool... ({participantCount}/{tier.maxSlots})
                                </div>
                            )}

                            {poolFilled && !winnersSelected && (
                                <button
                                    onClick={handleExecuteDraw}
                                    className="action-btn execute-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? '⏳ Ejecutando...' : '🎲 Ejecutar Sorteo (Admin)'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Winners Display */}
                {winnersSelected && (
                    <div className="winners-card">
                        <h3>🏆 Ganadores del Sorteo</h3>

                        {userGroup && (
                            <div className="user-winner-banner" style={{ borderColor: userGroup.color }}>
                                <span className="winner-emoji">🎉</span>
                                <div>
                                    <strong>¡Felicidades! Estás en el Grupo {userGroup.name}</strong>
                                    <p>Premio: {userGroup.prize} USDT</p>
                                </div>
                            </div>
                        )}

                        <div className="winners-grid">
                            <div className="winner-group group-a">
                                <h4>Grupo A ({groupAWinners.length})</h4>
                                <p className="group-prize">{tier.groupA.prize} USDT c/u</p>
                                <div className="winner-count">{groupAWinners.length} ganadores</div>
                            </div>
                            <div className="winner-group group-b">
                                <h4>Grupo B ({groupBWinners.length})</h4>
                                <p className="group-prize">{tier.groupB.prize} USDT c/u</p>
                                <div className="winner-count">{groupBWinners.length} ganadores</div>
                            </div>
                            <div className="winner-group group-c">
                                <h4>Grupo C ({groupCWinners.length})</h4>
                                <p className="group-prize">{tier.groupC.prize} USDT c/u</p>
                                <div className="winner-count">{groupCWinners.length} ganadores</div>
                            </div>
                            <div className="winner-group group-d">
                                <h4>Grupo D ({groupDWinners.length})</h4>
                                <p className="group-prize">{tier.groupD.return} USDT c/u</p>
                                <div className="winner-count">{groupDWinners.length} ganadores</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Claim Prize */}
                {winnersSelected && parseFloat(claimableAmount) > 0 && (
                    <div className="claim-card">
                        <h3>💎 Reclamar Premio</h3>
                        <div className="claimable-amount">
                            {claimableAmount} USDT
                        </div>
                        <button
                            onClick={handleClaim}
                            className="action-btn claim-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ Reclamando...' : '💰 Reclamar Premio'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
