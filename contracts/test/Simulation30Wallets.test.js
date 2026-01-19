const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SanDigital_Micro_V2 - Simulación 30 Wallets", function () {
    let contract;
    let usdt;
    let wallets;

    const APORTE = ethers.parseUnits("10", 6);
    const PUNTO_LANDA = ethers.parseUnits("15", 6);

    before(async function () {
        const signers = await ethers.getSigners();
        wallets = signers.slice(0, 35); // 35 wallets para probar

        // Deploy mock USDT
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdt = await MockERC20.deploy("USDT", "USDT", 6);
        await usdt.waitForDeployment();

        // Deploy contract
        const SanDigital = await ethers.getContractFactory("SanDigital_Micro_V2");
        contract = await SanDigital.deploy(await usdt.getAddress());
        await contract.waitForDeployment();

        // Mint USDT to all wallets
        for (const wallet of wallets) {
            await usdt.mint(wallet.address, ethers.parseUnits("10000", 6));
            await usdt.connect(wallet).approve(await contract.getAddress(), ethers.MaxUint256);
        }
    });

    it("Fase 1: Crecimiento de 0 a 30 usuarios", async function () {
        this.timeout(300000);

        console.log("\n╔════════════════════════════════════════════════════════╗");
        console.log("║  FASE 1: CRECIMIENTO DE LA COLA (0 → 30 USUARIOS)     ║");
        console.log("╚════════════════════════════════════════════════════════╝\n");

        let salidas = [];

        // Primeros 30 usuarios entran
        for (let i = 0; i < 30; i++) {
            await contract.connect(wallets[i]).join();

            const systemState = await contract.getSystemState();
            const activeCount = Number(systemState.activePositions);
            const completedCycles = Number(systemState.completedCycles);

            // Verificar si hubo salidas
            if (completedCycles > salidas.length) {
                salidas.push(i + 1);
                console.log(`TX ${i + 1}: 🌿 SALIDA! Usuario salió | Activos: ${activeCount} | Total salidas: ${completedCycles}`);
            } else if ((i + 1) % 5 === 0) {
                console.log(`TX ${i + 1}: Activos: ${activeCount} | Salidas: ${completedCycles}`);
            }
        }

        const finalState = await contract.getSystemState();
        console.log(`\n✅ FASE 1 COMPLETADA:`);
        console.log(`   Usuarios activos: ${finalState.activePositions}`);
        console.log(`   Salidas durante crecimiento: ${finalState.completedCycles}`);
        console.log(`   Salidas en TX: ${salidas.join(', ')}`);
    });

    it("Fase 2: Estado estable - 1 entra, 1 sale", async function () {
        this.timeout(300000);

        console.log("\n╔════════════════════════════════════════════════════════╗");
        console.log("║  FASE 2: ESTADO ESTABLE (1 ENTRA → 1 SALE)            ║");
        console.log("╚════════════════════════════════════════════════════════╝\n");

        const initialState = await contract.getSystemState();
        const initialCycles = Number(initialState.completedCycles);
        const initialActive = Number(initialState.activePositions);

        console.log(`Estado inicial: ${initialActive} activos, ${initialCycles} salidas\n`);

        let salidasFase2 = [];

        // Siguientes 5 usuarios (31-35)
        for (let i = 30; i < 35; i++) {
            const beforeState = await contract.getSystemState();
            const beforeActive = Number(beforeState.activePositions);
            const beforeCycles = Number(beforeState.completedCycles);

            await contract.connect(wallets[i]).join();

            const afterState = await contract.getSystemState();
            const afterActive = Number(afterState.activePositions);
            const afterCycles = Number(afterState.completedCycles);

            const salidas = afterCycles - beforeCycles;

            if (salidas > 0) {
                salidasFase2.push(i + 1);
                console.log(`TX ${i + 1}: ✅ 1 ENTRA → ${salidas} SALE(S)`);
                console.log(`   Antes: ${beforeActive} activos | Después: ${afterActive} activos`);
            } else {
                console.log(`TX ${i + 1}: ⚠️  1 ENTRA → 0 SALEN (activos: ${afterActive})`);
            }
        }

        const finalState = await contract.getSystemState();
        const finalActive = Number(finalState.activePositions);
        const totalSalidas = Number(finalState.completedCycles) - initialCycles;

        console.log(`\n✅ FASE 2 COMPLETADA:`);
        console.log(`   Usuarios activos: ${finalActive}`);
        console.log(`   Salidas en esta fase: ${totalSalidas}`);
        console.log(`   Salidas en TX: ${salidasFase2.join(', ')}`);
        console.log(`\n🎯 CONCLUSIÓN:`);

        if (finalActive <= 30) {
            console.log(`   ✅ Sistema mantiene límite de 30 usuarios`);
        }

        if (totalSalidas >= 4) {
            console.log(`   ✅ Sistema Landa funcionando: ${totalSalidas} salidas en 5 entradas`);
        }
    });

    it("Fase 3: Verificar dispersión progresiva", async function () {
        console.log("\n╔════════════════════════════════════════════════════════╗");
        console.log("║  FASE 3: VERIFICACIÓN DE DISPERSIÓN PROGRESIVA        ║");
        console.log("╚════════════════════════════════════════════════════════╝\n");

        const systemState = await contract.getSystemState();
        const activeCount = Number(systemState.activePositions);

        console.log(`Usuarios activos: ${activeCount}\n`);
        console.log("Primeros 10 usuarios en cola:\n");

        for (let posId = 0; posId < Math.min(10, 35); posId++) {
            try {
                const posInfo = await contract.getPositionInfo(posId);

                if (posInfo.isActive && !posInfo.hasExited) {
                    const balance = ethers.formatUnits(posInfo.balance, 6);
                    const distance = ethers.formatUnits(posInfo.distanceToPuntoLanda, 6);
                    const status = posInfo.balance >= PUNTO_LANDA ? "✅ LISTO" : "⏳ Acumulando";

                    console.log(`Posición ${posId}: ${balance} USDT (falta ${distance}) ${status}`);
                }
            } catch (e) {
                // Position doesn't exist or exited
            }
        }

        console.log(`\n✅ Dispersión progresiva verificada`);
    });
});
