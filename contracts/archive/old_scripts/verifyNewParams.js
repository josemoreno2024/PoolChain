/**
 * 🔬 VERIFICACIÓN DE EQUILIBRIO CON NUEVOS PARÁMETROS
 * 
 * Simula el sistema con los parámetros actualizados para confirmar
 * que se alcanza el equilibrio esperado.
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
            joinCount: this.joinCount,
            activePositions,
            completedCycles: this.completedCycles,
            totalDeposited: this.totalDeposited,
            totalWithdrawn: this.totalWithdrawn,
            netFlow: this.totalDeposited - this.totalWithdrawn,
            avgBalance: activePositions > 0 ? totalUserBalances / activePositions : 0,
            exitRate: this.joinCount > 0 ? (this.completedCycles / this.joinCount) * 100 : 0,
            netFlowRatio: this.totalDeposited > 0 ? (this.totalDeposited - this.totalWithdrawn) / this.totalDeposited * 100 : 0
        };
    }
}

// Configuración NUEVA (implementada en el contrato)
const newConfig = {
    ENTRY_AMOUNT: 10,
    EXIT_AMOUNT: 10,
    MIN_BALANCE_FOR_EXIT: 10,
    MAX_BALANCE_FOR_EXIT: 40,  // Corregido: 40 en lugar de 11
    KEEPER_PERCENT: 5,
    TURN_PERCENT: 35,
    GLOBAL_PERCENT: 55,
    OPERATIONAL_PERCENT: 10
};

console.log("🔬 VERIFICACIÓN DE EQUILIBRIO CON NUEVOS PARÁMETROS\n");
console.log("=".repeat(80));
console.log("PARÁMETROS IMPLEMENTADOS:");
console.log("=".repeat(80));
console.log(`Entry Amount: ${newConfig.ENTRY_AMOUNT} USDT`);
console.log(`Exit Amount: ${newConfig.EXIT_AMOUNT} USDT`);
console.log(`Min Balance for Exit: ${newConfig.MIN_BALANCE_FOR_EXIT} USDT`);
console.log(`Max Balance for Exit: ${newConfig.MAX_BALANCE_FOR_EXIT} USDT`);
console.log("");

const sim = new SystemSimulator(newConfig);

console.log("=".repeat(80));
console.log("SIMULANDO 150 JOINS...");
console.log("=".repeat(80));
console.log("");

// Simular 150 joins y mostrar snapshots
for (let i = 1; i <= 150; i++) {
    sim.join();

    if ([10, 20, 30, 50, 75, 100, 150].includes(i)) {
        const metrics = sim.getMetrics();
        console.log(`Join #${i}:`);
        console.log(`  Active Positions: ${metrics.activePositions}`);
        console.log(`  Completed Cycles: ${metrics.completedCycles}`);
        console.log(`  Exit Rate: ${metrics.exitRate.toFixed(2)}%`);
        console.log(`  Net Flow Ratio: ${metrics.netFlowRatio.toFixed(2)}%`);
        console.log(`  Avg Balance: ${metrics.avgBalance.toFixed(2)} USDT`);
        console.log("");
    }
}

const finalMetrics = sim.getMetrics();

console.log("=".repeat(80));
console.log("📊 RESULTADO FINAL");
console.log("=".repeat(80));
console.log("");

console.log(`Total Joins: ${finalMetrics.joinCount}`);
console.log(`Active Positions: ${finalMetrics.activePositions} ${finalMetrics.activePositions < 40 ? "✅" : "❌"}`);
console.log(`Completed Cycles: ${finalMetrics.completedCycles}`);
console.log(`Exit Rate: ${finalMetrics.exitRate.toFixed(2)}% ${finalMetrics.exitRate > 70 ? "✅" : "❌"}`);
console.log(`Net Flow Ratio: ${finalMetrics.netFlowRatio.toFixed(2)}% ${finalMetrics.netFlowRatio < 25 ? "✅" : "❌"}`);
console.log(`Avg Balance: ${finalMetrics.avgBalance.toFixed(2)} USDT`);
console.log("");

console.log("=".repeat(80));
console.log("🎯 EVALUACIÓN DE EQUILIBRIO");
console.log("=".repeat(80));
console.log("");

const equilibriumScore = calculateEquilibriumScore(finalMetrics);

console.log(`Score de Equilibrio: ${equilibriumScore.toFixed(2)}/100`);
console.log("");

if (equilibriumScore >= 70) {
    console.log("✅ EQUILIBRIO ALCANZADO");
    console.log("");
    console.log("El sistema con los nuevos parámetros:");
    console.log(`  ✅ Mantiene ~${finalMetrics.activePositions} posiciones activas (estable)`);
    console.log(`  ✅ Exit rate de ${finalMetrics.exitRate.toFixed(2)}% (alto)`);
    console.log(`  ✅ Net flow ratio de ${finalMetrics.netFlowRatio.toFixed(2)}% (bajo)`);
    console.log("");
    console.log("🎉 SISTEMA SOSTENIBLE - Listo para despliegue!");
} else {
    console.log("⚠️  EQUILIBRIO PARCIAL");
    console.log("");
    console.log("El sistema muestra mejoras pero no alcanza equilibrio perfecto.");
    console.log("Considerar ajustes adicionales si es necesario.");
}

function calculateEquilibriumScore(metrics) {
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
    if (metrics.netFlowRatio > 15) {
        score -= (metrics.netFlowRatio - 15) * 2;
    }

    return Math.max(0, score);
}
