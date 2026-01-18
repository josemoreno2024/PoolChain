const hre = require("hardhat");

async function main() {
    console.log("🚀 DESPLEGANDO EN opBNB TESTNET - SIN VRF");
    console.log("=".repeat(80));

    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("\n📝 Cuenta:", deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB");

    // opBNB Testnet - usar MockUSDT existente o desplegar nuevo
    const MOCK_USDT = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD"; // Existente
    const PLATFORM_WALLET = deployer.address;

    console.log("\n📋 Parámetros:");
    console.log("   USDT:", MOCK_USDT);
    console.log("   Platform Wallet:", PLATFORM_WALLET);
    console.log("   Red: opBNB Testnet");
    console.log("   Aleatoriedad: block.prevrandao");

    console.log("\n⏳ Desplegando PoolChain_Simple...");

    const PoolChain = await hre.ethers.getContractFactory("PoolChain_Simple");
    const poolchain = await PoolChain.deploy(MOCK_USDT, PLATFORM_WALLET);

    await poolchain.waitForDeployment();
    const address = await poolchain.getAddress();

    console.log("\n✅ Contrato desplegado en:", address);

    console.log("\n" + "=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETADO");
    console.log("=".repeat(80));

    console.log("\n📝 PRÓXIMOS PASOS:");
    console.log("\n1️⃣  ACTUALIZAR ADDRESSES.JSON");
    console.log(`   "opBNBTestnet": {`);
    console.log(`     "MockUSDT": "${MOCK_USDT}",`);
    console.log(`     "PoolChain_Micro_PositionSelect": "${address}"`);
    console.log(`   }`);

    console.log("\n2️⃣  CAMBIAR METAMASK A opBNB TESTNET");
    console.log("   Network: opBNB Testnet");
    console.log("   Chain ID: 5611");
    console.log("   RPC: https://opbnb-testnet-rpc.bnbchain.org");

    console.log("\n3️⃣  PROBAR EL SISTEMA");
    console.log("   → Comprar tickets");
    console.log("   → Pool se llena (100 tickets)");
    console.log("   → ⚡ Sorteo INSTANTÁNEO automático");
    console.log("   → 🎉 Ver celebración");
    console.log("   → Reclamar premios");

    console.log("\n✅ VENTAJAS:");
    console.log("   - Costo: $0 (testnet)");
    console.log("   - Sorteo: Instantáneo (no espera VRF)");
    console.log("   - Gas: ~10x más barato que BSC");

    console.log("\n" + "=".repeat(80) + "\n");

    // Guardar info
    const deploymentInfo = {
        network: "opBNBTestnet",
        chainId: 5611,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            MockUSDT: MOCK_USDT,
            PoolChain_Simple: address
        },
        randomness: "block.prevrandao + multiple sources"
    };

    const fs = require('fs');
    fs.writeFileSync(
        'deployment_opbnb_simple.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("✅ Info guardada en deployment_opbnb_simple.json\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ ERROR:", error);
        process.exit(1);
    });
