const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SanDigital2026 - Stress Test Simplificado", function () {
    let sanDigital, mockUSDT;
    let owner, wallets;

    before(async function () {
        console.log("\n🔧 Configurando entorno de pruebas...");

        const signers = await ethers.getSigners();
        owner = signers[0];
        wallets = signers.slice(1, 11); // 10 wallets

        // Deploy MockUSDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
        await mockUSDT.waitForDeployment();
        console.log(`✅ MockUSDT desplegado`);

        // Deploy SanDigital2026
        const SanDigital = await ethers.getContractFactory("SanDigital2026");
        sanDigital = await SanDigital.deploy(await mockUSDT.getAddress());
        await sanDigital.waitForDeployment();
        console.log(`✅ SanDigital2026 desplegado`);

        // Mintear y aprobar USDT
        for (let i = 0; i < wallets.length; i++) {
            await mockUSDT.mint(wallets[i].address, ethers.parseUnits("1000", 6));
            await mockUSDT.connect(wallets[i]).approve(
                await sanDigital.getAddress(),
                ethers.parseUnits("1000", 6)
            );
        }
        console.log(`✅ 10 wallets configuradas con 1,000 USDT cada una\n`);
    });

    it("Test 1: Crear 10 posiciones secuencialmente", async function () {
        this.timeout(60000);
        console.log("🚀 Creando 10 posiciones...");

        for (let i = 0; i < 10; i++) {
            await sanDigital.connect(wallets[i]).join();
            console.log(`  ✅ Posición ${i + 1}/10 creada`);
        }

        const activosCount = await sanDigital.getGlobalActivosCount();
        console.log(`\n📊 Posiciones activas: ${activosCount}`);
        expect(Number(activosCount)).to.be.greaterThan(0);
    });

    it("Test 2: Verificar integridad de fondos", async function () {
        const totalSaldosUsuarios = await sanDigital.totalSaldosUsuarios();

        let sumaIndividual = 0n;
        for (let i = 0; i < 10; i++) {
            const posIds = await sanDigital.getUserPositions(wallets[i].address);
            for (let posId of posIds) {
                const balance = await sanDigital.getPositionBalance(posId);
                sumaIndividual += balance;
            }
        }

        console.log(`\n💰 Verificación de fondos:`);
        console.log(`   Total contrato: ${ethers.formatUnits(totalSaldosUsuarios, 6)} USDT`);
        console.log(`   Suma individual: ${ethers.formatUnits(sumaIndividual, 6)} USDT`);

        expect(totalSaldosUsuarios).to.equal(sumaIndividual);
    });

    it("Test 3: Medir gas consumido", async function () {
        const tx = await sanDigital.connect(owner).join();
        const receipt = await tx.wait();

        console.log(`\n⛽ Gas usado en join(): ${receipt.gasUsed}`);
        expect(receipt.gasUsed).to.be.lessThan(500000n);
    });
});
