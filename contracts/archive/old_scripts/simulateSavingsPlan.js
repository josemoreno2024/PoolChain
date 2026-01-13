/**
 * 🏦 SIMULADOR DE SISTEMA DE AHORRO
 * 
 * Plan Básico: 10 USDT → 15 USDT (50% rendimiento)
 * 
 * Analiza:
 * - Sostenibilidad del sistema
 * - Tiempo promedio de espera
 * - Posiciones activas en equilibrio
 * - Proyecciones de ingresos por fees
 */

class SavingsSystemSimulator {
    constructor(config) {
        this.config = config;
        this.reset();
    }

    reset() {
        this.positions = [];
        this.activos = [];
        this.keeperFund = 0;
        this.operationalFund = 0;
        this.platformFees = 0;  // Nuevo: fees para el dueño
        this.globalPool = 0;
        this.totalDeposited = 0;
        this.totalWithdrawn = 0;
        this.completedCycles = 0;
        this.joinCount = 0;
    }

    join() {
        this.joinCount++;
        this.totalDeposited += this.config.ENTRY_AMOUNT;

        // Fees
        const platformFee = this.config.ENTRY_AMOUNT * (this.config.PLATFORM_FEE_PERCENT / 100);
        const keeperFee = this.config.ENTRY_AMOUNT * (this.config.KEEPER_FEE_PERCENT / 100);

        this.platformFees += platformFee;
        this.keeperFund += keeperFee;

        // Usuario recibe
        const userAmount = this.config.ENTRY_AMOUNT - platformFee - keeperFee;

        // Distribuciones
        const turnAmount = userAmount * (this.config.TURN_PERCENT / 100);
        const globalAmount = userAmount * (this.config.GLOBAL_PERCENT / 100);
        const operationalAmount = userAmount * (this.config.OPERATIONAL_PERCENT / 100);

        // Pagar turno
        if (this.activos.length > 0) {
            const turnoId = this.activos[0];
            this.positions[turnoId].balance += turnAmount;
        }

        this.globalPool += globalAmount;
        this.operationalFund += operationalAmount;

        // Crear posición
        const newPos = {
            id: this.positions.length,
            balance: 0,
            isActive: true,
            hasExited: false,
            joinedAt: this.joinCount
        };
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
        pos.exitedAt = this.joinCount;

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

        // Calcular tiempo promedio de espera
        const exitedPositions = this.positions.filter(p => p.hasExited);
        const avgWaitTime = exitedPositions.length > 0
            ? exitedPositions.reduce((sum, p) => sum + (p.exitedAt - p.joinedAt), 0) / exitedPositions.length
            : 0;

        return {
            joinCount: this.joinCount,
            activePositions,
            completedCycles: this.completedCycles,
            totalDeposited: this.totalDeposited,
            totalWithdrawn: this.totalWithdrawn,
            platformFees: this.platformFees,
            netFlow: this.totalDeposited - this.totalWithdrawn,
            avgBalance: activePositions > 0 ? totalUserBalances / activePositions : 0,
            exitRate: this.joinCount > 0 ? (this.completedCycles / this.joinCount) * 100 : 0,
            netFlowRatio: this.totalDeposited > 0 ? (this.totalDeposited - this.totalWithdrawn) / this.totalDeposited * 100 : 0,
            avgWaitTime: avgWaitTime
        };
    }
}

// Configuración: Plan Básico 10→15
const basicPlan = {
    name: "Plan Básico de Ahorro",
    ENTRY_AMOUNT: 10,
    EXIT_AMOUNT: 15,
    MIN_BALANCE_FOR_EXIT: 15,
    MAX_BALANCE_FOR_EXIT: 40,
    PLATFORM_FEE_PERCENT: 1,    // 1% para el dueño
    KEEPER_FEE_PERCENT: 0.5,    // 0.5% para operación
    TURN_PERCENT: 35,
    GLOBAL_PERCENT: 55,
    OPERATIONAL_PERCENT: 10
};

console.log("🏦 SISTEMA DE AHORRO CON RENDIMIENTO\n");
console.log("=".repeat(80));
console.log("PLAN BÁSICO: Ahorra 10 USDT → Recibe 15 USDT");
console.log("=".repeat(80));
console.log("");

console.log("📋 PARÁMETROS:");
console.log(`  Aporte: ${basicPlan.ENTRY_AMOUNT} USDT`);
console.log(`  Retiro: ${basicPlan.EXIT_AMOUNT} USDT`);
console.log(`  Rendimiento: ${((basicPlan.EXIT_AMOUNT / basicPlan.ENTRY_AMOUNT - 1) * 100).toFixed(0)}%`);
console.log(`  Fee de plataforma: ${basicPlan.PLATFORM_FEE_PERCENT}%`);
console.log(`  Fee operacional: ${basicPlan.KEEPER_FEE_PERCENT}%`);
console.log("");

const sim = new SavingsSystemSimulator(basicPlan);

console.log("=".repeat(80));
console.log("SIMULANDO 200 APORTES...");
console.log("=".repeat(80));
console.log("");

// Simular 200 joins
for (let i = 1; i <= 200; i++) {
    sim.join();

    if ([10, 20, 50, 100, 150, 200].includes(i)) {
        const metrics = sim.getMetrics();
        console.log(`Aporte #${i}:`);
        console.log(`  Posiciones Activas: ${metrics.activePositions}`);
        console.log(`  Retiros Completados: ${metrics.completedCycles}`);
        console.log(`  Tasa de Retiro: ${metrics.exitRate.toFixed(2)}%`);
        console.log(`  Tiempo Promedio de Espera: ${metrics.avgWaitTime.toFixed(1)} aportes`);
        console.log(`  Fees Acumulados: ${metrics.platformFees.toFixed(2)} USDT`);
        console.log("");
    }
}

const finalMetrics = sim.getMetrics();

console.log("=".repeat(80));
console.log("📊 RESULTADOS FINALES");
console.log("=".repeat(80));
console.log("");

console.log("💰 MÉTRICAS DEL SISTEMA:");
console.log(`  Total Aportes: ${finalMetrics.joinCount}`);
console.log(`  Posiciones Activas: ${finalMetrics.activePositions} ${finalMetrics.activePositions < 60 ? "✅" : "⚠️"}`);
console.log(`  Retiros Completados: ${finalMetrics.completedCycles}`);
console.log(`  Tasa de Retiro: ${finalMetrics.exitRate.toFixed(2)}% ${finalMetrics.exitRate > 50 ? "✅" : "⚠️"}`);
console.log(`  Tiempo Promedio de Espera: ${finalMetrics.avgWaitTime.toFixed(1)} aportes`);
console.log("");

console.log("💵 FLUJO DE FONDOS:");
console.log(`  Total Depositado: ${finalMetrics.totalDeposited.toFixed(2)} USDT`);
console.log(`  Total Retirado: ${finalMetrics.totalWithdrawn.toFixed(2)} USDT`);
console.log(`  Net Flow: ${finalMetrics.netFlow.toFixed(2)} USDT`);
console.log(`  Net Flow Ratio: ${finalMetrics.netFlowRatio.toFixed(2)}%`);
console.log("");

console.log("🏦 INGRESOS DE PLATAFORMA:");
console.log(`  Fees Totales: ${finalMetrics.platformFees.toFixed(2)} USDT`);
console.log(`  Fee por Aporte: ${(finalMetrics.platformFees / finalMetrics.joinCount).toFixed(4)} USDT`);
console.log("");

console.log("=".repeat(80));
console.log("📈 PROYECCIONES A ESCALA");
console.log("=".repeat(80));
console.log("");

const scales = [
    { users: 100, label: "100 usuarios" },
    { users: 1000, label: "1,000 usuarios" },
    { users: 10000, label: "10,000 usuarios" },
    { users: 100000, label: "100,000 usuarios" }
];

for (const scale of scales) {
    const monthlyJoins = scale.users * 0.5; // Asumiendo 50% actividad mensual
    const monthlyFees = monthlyJoins * basicPlan.ENTRY_AMOUNT * (basicPlan.PLATFORM_FEE_PERCENT / 100);
    const yearlyFees = monthlyFees * 12;

    console.log(`${scale.label}:`);
    console.log(`  Aportes/mes: ${monthlyJoins.toFixed(0)}`);
    console.log(`  Ingresos/mes: ${monthlyFees.toFixed(2)} USDT`);
    console.log(`  Ingresos/año: ${yearlyFees.toFixed(2)} USDT`);
    console.log("");
}

console.log("=".repeat(80));
console.log("🎯 EVALUACIÓN DE SOSTENIBILIDAD");
console.log("=".repeat(80));
console.log("");

const score = calculateScore(finalMetrics);

console.log(`Score de Sostenibilidad: ${score.toFixed(2)}/100`);
console.log("");

if (score >= 60) {
    console.log("✅ SISTEMA SOSTENIBLE");
    console.log("");
    console.log("El Plan Básico de Ahorro es viable:");
    console.log(`  ✅ Posiciones activas estables (~${finalMetrics.activePositions})`);
    console.log(`  ✅ Tasa de retiro saludable (${finalMetrics.exitRate.toFixed(0)}%)`);
    console.log(`  ✅ Tiempo de espera razonable (~${finalMetrics.avgWaitTime.toFixed(0)} aportes)`);
    console.log(`  ✅ Rendimiento atractivo (50%)`);
    console.log("");
    console.log("🎉 LISTO PARA IMPLEMENTACIÓN!");
} else {
    console.log("⚠️  REQUIERE AJUSTES");
    console.log("");
    console.log("El sistema necesita optimización:");
    console.log(`  - Posiciones activas: ${finalMetrics.activePositions}`);
    console.log(`  - Tasa de retiro: ${finalMetrics.exitRate.toFixed(2)}%`);
    console.log("");
    console.log("💡 Considerar ajustar parámetros.");
}

function calculateScore(metrics) {
    let score = 100;

    if (metrics.activePositions > 50) {
        score -= (metrics.activePositions - 50) * 1;
    }

    if (metrics.exitRate < 60) {
        score -= (60 - metrics.exitRate) * 0.5;
    }

    if (metrics.netFlowRatio > 30) {
        score -= (metrics.netFlowRatio - 30) * 1;
    }

    return Math.max(0, score);
}
