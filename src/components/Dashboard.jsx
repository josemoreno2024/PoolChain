import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisconnect, useAccount } from 'wagmi'
import { useSanDigital } from '../sandigital/hooks/useSanDigital'
import { useClaimHistory } from '../sandigital/hooks/useClaimHistory'
import { formatUnits } from 'viem'
import './Dashboard.css'
import StatCard from './StatCard'
import AggregatedPositionCard from './AggregatedPositionCard'
import Tooltip from './Tooltip'
import SuccessToast from '../shared/components/ui/SuccessToast'
import ErrorModal from './ErrorModal'
import TransactionExplorer from '../sandigital/components/TransactionExplorer'
import ProcessingModal from '../shared/components/modals/ProcessingModal'

export default function Dashboard({ userAddress, tierConfig }) {
    const navigate = useNavigate()
    const { chain } = useAccount()
    const {
        // ... (resto de props)
        userPositionIds,
        totalBalance,
        activePositionsCount,
        turnoIndex,
        currentTurnoId,
        secondPositionId,
        thirdPositionId,
        activosCount,
        totalCompletedCycles,
        usdtBalance,
        allowance,
        closedPositionsCount,
        approveUSDT,
        hasAllowance, // Nuevo: indica si ya tiene allowance aprobado
        createPosition,
        claimPosition,
        claimAll,
        mintTestUSDT,
        pendingWithdrawals,
        claimPending,
        isPending,
        isConfirming,
        isSuccess,
        refetchPositionIds,
        refetchTotalBalance,
        refetchActiveCount,
        refetchTurno,
        refetchActivos,
        refetchUSDT,
        refetchAllowance,
        totalWithdrawn, // Para 4Funds: total retirado del sistema
    } = useSanDigital(userAddress, tierConfig)

    // Leer historial de claims desde eventos (sin gas) - Solo para tiers que no sean 4funds
    const { totalClaimed, claimCount, isLoading: isLoadingHistory } = useClaimHistory(userAddress)

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [successMessage, setSuccessMessage] = useState(null)
    const [error, setError] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Cleanup al desmontar - importante para aislar estado entre tiers
    useEffect(() => {
        console.log(`✅ Dashboard montado para tier: ${tierConfig?.name || 'unknown'}`)

        return () => {
            console.log(`🧹 Dashboard desmontado, limpiando estado de tier: ${tierConfig?.name || 'unknown'}`)
        }
    }, [tierConfig])


    // Mostrar ProcessingModal cuando la transacción está pendiente
    useEffect(() => {
        let timeoutId

        if (isPending || isConfirming) {
            setIsProcessing(true)

            // Timeout de seguridad: cerrar modal después de 30 segundos
            timeoutId = setTimeout(() => {
                setIsProcessing(false)
                setError({
                    title: 'Tiempo de espera agotado',
                    message: 'La transacción tardó demasiado en procesarse.',
                    details: 'Por favor, verifica tu wallet y vuelve a intentarlo. Si rechazaste la transacción, simplemente intenta de nuevo.'
                })
            }, 30000)
        } else if (isSuccess) {
            // Cerrar ProcessingModal cuando la transacción es exitosa
            setIsProcessing(false)
            if (timeoutId) clearTimeout(timeoutId)
        } else if (!isPending && !isConfirming && !isSuccess && isProcessing) {
            // Si no está pending, ni confirming, ni success, pero el modal está abierto
            // significa que el usuario rechazó o la transacción falló
            setIsProcessing(false)
            if (timeoutId) clearTimeout(timeoutId)
            setError({
                title: 'Transacción Cancelada',
                message: 'La transacción fue rechazada o cancelada.',
                details: 'Verifica que tengas suficiente ETH para gas y que hayas aprobado la transacción en MetaMask. Si necesitas ETH para gas, puedes obtenerlo en un faucet de Sepolia.'
            })
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [isPending, isConfirming, isSuccess, isProcessing])

    // Refetch cuando la transacción es exitosa
    useEffect(() => {
        if (isSuccess) {
            console.log('✅ Transacción exitosa, refetching datos...')
            // Mostrar mensaje de éxito
            setSuccessMessage('¡Transacción exitosa! Los datos se actualizarán en unos segundos...')
            // Mostrar indicador INMEDIATAMENTE
            setIsRefreshing(true)

            // Refetch después de 2 segundos
            setTimeout(() => {
                refetchPositionIds()
                refetchTotalBalance()
                refetchActiveCount()
                refetchTurno()
                refetchActivos()
                refetchUSDT()
                refetchAllowance()
                setIsRefreshing(false)
            }, 2000)
        }
    }, [isSuccess])

    // Format data
    const usdtBal = usdtBalance ? formatUnits(usdtBalance, 6) : '0.00'
    const totalBal = totalBalance ? formatUnits(totalBalance, 6) : '0.00'
    const needsApproval = !hasAllowance // Usar hasAllowance del hook
    const activeCount = activePositionsCount ? Number(activePositionsCount) : 0

    // Check queue position (top 3 in FIFO - Traffic Light System)
    const getQueuePosition = () => {
        if (!userPositionIds || userPositionIds.length === 0 || activeCount === 0) return null

        // Position 1 (Green - In Turn)
        if (currentTurnoId !== undefined && userPositionIds.includes(currentTurnoId)) {
            return {
                position: 1,
                color: '#00ff88',
                bgGradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                textColor: '#003d1f',
                borderColor: '#00ff88',
                icon: '🎯',
                message: '¡ESTÁS DE TURNO!',
                detail: 'Recibirás el próximo pago de 10 USDT'
            }
        }

        // Position 2 (Yellow - Next Up)
        if (secondPositionId !== undefined && userPositionIds.includes(secondPositionId)) {
            return {
                position: 2,
                color: '#ffd700',
                bgGradient: 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)',
                textColor: '#664d00',
                borderColor: '#ffd700',
                icon: '⚡',
                message: '¡SIGUIENTE EN LA FILA!',
                detail: 'Serás el próximo en recibir turno'
            }
        }

        // Position 3 (Red - Upcoming)
        if (thirdPositionId !== undefined && userPositionIds.includes(thirdPositionId)) {
            return {
                position: 3,
                color: '#ff6b6b',
                bgGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                textColor: '#4a0000',
                borderColor: '#ff6b6b',
                icon: '🔥',
                message: '¡EN CAMINO AL TURNO!',
                detail: 'Estás en la posición #3 de la cola'
            }
        }

        return null
    }

    const queuePosition = getQueuePosition()

    // DEBUG: Log queue position info
    console.log('🚦 QUEUE POSITION DEBUG:', {
        userPositionIds,
        currentTurnoId: currentTurnoId?.toString(),
        secondPositionId: secondPositionId?.toString(),
        thirdPositionId: thirdPositionId?.toString(),
        queuePosition,
        hasPositions: userPositionIds && userPositionIds.length > 0,
        includesFirst: currentTurnoId !== undefined && userPositionIds?.includes(currentTurnoId),
        includesSecond: secondPositionId !== undefined && userPositionIds?.includes(secondPositionId),
        includesThird: thirdPositionId !== undefined && userPositionIds?.includes(thirdPositionId)
    })

    // DEBUG: Log detailed position info with actual values
    console.log('📊 ESTADO COMPLETO:')
    console.log('   - activePositionsCount:', activePositionsCount?.toString())
    console.log('   - userPositionIds:', userPositionIds)
    console.log('   - userPositionIds length:', userPositionIds?.length)
    console.log('   - totalBalance:', totalBalance?.toString())
    console.log('   - activosCount (global):', activosCount?.toString())
    console.log('   - totalCompletedCycles:', totalCompletedCycles?.toString())

    // DEBUG: Log allowance state
    console.log('🔍 Allowance Debug:')
    console.log('   - allowance raw:', allowance?.toString())
    console.log('   - allowance formatted:', allowance ? formatUnits(allowance, 6) : 'undefined')
    console.log('   - needsApproval:', needsApproval)
    console.log('   - usdtBalance:', usdtBal)

    return (
        <div className="dashboard">
            <div className="container">
                {/* Header */}
                <div className="header">
                    <h1 style={{
                        color: 'white',
                        background: 'none',
                        WebkitTextFillColor: 'white',
                        backgroundClip: 'unset',
                        WebkitBackgroundClip: 'unset'
                    }}>Dashboard → {tierConfig?.name || 'Tier'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="wallet-label">Wallet:</span>
                        <span className="wallet-address">
                            {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'No conectada'}
                        </span>
                    </div>
                </div>

                {/* Botón para volver a la página principal */}
                <button
                    onClick={() => navigate('/')}
                    className="back-home-button"
                    style={{
                        marginBottom: '20px',
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    ← Volver a Selección de Tiers
                </button>

                {/* Refreshing Indicator */}
                {isRefreshing && (
                    <div style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '600',
                        animation: 'pulse 2s infinite'
                    }}>
                        🔄 Actualizando datos de la blockchain...
                    </div>
                )}

                {/* Queue Position Alert (Traffic Light System) */}
                {queuePosition && (
                    <div style={{
                        padding: '20px',
                        background: queuePosition.bgGradient,
                        borderRadius: '16px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        color: queuePosition.textColor,
                        fontWeight: 'bold',
                        fontSize: '1.3rem',
                        boxShadow: `0 8px 32px ${queuePosition.color}66`,
                        animation: 'glow 2s infinite',
                        border: `3px solid ${queuePosition.borderColor}`
                    }}>
                        {queuePosition.icon} {queuePosition.message} {queuePosition.icon}
                        <div style={{ fontSize: '0.9rem', marginTop: '8px', fontWeight: 'normal' }}>
                            {queuePosition.detail}
                        </div>
                    </div>
                )}

                {/* Balance USDT */}
                <section className="section balance-section">
                    <div className="balance-card">
                        <div className="balance-label">
                            Balance USDT
                            <Tooltip text="Tu saldo disponible de USDT en esta wallet. Necesitas al menos 20 USDT para crear una posición." />
                        </div>
                        <div className="balance-value">{usdtBal} USDT</div>

                        {/* Faucet Button - mostrar solo si balance = 0 USDT */}
                        {parseFloat(usdtBal) === 0 && (
                            <button
                                onClick={mintTestUSDT}
                                disabled={isPending || isConfirming}
                                style={{
                                    marginTop: '15px',
                                    padding: '12px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
                                    opacity: isPending || isConfirming ? 0.7 : 1,
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {isPending ? '⏳ Enviando...' :
                                    isConfirming ? '⏳ Confirmando...' :
                                        '🎁 Obtener 1,000 USDT de Prueba'}
                            </button>
                        )}
                    </div>
                </section>

                {/* Información del Sistema (Pública) - PRIMERO */}
                <section className="section">
                    <h2>
                        🌍 Estado del Sistema (Tiempo Real)
                        <Tooltip text="Información pública del sistema visible para todos. Datos generales, no personalizados." />
                    </h2>
                    <div className="stats-grid">
                        <StatCard
                            label="📊 Posiciones Activas (Global)"
                            value={activosCount !== undefined ? Number(activosCount) : '...'}
                            tooltip="Total de posiciones activas en el sistema AHORA. Contador en tiempo real que sube cuando alguien entra y baja cuando alguien completa."
                        />
                        <StatCard
                            label="✅ Ciclos Completados (Histórico)"
                            value={totalCompletedCycles !== undefined ? Number(totalCompletedCycles) : '...'}
                            tooltip="Total de posiciones que han completado su ciclo (40 USDT) desde el inicio del contrato. Contador histórico acumulativo."
                        />
                        <StatCard
                            label="💰 Total Pagado (Sistema)"
                            value={totalWithdrawn ? `${formatUnits(totalWithdrawn, 6)} USDT` : '0 USDT'}
                            highlight={totalWithdrawn && totalWithdrawn > 0n}
                            tooltip="Total de USDT que el sistema ha pagado a TODOS los usuarios desde el inicio. Incluye todos los auto-exits completados."
                        />
                    </div>
                </section>

                {/* Resumen Personal - SEGUNDO */}
                <section className="section">
                    <h2>
                        📊 Tu Resumen
                        <Tooltip text="Vista de TUS posiciones y saldo histórico. Esta información es privada y solo tú la ves." />
                    </h2>
                    <div className="stats-grid">
                        <StatCard
                            label="Tus Posiciones Activas"
                            value={`${activeCount}`}
                            highlight={activeCount > 0}
                            tooltip="Número de posiciones que TÚ tienes activas ahora. Puedes crear las que quieras sin límite."
                        />
                        <StatCard
                            label="Tus Posiciones Cerradas"
                            value={closedPositionsCount !== undefined ? Number(closedPositionsCount) : '...'}
                            highlight={closedPositionsCount > 0}
                            tooltip="Número de posiciones que TÚ has completado (llegaron a 40 USDT). Estas posiciones ya no reciben más participaciones."
                        />
                        <StatCard
                            label="💰 Tu Total Recibido"
                            value={closedPositionsCount !== undefined && closedPositionsCount > 0
                                ? `${Number(closedPositionsCount) * 20} USDT`
                                : (closedPositionsCount === undefined ? '...' : '0 USDT')}
                            highlight={closedPositionsCount !== undefined && closedPositionsCount > 0}
                            tooltip="Total de USDT que TÚ has recibido en auto-exits. Cada ciclo cerrado = 20 USDT."
                        />
                    </div>
                </section>

                {/* Acciones */}
                <section className="section">
                    <h2>
                        Acciones
                        <Tooltip text="Pasos necesarios para participar en el sistema. Primero debes aprobar el uso de tus USDT, luego crear una posición." />
                    </h2>
                    <div className="actions">
                        {needsApproval ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    className="action-button primary"
                                    onClick={approveUSDT}
                                    disabled={isPending || isConfirming}
                                >
                                    {isPending || isConfirming ? 'Procesando...' : '1. Aprobar Contrato'}
                                </button>
                                <Tooltip text={`Debes aprobar desde MetaMask el uso de ${tierConfig?.entry || 10} USDT para activar tu posición en SanDigital. Este es un paso de seguridad estándar en blockchain. Solo necesitas hacerlo una vez.`} position="right" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    className="action-button success"
                                    onClick={createPosition}
                                    disabled={isPending || isConfirming}
                                >
                                    {isPending || isConfirming
                                        ? 'Procesando...'
                                        : `➕ Nueva Posición (${tierConfig?.entry || 10} USDT)`}
                                </button>
                                <Tooltip text={`Crea una nueva posición con ${tierConfig?.entry || 10} USDT. Cada posición acumula recompensas independientemente. Sin límite de posiciones.`} position="right" />
                            </div>
                        )}
                    </div>

                    {/* Transaction Explorer */}
                    <TransactionExplorer userAddress={userAddress} chainId={chain?.id} />

                </section>

                {/* Posición Agregada */}
                <AggregatedPositionCard
                    totalBalance={totalBalance}
                    activeCount={activePositionsCount}
                    onClaimAll={claimAll}
                />

                {/* 🚨 Botón de Emergencia - Solo si hay fondos atrapados */}
                {pendingWithdrawals && pendingWithdrawals > 0n && (
                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                        borderRadius: '16px',
                        border: '3px solid #ff4757',
                        boxShadow: '0 8px 32px rgba(255, 71, 87, 0.4)',
                        animation: 'pulse 2s infinite',
                    }}>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            color: '#fff',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}>
                            🚨 Fondos Atrapados Detectados
                        </h3>
                        <p style={{
                            margin: '0 0 16px 0',
                            color: '#fff',
                            fontSize: '15px',
                            textAlign: 'center',
                            lineHeight: '1.5',
                        }}>
                            Tienes <strong>{formatUnits(pendingWithdrawals, 6)} USDT</strong> que no pudieron transferirse automáticamente.
                            <br />
                            Haz clic abajo para rescatarlos de forma segura.
                        </p>
                        <button
                            onClick={claimPending}
                            disabled={isPending || isConfirming}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#fff',
                                color: '#ff4757',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '17px',
                                fontWeight: 'bold',
                                cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
                                opacity: isPending || isConfirming ? 0.7 : 1,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            {isPending ? '⏳ Rescatando...' :
                                isConfirming ? '⏳ Confirmando...' :
                                    `🆘 Rescatar ${formatUnits(pendingWithdrawals, 6)} USDT`}
                        </button>
                    </div>
                )}

                {/* Processing Modal */}
                <ProcessingModal
                    isOpen={isProcessing}
                    message="Tu transacción se está registrando en la blockchain. Esto puede tomar unos segundos."
                />

                {/* Success Toast */}
                <SuccessToast
                    isVisible={successMessage !== null}
                    message={successMessage || ''}
                    onClose={() => setSuccessMessage(null)}
                />

                {/* Error Modal */}
                <ErrorModal
                    isOpen={error !== null}
                    onClose={() => setError(null)}
                    title={error?.title || 'Error'}
                    message={error?.message || 'Ha ocurrido un error'}
                    details={error?.details}
                />
            </div>
        </div >
    )
}
