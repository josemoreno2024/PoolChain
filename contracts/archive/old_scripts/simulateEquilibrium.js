/**
 * 🔬 SIMULADOR DE EQUILIBRIO - SanDigital 4Funds
 * 
 * Este script simula N joins para determinar si el sistema:
 * 1. Alcanza un punto de equilibrio (entradas = salidas)
 * 2. La cola FIFO crece indefinidamente
 * 3. Cuántas posiciones activas habrá en estado estable
 */

const ENTRY_AMOUNT = 10;           // 10 USDT por join
const EXIT_AMOUNT = 20;            // 20 USDT por exit
const MIN_BALANCE_FOR_EXIT = 20;   // Balance mínimo para auto-exit
const MAX_BALANCE_FOR_EXIT = 40;   // Balance máximo para auto-exit

const KEEPER_PERCENT = 5;          // 5% (0.5 USDT)
const TURN_PERCENT = 35;           // 35% (3.5 USDT)
const GLOBAL_PERCENT = 55;         // 55% (5.5 USDT)
const OPERATIONAL_PERCENT = 10;    // 10% (1.0 USDT)

class Position {
    constructor(id, owner) {
        this.id = id;
        this.owner = owner;
        this.balance = 0;
        this.isActive = true;
        this.hasExited = false;
    }
}

class SystemSimulator {
    constructor() {
        this.positions = [];
        this.activos = [];
        this.keeperFund = 0;
        this.operationalFund = 0;
        this.globalPool = 0;
        this.totalDeposited = 0;
        this.totalWithdrawn = 0;
        this.completedCycles = 0;
        this.joinCount = 0;
    }

    join() {
        this.joinCount++;
        this.totalDeposited += ENTRY_AMOUNT;

        // Keeper Fund (5%)
        const keeperAmount = ENTRY_AMOUNT * (KEEPER_PERCENT / 100);
        this.keeperFund += keeperAmount;

        // User gets 95%
        const userAmount = ENTRY_AMOUNT - keeperAmount;

        // Calculate distributions
        const turnAmount = userAmount * (TURN_PERCENT / 100);
        const globalAmount = userAmount * (GLOBAL_PERCENT / 100);
        const operationalAmount = userAmount * (OPERATIONAL_PERCENT / 100);

        // Pay turn (if there are active positions)
        if (this.activos.length > 0) {
            const turnoId = this.activos[0];
            this.positions[turnoId].balance += turnAmount;
        }

        // Add to global pool
        this.globalPool += globalAmount;

        // Add to operational fund
        this.operationalFund += operationalAmount;

        // Create new position
        const newPos = new Position(this.positions.length, `User${this.joinCount}`);
        this.positions.push(newPos);
        this.activos.push(newPos.id);

        // Distribute global
        this.distributeGlobal();

        // Check for auto-exits
        this.checkAutoExits();
    }

    distributeGlobal() {
        if (this.globalPool === 0 || this.activos.length === 0) return;

        const amount = this.globalPool;
        this.globalPool = 0;

        const recipients = this.activos.length;
        const perPosition = amount / recipients;

        for (const posId of this.activos) {
            this.positions[posId].balance += perPosition;
        }
    }

    checkAutoExits() {
        const toExit = [];

        for (const posId of this.activos) {
            const pos = this.positions[posId];
            if (pos.balance >= MIN_BALANCE_FOR_EXIT && pos.balance <= MAX_BALANCE_FOR_EXIT) {
                toExit.push(posId);
            }
        }

        for (const posId of toExit) {
            this.autoExit(posId);
        }
    }

    autoExit(posId) {
        const pos = this.positions[posId];

        pos.isActive = false;
        pos.hasExited = true;

        const currentBalance = pos.balance;
        pos.balance = 0;

        // Remove from activos
        const index = this.activos.indexOf(posId);
        if (index > -1) {
            this.activos.splice(index, 1);
        }

        this.totalWithdrawn += EXIT_AMOUNT;
        this.completedCycles++;

        // Return excess to global pool
        if (currentBalance > EXIT_AMOUNT) {
            const excess = currentBalance - EXIT_AMOUNT;
            this.globalPool += excess;
        }
    }

    getMetrics() {
        const activePositions = this.activos.length;
        const totalUserBalances = this.activos.reduce((sum, posId) => {
            return sum + this.positions[posId].balance;
        }, 0);

        return {
            joinCount: this.joinCount,
            activePositions,
            completedCycles: this.completedCycles,
            totalDeposited: this.totalDeposited,
            totalWithdrawn: this.totalWithdrawn,
            totalUserBalances,
            keeperFund: this.keeperFund,
            operationalFund: this.operationalFund,
            globalPool: this.globalPool,
            netFlow: this.totalDeposited - this.totalWithdrawn,
            avgBalancePerPosition: activePositions > 0 ? totalUserBalances / activePositions : 0
        };
    }

    isInEquilibrium() {
        const metrics = this.getMetrics();

        // Equilibrium conditions:
        // 1. Active positions stable (not growing rapidly)
        // 2. Net flow approaching zero (deposits ≈ withdrawals)
        // 3. Average balance per position stable

        return {
            activePositionsStable: metrics.activePositions < 30, // Below max
            netFlowRatio: Math.abs(metrics.netFlow / metrics.totalDeposited),
            avgBalance: metrics.avgBalancePerPosition
        };
    }
}

// Run simulation
console.log("🔬 SIMULACIÓN DE EQUILIBRIO - SanDigital 4Funds\n");
console.log("=".repeat(80));
console.log("PARÁMETROS:");
console.log("=".repeat(80));
console.log(`Entry Amount: ${ENTRY_AMOUNT} USDT`);
console.log(`Exit Amount: ${EXIT_AMOUNT} USDT`);
console.log(`Min Balance for Exit: ${MIN_BALANCE_FOR_EXIT} USDT`);
console.log(`Max Balance for Exit: ${MAX_BALANCE_FOR_EXIT} USDT`);
console.log(`\nDistribution:`);
console.log(`  - Keeper Fund: ${KEEPER_PERCENT}%`);
console.log(`  - Turn Payment: ${TURN_PERCENT}%`);
console.log(`  - Global Distribution: ${GLOBAL_PERCENT}%`);
console.log(`  - Operational Fund: ${OPERATIONAL_PERCENT}%`);
console.log("");

const sim = new SystemSimulator();
const snapshots = [];

// Simulate 100 joins
console.log("=".repeat(80));
console.log("SIMULANDO 100 JOINS...");
console.log("=".repeat(80));
console.log("");

for (let i = 1; i <= 100; i++) {
    sim.join();

    if (i % 10 === 0 || i <= 5) {
        const metrics = sim.getMetrics();
        snapshots.push(metrics);

        console.log(`Join #${i}:`);
        console.log(`  Active Positions: ${metrics.activePositions}`);
        console.log(`  Completed Cycles: ${metrics.completedCycles}`);
        console.log(`  Total Deposited: ${metrics.totalDeposited.toFixed(2)} USDT`);
        console.log(`  Total Withdrawn: ${metrics.totalWithdrawn.toFixed(2)} USDT`);
        console.log(`  Net Flow: ${metrics.netFlow.toFixed(2)} USDT`);
        console.log(`  Avg Balance/Position: ${metrics.avgBalancePerPosition.toFixed(2)} USDT`);
        console.log("");
    }
}

console.log("=".repeat(80));
console.log("ANÁLISIS DE EQUILIBRIO");
console.log("=".repeat(80));
console.log("");

const finalMetrics = sim.getMetrics();

console.log("📊 ESTADO FINAL (después de 100 joins):");
console.log(`  Active Positions: ${finalMetrics.activePositions}`);
console.log(`  Completed Cycles: ${finalMetrics.completedCycles}`);
console.log(`  Total Deposited: ${finalMetrics.totalDeposited.toFixed(2)} USDT`);
console.log(`  Total Withdrawn: ${finalMetrics.totalWithdrawn.toFixed(2)} USDT`);
console.log(`  Net Flow: ${finalMetrics.netFlow.toFixed(2)} USDT`);
console.log(`  Net Flow Ratio: ${(finalMetrics.netFlow / finalMetrics.totalDeposited * 100).toFixed(2)}%`);
console.log("");

console.log("📈 TENDENCIA:");
const firstSnapshot = snapshots[0];
const lastSnapshot = snapshots[snapshots.length - 1];

const positionGrowthRate = (lastSnapshot.activePositions - firstSnapshot.activePositions) / firstSnapshot.activePositions * 100;
const netFlowTrend = lastSnapshot.netFlow - firstSnapshot.netFlow;

console.log(`  Position Growth Rate: ${positionGrowthRate.toFixed(2)}%`);
console.log(`  Net Flow Trend: ${netFlowTrend > 0 ? "↑" : "↓"} ${Math.abs(netFlowTrend).toFixed(2)} USDT`);
console.log("");

console.log("🎯 CONCLUSIÓN:");
if (finalMetrics.activePositions < 25 && Math.abs(finalMetrics.netFlow / finalMetrics.totalDeposited) < 0.3) {
    console.log("  ✅ El sistema ALCANZA EQUILIBRIO");
    console.log(`  📊 Posiciones activas en equilibrio: ~${finalMetrics.activePositions}`);
    console.log(`  💰 Balance promedio por posición: ~${finalMetrics.avgBalancePerPosition.toFixed(2)} USDT`);
} else if (finalMetrics.activePositions >= 25) {
    console.log("  ⚠️  La cola FIFO está CRECIENDO");
    console.log("  📈 Posiciones activas: " + finalMetrics.activePositions + " (cerca del límite de 30)");
    console.log("  💡 Recomendación: Ajustar parámetros para aumentar salidas");
} else {
    console.log("  ⏳ El sistema está EN TRANSICIÓN");
    console.log("  📊 Necesita más joins para determinar equilibrio");
}

console.log("");
console.log("=".repeat(80));
console.log("💡 INTERPRETACIÓN");
console.log("=".repeat(80));
console.log("");
console.log("Si el sistema alcanza equilibrio:");
console.log("  ✅ Las posiciones activas se estabilizan en un número constante");
console.log("  ✅ Por cada join, eventualmente hay un auto-exit");
console.log("  ✅ El net flow se acerca a cero (entradas ≈ salidas)");
console.log("");
console.log("Si la cola crece indefinidamente:");
console.log("  ❌ Las posiciones activas siguen aumentando");
console.log("  ❌ Los auto-exits no ocurren lo suficientemente rápido");
console.log("  ❌ El net flow sigue siendo muy positivo");
console.log("");
