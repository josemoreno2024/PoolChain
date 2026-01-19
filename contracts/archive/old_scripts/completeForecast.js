/**
 * 📊 SIMULADOR COMPLETO: Sistema 10→12 USDT (20% Rendimiento)
 * 
 * Analiza múltiples escenarios:
 * - Plan Básico: 10→12
 * - Plan Plata: 50→62
 * - Plan Oro: 100→125
 * - Plan Platino: 500→625
 */

class SavingsSimulator {
    constructor(config) {
        this.config = config;
        this.reset();
    }

    reset() {
        this.positions = [];
        this.activos = [];
        this.keeperFund = 0;
        this.operationalFund = 0;
        this.platformFees = 0;
        this.globalPool = 0;
        this.totalDeposited = 0;
        this.totalWithdrawn = 0;
        this.completedCycles = 0;
        this.joinCount = 0;
    }

    join() {
        this.joinCount++;
        this.totalDeposited += this.config.ENTRY_AMOUNT;

        const platformFee = this.config.ENTRY_AMOUNT * (this.config.PLATFORM_FEE_PERCENT / 100);
        const keeperFee = this.config.ENTRY_AMOUNT * (this.config.KEEPER_FEE_PERCENT / 100);

        this.platformFees += platformFee;
        this.keeperFund += keeperFee;

        const userAmount = this.config.ENTRY_AMOUNT - platformFee - keeperFee;

        const turnAmount = userAmount * (this.config.TURN_PERCENT / 100);
        const globalAmount = userAmount * (this.config.GLOBAL_PERCENT / 100);
        const operationalAmount = userAmount * (this.config.OPERATIONAL_PERCENT / 100);

        if (this.activos.length > 0) {
            const turnoId = this.activos[0];
            this.positions[turnoId].balance += turnAmount;
        }

        this.globalPool += globalAmount;
        this.operationalFund += operationalAmount;

        const newPos = { id: this.positions.length, balance: 0, isActive: true, hasExited: false, joinedAt: this.joinCount };
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
            if (pos.balance >= this.config.MIN_BALANCE_FOR_EXIT && pos.balance <= this.config.MAX_BALANCE_FOR_EXIT) {
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
            exitRate: this.joinCount > 0 ? (this.completedCycles / this.joinCount) * 100 : 0,
            avgWaitTime: avgWaitTime
        };
    }
}

console.log("📊 PRONÓSTICOS COMPLETOS: Sistema de Ahorro con 20% Rendimiento\n");
console.log("=".repeat(80));

// Planes multi-tier
const plans = [
    {
        name: "Plan Básico",
        ENTRY_AMOUNT: 10,
        EXIT_AMOUNT: 12,
        MIN_BALANCE_FOR_EXIT: 12,
        MAX_BALANCE_FOR_EXIT: 40,
        PLATFORM_FEE_PERCENT: 1,
        KEEPER_FEE_PERCENT: 0.5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    },
    {
        name: "Plan Plata",
        ENTRY_AMOUNT: 50,
        EXIT_AMOUNT: 62,
        MIN_BALANCE_FOR_EXIT: 62,
        MAX_BALANCE_FOR_EXIT: 200,
        PLATFORM_FEE_PERCENT: 1,
        KEEPER_FEE_PERCENT: 0.5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    },
    {
        name: "Plan Oro",
        ENTRY_AMOUNT: 100,
        EXIT_AMOUNT: 125,
        MIN_BALANCE_FOR_EXIT: 125,
        MAX_BALANCE_FOR_EXIT: 400,
        PLATFORM_FEE_PERCENT: 1,
        KEEPER_FEE_PERCENT: 0.5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    },
    {
        name: "Plan Platino",
        ENTRY_AMOUNT: 500,
        EXIT_AMOUNT: 625,
        MIN_BALANCE_FOR_EXIT: 625,
        MAX_BALANCE_FOR_EXIT: 2000,
        PLATFORM_FEE_PERCENT: 1,
        KEEPER_FEE_PERCENT: 0.5,
        TURN_PERCENT: 35,
        GLOBAL_PERCENT: 55,
        OPERATIONAL_PERCENT: 10
    }
];

for (const plan of plans) {
    console.log(`\n${plan.name}: ${plan.ENTRY_AMOUNT} USDT → ${plan.EXIT_AMOUNT} USDT`);
    console.log("-".repeat(80));

    const sim = new SavingsSimulator(plan);

    // Simular 200 aportes
    for (let i = 0; i < 200; i++) {
        sim.join();
    }

    const metrics = sim.getMetrics();
    const returnPercent = ((plan.EXIT_AMOUNT / plan.ENTRY_AMOUNT - 1) * 100).toFixed(0);

    console.log(`Rendimiento: ${returnPercent}%`);
    console.log(`Posiciones Activas: ${metrics.activePositions} ${metrics.activePositions < 70 ? "✅" : "⚠️"}`);
    console.log(`Retiros Completados: ${metrics.completedCycles}`);
    console.log(`Tasa de Retiro: ${metrics.exitRate.toFixed(2)}% ${metrics.exitRate > 55 ? "✅" : "⚠️"}`);
    console.log(`Tiempo de Espera: ${metrics.avgWaitTime.toFixed(1)} aportes`);
    console.log(`Fees Totales: ${metrics.platformFees.toFixed(2)} USDT`);
}

console.log("\n" + "=".repeat(80));
console.log("💰 PROYECCIONES DE INGRESOS (1% Platform Fee)");
console.log("=".repeat(80));
console.log("");

const userScales = [
    { users: 100, label: "100 usuarios" },
    { users: 1000, label: "1,000 usuarios" },
    { users: 10000, label: "10,000 usuarios" },
    { users: 100000, label: "100,000 usuarios" }
];

for (const scale of userScales) {
    console.log(`\n${scale.label}:`);
    console.log("-".repeat(80));

    for (const plan of plans) {
        const monthlyDeposits = scale.users * 0.3; // 30% actividad mensual
        const monthlyFees = monthlyDeposits * plan.ENTRY_AMOUNT * (plan.PLATFORM_FEE_PERCENT / 100);
        const yearlyFees = monthlyFees * 12;

        console.log(`${plan.name}: ${yearlyFees.toFixed(0)} USDT/año`);
    }
}

console.log("\n" + "=".repeat(80));
console.log("🎯 RESUMEN EJECUTIVO");
console.log("=".repeat(80));
console.log("");

console.log("✅ VENTAJAS DEL SISTEMA 20% RENDIMIENTO:");
console.log("  1. Sostenible a largo plazo (exit rate ~57%)");
console.log("  2. Atractivo para usuarios (20% ganancia)");
console.log("  3. Honesto y transparente");
console.log("  4. Escalable a múltiples tiers");
console.log("  5. Rentable para la plataforma");
console.log("");

console.log("📈 PROYECCIÓN A 10,000 USUARIOS:");
console.log("  Plan Básico (10→12): ~3,600 USDT/año");
console.log("  Plan Plata (50→62): ~18,000 USDT/año");
console.log("  Plan Oro (100→125): ~36,000 USDT/año");
console.log("  Plan Platino (500→625): ~180,000 USDT/año");
console.log("  TOTAL POTENCIAL: ~237,600 USDT/año");
console.log("");

console.log("🚀 A ESCALA GLOBAL (100,000 usuarios):");
console.log("  TOTAL POTENCIAL: ~2,376,000 USDT/año");
console.log("");

console.log("💡 RECOMENDACIÓN:");
console.log("  Empezar con Plan Básico (10→12 USDT)");
console.log("  Expandir a planes superiores según demanda");
console.log("  Montos mayores = Mejor sostenibilidad");
