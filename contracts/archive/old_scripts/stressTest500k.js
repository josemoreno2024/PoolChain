/**
 * 🔬 PRUEBA DE ESTRÉS: 500,000 Transacciones
 * 
 * Simula medio millón de operaciones para verificar
 * si el sistema alcanza equilibrio o colapsa.
 */

class StressTestSimulator {
    constructor(config) {
        this.config = config;
        this.reset();
        this.snapshots = [];
    }

    reset() {
        this.positions = [];
        this.activos = [];
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
        const userAmount = this.config.ENTRY_AMOUNT - platformFee - keeperFee;

        const turnAmount = userAmount * (this.config.TURN_PERCENT / 100);
        const globalAmount = userAmount * (this.config.GLOBAL_PERCENT / 100);

        if (this.activos.length > 0) {
            const turnoId = this.activos[0];
            this.positions[turnoId].balance += turnAmount;
        }

        this.globalPool += globalAmount;

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
        pos.balance = 0;

        const index = this.activos.indexOf(posId);
        if (index > -1) {
            this.activos.splice(index, 1);
        }

        this.totalWithdrawn += this.config.EXIT_AMOUNT;
        this.completedCycles++;
    }

    takeSnapshot() {
        const exitRate = this.joinCount > 0 ? (this.completedCycles / this.joinCount) * 100 : 0;
        return {
            joins: this.joinCount,
            activePositions: this.activos.length,
            exits: this.completedCycles,
            exitRate: exitRate,
            fees: this.platformFees
        };
    }
}

const config = {
    ENTRY_AMOUNT: 10,
    EXIT_AMOUNT: 12,
    MIN_BALANCE_FOR_EXIT: 12,
    MAX_BALANCE_FOR_EXIT: 40,
    PLATFORM_FEE_PERCENT: 1,
    KEEPER_FEE_PERCENT: 0.5,
    TURN_PERCENT: 35,
    GLOBAL_PERCENT: 55,
    OPERATIONAL_PERCENT: 10
};

console.log("🔬 PRUEBA DE ESTRÉS: 500,000 Transacciones\n");
console.log("=".repeat(80));
console.log("Sistema: 10 USDT → 12 USDT (20% rendimiento)");
console.log("=".repeat(80));
console.log("");

const sim = new StressTestSimulator(config);
const checkpoints = [1000, 5000, 10000, 50000, 100000, 250000, 500000];
let lastCheckpoint = 0;

console.log("Ejecutando simulación...\n");

for (let i = 1; i <= 500000; i++) {
    sim.join();

    if (checkpoints.includes(i)) {
        const snapshot = sim.takeSnapshot();
        console.log(`Transacción #${i.toLocaleString()}:`);
        console.log(`  Posiciones Activas: ${snapshot.activePositions.toLocaleString()}`);
        console.log(`  Salidas Completadas: ${snapshot.exits.toLocaleString()}`);
        console.log(`  Tasa de Salida: ${snapshot.exitRate.toFixed(2)}%`);
        console.log(`  Fees Acumulados: ${snapshot.fees.toLocaleString()} USDT`);
        console.log("");
    }
}

const final = sim.takeSnapshot();

console.log("=".repeat(80));
console.log("📊 RESULTADO FINAL - 500,000 TRANSACCIONES");
console.log("=".repeat(80));
console.log("");

console.log(`Total Transacciones: ${final.joins.toLocaleString()}`);
console.log(`Posiciones Activas: ${final.activePositions.toLocaleString()} ${final.activePositions < 100 ? "✅" : final.activePositions < 200 ? "⚠️" : "❌"}`);
console.log(`Salidas Completadas: ${final.exits.toLocaleString()}`);
console.log(`Tasa de Salida: ${final.exitRate.toFixed(2)}% ${final.exitRate > 55 ? "✅" : "❌"}`);
console.log(`Fees Totales: ${final.fees.toLocaleString()} USDT`);
console.log("");

console.log("=".repeat(80));
console.log("🎯 ANÁLISIS DE ESTABILIDAD");
console.log("=".repeat(80));
console.log("");

const isStable = final.activePositions < 100;
const isCollapsing = final.activePositions > 200;

if (isStable) {
    console.log("✅ SISTEMA ESTABLE");
    console.log("");
    console.log("Después de 500,000 transacciones:");
    console.log(`  ✅ Cola controlada (~${final.activePositions} posiciones)`);
    console.log(`  ✅ Tasa de salida sostenida (${final.exitRate.toFixed(1)}%)`);
    console.log(`  ✅ Sistema NO colapsa`);
    console.log(`  ✅ Puede continuar indefinidamente`);
    console.log("");
    console.log("💰 Ingresos generados: " + final.fees.toLocaleString() + " USDT");
} else if (isCollapsing) {
    console.log("❌ SISTEMA COLAPSANDO");
    console.log("");
    console.log("Después de 500,000 transacciones:");
    console.log(`  ❌ Cola creciendo (${final.activePositions} posiciones)`);
    console.log(`  ❌ Tasa de salida insuficiente (${final.exitRate.toFixed(1)}%)`);
    console.log(`  ❌ Sistema eventualmente colapsará`);
} else {
    console.log("⚠️  SISTEMA EN ZONA CRÍTICA");
    console.log("");
    console.log("Después de 500,000 transacciones:");
    console.log(`  ⚠️  Cola moderada (${final.activePositions} posiciones)`);
    console.log(`  ⚠️  Tasa de salida aceptable (${final.exitRate.toFixed(1)}%)`);
    console.log(`  ⚠️  Requiere monitoreo continuo`);
}

console.log("");
console.log("=".repeat(80));
console.log("💡 CONCLUSIÓN");
console.log("=".repeat(80));
console.log("");

if (final.exitRate > 55 && final.activePositions < 100) {
    console.log("🎉 El sistema 10→12 USDT (20% rendimiento) es SOSTENIBLE a largo plazo!");
    console.log("");
    console.log("Puede manejar millones de transacciones sin colapsar.");
    console.log("La cola se mantiene estable y la tasa de salida es saludable.");
} else {
    console.log("⚠️  El sistema necesita ajustes para garantizar sostenibilidad a largo plazo.");
}
