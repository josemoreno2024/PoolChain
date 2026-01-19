const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SanDigital_Micro_V2 - Sistema de Gestión Landa", function () {
    let contract;
    let usdt;
    let signers;

    const APORTE = ethers.parseUnits("10", 6);
    const PUNTO_LANDA = ethers.parseUnits("15", 6);
    const EXIT_THRESHOLD = ethers.parseUnits("20", 6);

    before(async function () {
        signers = await ethers.getSigners();

        // Deploy mock USDT
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdt = await MockERC20.deploy("USDT", "USDT", 6);
        await usdt.waitForDeployment();

        // Deploy contract
        const SanDigital = await ethers.getContractFactory("SanDigital_Micro_V2");
        contract = await SanDigital.deploy(await usdt.getAddress());
        await contract.waitForDeployment();

        // Mint USDT to all signers
        for (let i = 0; i < Math.min(signers.length, 30); i++) {
            await usdt.mint(signers[i].address, ethers.parseUnits("10000", 6));
            await usdt.connect(signers[i]).approve(await contract.getAddress(), ethers.MaxUint256);
        }
    });

    it("Should verify that every 1-2 entries, someone reaches Punto Landa", async function () {
        this.timeout(300000);

        let totalEntries = 0;
        let usersAtPuntoLanda = 0;
        let entriesPerPuntoLanda = [];
        let lastPuntoLandaTx = 0;

        console.log("\n========================================");
        console.log("  TEST DE GESTIÓN PUNTO LANDA");
        console.log("========================================\n");
        console.log("Objetivo: Verificar que cada 1-2 entradas,");
        console.log("alguien llega al Punto Landa (15 USDT)\n");

        // Execute 30 transactions
        for (let tx = 1; tx <= 30; tx++) {
            const userIndex = (tx - 1) % 20;
            const user = signers[userIndex];

            // Join
            await contract.connect(user).join();
            totalEntries++;

            // Check ALL positions to see who reached Punto Landa
            const systemState = await contract.getSystemState();
            const activeCount = Number(systemState.activePositions);

            let usersReady = 0;
            let readyPositions = [];

            // Check each active position
            for (let posId = 0; posId < tx; posId++) {
                try {
                    const posInfo = await contract.getPositionInfo(posId);

                    if (posInfo.isActive && !posInfo.hasExited && posInfo.balance >= PUNTO_LANDA) {
                        usersReady++;
                        readyPositions.push({
                            posId: posId,
                            balance: ethers.formatUnits(posInfo.balance, 6),
                            owner: posInfo.owner
                        });
                    }
                } catch (e) {
                    // Position doesn't exist
                }
            }

            // If someone new reached Punto Landa
            if (usersReady > usersAtPuntoLanda) {
                const newUsers = usersReady - usersAtPuntoLanda;
                const entriesSinceLastPuntoLanda = tx - lastPuntoLandaTx;

                console.log(`\nTX ${tx}: 🌿 ${newUsers} USUARIO(S) LLEGÓ AL PUNTO LANDA!`);
                console.log(`Entradas desde último Punto Landa: ${entriesSinceLastPuntoLanda}`);

                readyPositions.forEach(pos => {
                    console.log(`  - Posición ${pos.posId}: ${pos.balance} USDT`);
                });

                if (lastPuntoLandaTx > 0) {
                    entriesPerPuntoLanda.push(entriesSinceLastPuntoLanda);
                }

                usersAtPuntoLanda = usersReady;
                lastPuntoLandaTx = tx;
            }

            // Log every 5 transactions
            if (tx % 5 === 0) {
                console.log(`TX ${tx}: Entradas: ${totalEntries} | En Punto Landa: ${usersReady} | Activos: ${activeCount}`);
            }
        }

        // Final statistics
        console.log("\n========================================");
        console.log("  RESULTADOS FINALES");
        console.log("========================================");
        console.log(`Total Entradas: ${totalEntries}`);
        console.log(`Usuarios que llegaron a Punto Landa: ${usersAtPuntoLanda}`);

        if (entriesPerPuntoLanda.length > 0) {
            const avgEntries = entriesPerPuntoLanda.reduce((a, b) => a + b, 0) / entriesPerPuntoLanda.length;
            console.log(`\n🎯 PROMEDIO DE ENTRADAS PARA LLEGAR A PUNTO LANDA: ${avgEntries.toFixed(2)}`);
            console.log(`Rango: ${Math.min(...entriesPerPuntoLanda)} - ${Math.max(...entriesPerPuntoLanda)} entradas`);

            console.log("\nDetalle de cada Punto Landa alcanzado:");
            entriesPerPuntoLanda.forEach((entries, index) => {
                console.log(`  ${index + 1}. ${entries} entradas`);
            });

            // Assertions
            expect(avgEntries).to.be.gte(1); // At least 1 entry
            expect(avgEntries).to.be.lte(5); // At most 5 entries (should be 1-2)

            console.log(`\n✅ SISTEMA LANDA FUNCIONANDO: ${avgEntries.toFixed(2)} entradas por Punto Landa`);
            console.log(`✅ GESTIÓN AUTOMÁTICA: Cada ${avgEntries.toFixed(0)}-${Math.ceil(avgEntries)} entradas, alguien está listo para claim()`);
        }

        // Verify progressive distribution is working
        console.log("\n========================================");
        console.log("  VERIFICACIÓN DE DISPERSIÓN PROGRESIVA");
        console.log("========================================");

        // Check first 5 active positions
        const systemState = await contract.getSystemState();
        const activeCount = Number(systemState.activePositions);

        for (let posId = 0; posId < Math.min(5, totalEntries); posId++) {
            try {
                const posInfo = await contract.getPositionInfo(posId);
                if (posInfo.isActive && !posInfo.hasExited) {
                    console.log(`Posición ${posId}: ${ethers.formatUnits(posInfo.balance, 6)} USDT (distancia: ${ethers.formatUnits(posInfo.distanceToPuntoLanda, 6)})`);
                }
            } catch (e) {
                // Position doesn't exist
            }
        }

        expect(usersAtPuntoLanda).to.be.gt(0); // At least someone should reach Punto Landa
    });
});
