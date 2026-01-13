/**
 * 🔬 OPTIMIZADOR DE EQUILIBRIO
 * 
 * Este script prueba MÚLTIPLES configuraciones para encontrar
 * los parámetros óptimos que logran equilibrio sostenible.
 * 
 * Criterios de equilibrio:
 * 1. Posiciones activas se estabilizan (no crecen indefinidamente)
 * 2. Ratio entrada/salida cercano a 1:1
 * 3. Net flow se acerca a cero
 */

class SystemSimulator {
    constructor(config) {
        this.config = config;
        this.reset();
    }

    reset() {
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
        this.totalDeposited += this.config.ENTRY_AMOUNT;

        const keeperAmount = this.config.ENTRY_AMOUNT * (this.config.KEEPER_PERCENT / 100);
        this.keeperFund += keeperAmount;

        const userAmount = this.config.ENTRY_AMOUNT - keeperAmount;

        const turnAmount = userAmount * (this.config.TURN_PERCENT / 100);
        const globalAmount = userAmount * (this.config.GLOBAL_PERCENT / 100);
        const operationalAmount = userAmount * (this.config.OPERATIONAL_PERCENT / 100);

        if (this.activos.length > 0) {
            const turnoId = this.activos[0];
            this.positions[turnoId].balance += turnAmount;
        }

        this.globalPool += globalAmount;
        this.operationalFund += operationalAmount;

        const newPos = { id: this.positions.length, balance: 0, isActive: true, hasExited: false };
        this.positions.push(newPos);
        this.activos.push(newPos.id);

        this.distributeGlobal();
        this.checkAutoExits();
    }

    distributeGlobal() {
        if (this.globalPool === 0 || this.activos.length === 0) return;

        const amount = this.globalPool;
        this.globalPool = 0;

        const perPosition = amount / this.activos.length;

        for (const posId of this.activos) {
            this.positions[posId].balance += perPosition;
        }
    }

    checkAutoExits() {
        const toExit = [];

        for (const posId of this.activos) {
            const pos = this.positions[posId];
            if (pos.balance >= this.config.MIN_BALANCE_FOR_EXIT &&
                pos.balance <= this.config.MAX_BALANCE_FOR_EXIT) {
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

        const index = this.activos.indexOf(posId);
        if (index > -1) {
            this.activos.splice(index, 1);
        }

        this.totalWithdrawn += this.config.EXIT_AMOUNT;
        this.completedCycles++;

        if (currentBalance > this.config.EXIT_AMOUNT) {
            const excess = currentBalance - this.config.EXIT_AMOUNT;
            this.globalPool += excess;
        }
    }

    getMetrics() {
        const activePositions = this.activos.length;
        const totalUserBalances = this.activos.reduce((sum, posId) => {
            return sum + this.positions[posId].balance;
        }, 0);

        return {
            activePositions,
            completedCycles: this.completedCycles,
            totalDeposited: this.totalDeposited,
            totalWithdrawn: this.totalWithdrawn,
            netFlow: this.totalDeposited - this.totalWithdrawn,
            avgBalance: activePositions > 0 ? totalUserBalances / activePositions : 0,
            exitRate: this.joinCount > 0 ? (this.completedCycles / this.joinCount) * 100 : 0
        };
    }

    isInEquilibrium() {
        const metrics = this.getMetrics();

        // Equilibrio = posiciones estables + exit rate alto + net flow bajo
        const positionsStable = metrics.activePositions < 25;
        const exitRateGood = metrics.exitRate > 80; // Al menos 80% de exits
        const netFlowLow = Math.abs(metrics.netFlow / metrics.totalDeposited) < 0.15; // Menos de 15%

        return positionsStable && exitRateGood && netFlowLow;
    }
}

// Configuraciones a probar
const configurations = [
    // Config 1: Reducir MIN_BALANCE a 15
    {
        name: "Config 1: MIN=15, EXIT=15",
        ENTRY_AMOUNT: 10,
        EXIT_AMOUNT: 15,
        MIN_BALANCE_FOR_EXIT: 15,
        MAX_BALANCE_FOR_EXIT: 40,
        KEEPER_PERCENT: 5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    },
    // Config 2: Reducir MIN_BALANCE a 12
    {
        name: "Config 2: MIN=12, EXIT=12",
        ENTRY_AMOUNT: 10,
        EXIT_AMOUNT: 12,
        MIN_BALANCE_FOR_EXIT: 12,
        MAX_BALANCE_FOR_EXIT: 40,
        KEEPER_PERCENT: 5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    },
    // Config 3: Aumentar GLOBAL, reducir TURN
    {
        name: "Config 3: MIN=15, GLOBAL=60%",
        ENTRY_AMOUNT: 10,
        EXIT_AMOUNT: 15,
        MIN_BALANCE_FOR_EXIT: 15,
        MAX_BALANCE_FOR_EXIT: 40,
        KEEPER_PERCENT: 5,
        TURN_PERCENT: 30,
        GLOBAL_PERCENT: 60,
        OPERATIONAL_PERCENT: 10
    },
    // Config 4: Agresivo - MIN=10, EXIT=10
    {
        name: "Config 4: MIN=10, EXIT=10 (Agresivo)",
        ENTRY_AMOUNT: 10,
        EXIT_AMOUNT: 10,
        MIN_BALANCE_FOR_EXIT: 10,
        MAX_BALANCE_FOR_EXIT: 40,
        KEEPER_PERCENT: 5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    },
    // Config 5: Balanceado
    {
        name: "Config 5: MIN=12, EXIT=15, GLOBAL=60%",
        ENTRY_AMOUNT: 10,
        EXIT_AMOUNT: 15,
        MIN_BALANCE_FOR_EXIT: 12,
        MAX_BALANCE_FOR_EXIT: 40,
        KEEPER_PERCENT: 5,
        TURN_PERCENT: 30,
        GLOBAL_PERCENT: 60,
        OPERATIONAL_PERCENT: 10
    }
];

console.log("🔬 OPTIMIZADOR DE EQUILIBRIO - SanDigital 4Funds\n");
console.log("=".repeat(80));
console.log("Probando múltiples configuraciones para encontrar equilibrio sostenible...");
console.log("=".repeat(80));
console.log("");

const results = [];

for (const config of configurations) {
    const sim = new SystemSimulator(config);

    // Simular 150 joins
    for (let i = 0; i < 150; i++) {
        sim.join();
    }

    const metrics = sim.getMetrics();
    const inEquilibrium = sim.isInEquilibrium();

    results.push({
        config: config.name,
        activePositions: metrics.activePositions,
        exitRate: metrics.exitRate.toFixed(2),
        netFlowRatio: (metrics.netFlow / metrics.totalDeposited * 100).toFixed(2),
        avgBalance: metrics.avgBalance.toFixed(2),
        equilibrium: inEquilibrium,
        score: calculateScore(metrics)
    });
}

// Ordenar por score (mejor primero)
results.sort((a, b) => b.score - a.score);

console.log("\n📊 RESULTADOS (ordenados por mejor score):\n");
console.log("=".repeat(80));

for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(`${i + 1}. ${r.config}`);
    console.log(`   Active Positions: ${r.activePositions} ${r.activePositions < 25 ? "✅" : "❌"}`);
    console.log(`   Exit Rate: ${r.exitRate}% ${parseFloat(r.exitRate) > 80 ? "✅" : "❌"}`);
    console.log(`   Net Flow Ratio: ${r.netFlowRatio}% ${Math.abs(parseFloat(r.netFlowRatio)) < 15 ? "✅" : "❌"}`);
    console.log(`   Avg Balance: ${r.avgBalance} USDT`);
    console.log(`   Equilibrium: ${r.equilibrium ? "✅ YES" : "❌ NO"}`);
    console.log(`   Score: ${r.score.toFixed(2)}/100`);
    console.log("");
}

console.log("=".repeat(80));
console.log("🏆 RECOMENDACIÓN FINAL");
console.log("=".repeat(80));
console.log("");

const best = results[0];
console.log(`Mejor configuración: ${best.config}`);
console.log(`Score: ${best.score.toFixed(2)}/100`);
console.log("");

if (best.equilibrium) {
    console.log("✅ Esta configuración ALCANZA EQUILIBRIO sostenible!");
    console.log("");
    console.log("Características:");
    console.log(`  - Posiciones activas estables: ~${best.activePositions}`);
    console.log(`  - Exit rate: ${best.exitRate}%`);
    console.log(`  - Net flow ratio: ${best.netFlowRatio}%`);
    console.log("");
    console.log("💡 ACCIÓN REQUERIDA:");
    console.log("   Actualizar el contrato con estos parámetros.");
} else {
    console.log("⚠️  Ninguna configuración alcanzó equilibrio perfecto.");
    console.log("");
    console.log("La mejor opción disponible tiene:");
    console.log(`  - ${best.activePositions} posiciones activas`);
    console.log(`  - ${best.exitRate}% exit rate`);
    console.log("");
    console.log("💡 RECOMENDACIÓN:");
    console.log("   Considerar ajustes adicionales o aceptar esta configuración");
    console.log("   como la más cercana al equilibrio.");
}

function calculateScore(metrics) {
    // Score basado en qué tan cerca está del equilibrio ideal
    let score = 100;

    // Penalizar posiciones activas altas
    if (metrics.activePositions > 25) {
        score -= (metrics.activePositions - 25) * 2;
    }

    // Penalizar exit rate bajo
    if (metrics.exitRate < 80) {
        score -= (80 - metrics.exitRate) * 0.5;
    }

    // Penalizar net flow alto
    const netFlowRatio = Math.abs(metrics.netFlow / metrics.totalDeposited * 100);
    if (netFlowRatio > 15) {
        score -= (netFlowRatio - 15) * 2;
    }

    return Math.max(0, score);
}
