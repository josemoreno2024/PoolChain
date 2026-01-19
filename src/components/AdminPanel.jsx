import { useState } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { useSanDigital } from '../sandigital/hooks/useSanDigital'
import { getTier, TIERS } from '../sandigital/config/tiers'
import './AdminPanel.css'

export function AdminPanel() {
    const { address: userAddress } = useAccount()

    // Estado para seleccionar tier
    const [selectedTierId, setSelectedTierId] = useState('micro')
    const selectedTier = getTier(selectedTierId)

    const {
        totalDeposited,
        totalWithdrawn,
        totalSaldosUsuarios,
        activosCount,
        totalCompletedCycles,
        operationalBalance,
        closureFund,
        withdrawAdmin,
        isPending,
        isConfirming
    } = useSanDigital(userAddress, selectedTier)

    const [isWithdrawing, setIsWithdrawing] = useState(false)

    // Format data
    const deposited = totalDeposited ? formatUnits(totalDeposited, 6) : '0'
    const withdrawn = totalWithdrawn ? formatUnits(totalWithdrawn, 6) : '0'
    const userBalances = totalSaldosUsuarios ? formatUnits(totalSaldosUsuarios, 6) : '0'
    const adminBal = operationalBalance ? formatUnits(operationalBalance, 6) : '0'
    const closureBal = closureFund ? formatUnits(closureFund, 6) : '0'

    // Calculate system health
    const depositedNum = parseFloat(deposited)
    const withdrawnNum = parseFloat(withdrawn)
    const userBalNum = parseFloat(userBalances)
    const adminBalNum = parseFloat(adminBal)

    const totalOut = withdrawnNum + userBalNum + adminBalNum
    const ratio = depositedNum > 0 ? ((totalOut / depositedNum) * 100).toFixed(2) : '0'

    const handleWithdrawAdmin = async () => {
        if (parseFloat(adminBal) === 0) {
            alert('No hay fondos de administración para retirar')
            return
        }

        setIsWithdrawing(true)
        try {
            await withdrawAdmin()
            // No recargar la página - el polling actualizará automáticamente
        } catch (error) {
            console.error('Error al retirar:', error)
        } finally {
            // Mantener el estado de "procesando" por 3 segundos más
            setTimeout(() => {
                setIsWithdrawing(false)
            }, 3000)
        }
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <div className="header-content">
                    <h1>🔐 Panel de Administración</h1>
                    <p className="admin-subtitle">Métricas y control del sistema</p>
                </div>

                {/* Selector de Tier */}
                <div className="tier-selector-admin">
                    <label htmlFor="tier-select">Ver Tier:</label>
                    <select
                        id="tier-select"
                        value={selectedTierId}
                        onChange={(e) => setSelectedTierId(e.target.value)}
                        className="tier-select-dropdown"
                    >
                        {Object.values(TIERS).map(tier => (
                            <option key={tier.id} value={tier.id}>
                                {tier.name} ({tier.entry}→{tier.exit} USDT)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* System Health */}
            <section className="admin-section">
                <h2>📊 Salud del Sistema</h2>
                <div className="health-grid">
                    <div className="health-card">
                        <div className="health-label">Total Depositado</div>
                        <div className="health-value">{deposited} USDT</div>
                    </div>
                    <div className="health-card">
                        <div className="health-label">Total Retirado</div>
                        <div className="health-value">{withdrawn} USDT</div>
                    </div>
                    <div className="health-card">
                        <div className="health-label">Saldos de Usuarios</div>
                        <div className="health-value">{userBalances} USDT</div>
                    </div>
                    <div className="health-card">
                        <div className="health-label">Balance Admin</div>
                        <div className="health-value highlight">{adminBal} USDT</div>
                    </div>
                    <div className="health-card ratio-card">
                        <div className="health-label">Ratio de Salud</div>
                        <div className="health-value">
                            {ratio}%
                            <span className="ratio-status">
                                {parseFloat(ratio) >= 95 && parseFloat(ratio) <= 105 ? ' ✅ Saludable' : ' ⚠️ Revisar'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* System Metrics */}
            <section className="admin-section">
                <h2>📈 Métricas del Sistema</h2>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon">🔄</div>
                        <div className="metric-label">Posiciones Activas</div>
                        <div className="metric-value">{activosCount?.toString() || '0'}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">✅</div>
                        <div className="metric-label">Ciclos Completados</div>
                        <div className="metric-value">{totalCompletedCycles?.toString() || '0'}</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">💰</div>
                        <div className="metric-label">Fondo Operativo</div>
                        <div className="metric-value">{adminBal} USDT</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">🔒</div>
                        <div className="metric-label">Fondo de Cierre</div>
                        <div className="metric-value">{closureBal} USDT</div>
                    </div>
                </div>
            </section>

            {/* Admin Actions */}
            <section className="admin-section">
                <h2>⚙️ Acciones de Administración</h2>
                <div className="admin-actions">
                    <button
                        onClick={handleWithdrawAdmin}
                        disabled={isPending || isConfirming || isWithdrawing || parseFloat(adminBal) === 0}
                        className="admin-button withdraw-button"
                    >
                        {isPending || isConfirming || isWithdrawing
                            ? '⏳ Procesando...'
                            : `💸 Retirar Comisiones (${adminBal} USDT)`}
                    </button>
                </div>
            </section>

            {/* Transparency Note */}
            <section className="admin-section transparency-note">
                <h3>🔍 Nota de Transparencia</h3>
                <p>
                    <strong>Ratio de Salud:</strong> Debe estar entre 95% y 105%. Este ratio verifica que:
                </p>
                <ul>
                    <li>Total Depositado = Total Retirado + Saldos de Usuarios + Balance Admin</li>
                    <li>Si el ratio está fuera de rango, puede indicar un problema de contabilidad</li>
                    <li>Un ratio saludable garantiza que todos los fondos están correctamente rastreados</li>
                </ul>
            </section>
        </div>
    )
}
