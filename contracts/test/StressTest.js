const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SanDigital2026 - Stress Test", function () {
    let sanDigital, mockUSDT;
    let owner, wallets;
    const APORTE = ethers.parseUnits("20", 6);
    const EXIT_THRESHOLD = ethers.parseUnits("40", 6);

    beforeEach(async function () {
        // Obtener 20 wallets (1 owner + 19 para pruebas)
        const signers = await ethers.getSigners();
        owner = signers[0];
        wallets = signers.slice(1, 20); // 19 wallets

        // Deploy MockUSDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
        await mockUSDT.waitForDeployment();

        // Deploy SanDigital2026
        const SanDigital = await ethers.getContractFactory("SanDigital2026");
        sanDigital = await SanDigital.deploy(await mockUSDT.getAddress());
        await sanDigital.waitForDeployment();

        // Mintear USDT a todas las wallets
        for (let wallet of wallets) {
            await mockUSDT.mint(wallet.address, ethers.parseUnits("10000", 6));
            await mockUSDT.connect(wallet).approve(
                await sanDigital.getAddress(),
                ethers.parseUnits("10000", 6)
            );
        }

        console.log("✅ Setup completado: 19 wallets con 10,000 USDT cada una");
    });

    describe("🔥 Test 1: Concurrencia - 19 Transacciones Simultáneas", function () {
        it("Debería manejar 19 posiciones creadas al mismo tiempo", async function () {
            this.timeout(120000); // 2 minutos

            console.log("\n🚀 Iniciando 19 transacciones simultáneas...");

            // Crear 19 promesas de transacciones
            const promises = wallets.map((wallet, i) => {
                return sanDigital.connect(wallet).join()
                    .then(tx => tx.wait())
                    .then(() => console.log(`✅ Wallet ${i + 1}/19 completada`))
                    .catch(err => console.error(`❌ Wallet ${i + 1} falló:`, err.message));
            });

            // Ejecutar todas en paralelo
            await Promise.all(promises);

            // Verificar estado final
            const activosCount = await sanDigital.getGlobalActivosCount();
            console.log(`\n📊 Posiciones activas: ${activosCount}`);

            expect(activosCount).to.equal(19n);
        });
    });

    describe("🔥 Test 2: Volumen - 100 Posiciones Secuenciales", function () {
        it("Debería manejar 100 posiciones de 20 wallets (5 cada una)", async function () {
            this.timeout(300000); // 5 minutos

            console.log("\n🚀 Creando 100 posiciones...");

            let count = 0;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 20; j++) {
                    await sanDigital.connect(wallets[j]).join();
                    count++;
                    if (count % 10 === 0) {
                        console.log(`✅ ${count}/100 posiciones creadas`);
                    }
                }
            }

            const activosCount = await sanDigital.getGlobalActivosCount();
            const completedCycles = await sanDigital.totalCompletedCycles();

            console.log(`\n📊 Resultados:`);
            console.log(`   Posiciones activas: ${activosCount}`);
            console.log(`   Ciclos completados: ${completedCycles}`);

            // Verificar integridad
            expect(Number(activosCount) + Number(completedCycles)).to.be.at.most(100);
        });
    });

    describe("🔥 Test 3: Edge Case - Claims Durante Creación", function () {
        it("Debería manejar claims mientras se crean posiciones", async function () {
            this.timeout(180000); // 3 minutos

            console.log("\n🚀 Test de claims concurrentes...");

            // Crear 10 posiciones iniciales
            for (let i = 0; i < 10; i++) {
                await sanDigital.connect(wallets[i]).join();
            }

            // Crear más posiciones Y hacer claims al mismo tiempo
            const createPromises = [];
            const claimPromises = [];

            for (let i = 10; i < 20; i++) {
                createPromises.push(
                    sanDigital.connect(wallets[i]).join()
                        .then(tx => tx.wait())
                );
            }

            for (let i = 0; i < 5; i++) {
                claimPromises.push(
                    sanDigital.connect(wallets[i]).claimAll()
                        .then(tx => tx.wait())
                        .catch(() => { }) // Ignorar si no hay saldo
                );
            }

            await Promise.all([...createPromises, ...claimPromises]);

            console.log("✅ Claims y creaciones concurrentes completadas");
        });
    });

    describe("🔥 Test 4: Integridad de Fondos", function () {
        it("Debería mantener balance correcto: totalSaldosUsuarios = suma individual", async function () {
            this.timeout(120000);

            console.log("\n🚀 Verificando integridad de fondos...");

            // Crear 30 posiciones
            for (let i = 0; i < 30; i++) {
                await sanDigital.connect(wallets[i]).join();
            }

            // Obtener totalSaldosUsuarios del contrato
            const totalSaldosUsuarios = await sanDigital.totalSaldosUsuarios();

            // Calcular suma de saldos individuales
            let sumaIndividual = 0n;
            for (let i = 0; i < 30; i++) {
                const posIds = await sanDigital.getUserPositions(wallets[i].address);
                for (let posId of posIds) {
                    const balance = await sanDigital.getPositionBalance(posId);
                    sumaIndividual += balance;
                }
            }

            console.log(`\n📊 Verificación:`);
            console.log(`   Total del contrato: ${ethers.formatUnits(totalSaldosUsuarios, 6)} USDT`);
            console.log(`   Suma individual:    ${ethers.formatUnits(sumaIndividual, 6)} USDT`);

            expect(totalSaldosUsuarios).to.equal(sumaIndividual);
        });
    });

    describe("🔥 Test 5: Gas Límite", function () {
        it("Debería medir gas usado en diferentes escenarios", async function () {
            this.timeout(60000);

            console.log("\n🚀 Midiendo consumo de gas...");

            // Escenario 1: Primera posición (array vacío)
            const tx1 = await sanDigital.connect(wallets[0]).join();
            const receipt1 = await tx1.wait();
            console.log(`   Primera posición: ${receipt1.gasUsed} gas`);

            // Escenario 2: Con 10 posiciones activas
            for (let i = 1; i < 10; i++) {
                await sanDigital.connect(wallets[i]).join();
            }
            const tx2 = await sanDigital.connect(wallets[10]).join();
            const receipt2 = await tx2.wait();
            console.log(`   Con 10 activas:   ${receipt2.gasUsed} gas`);

            // Escenario 3: Claim
            const tx3 = await sanDigital.connect(wallets[0]).claimAll();
            const receipt3 = await tx3.wait();
            console.log(`   Claim:            ${receipt3.gasUsed} gas`);

            // Verificar que no excede límites razonables
            expect(receipt1.gasUsed).to.be.lessThan(500000n);
            expect(receipt2.gasUsed).to.be.lessThan(500000n);
            expect(receipt3.gasUsed).to.be.lessThan(500000n);
        });
    });
});
