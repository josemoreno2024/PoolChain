const hre = require("hardhat");

async function main() {
    console.log("🚀 Desplegando SanDigital_Micro_V2 (10→20 USDT con Punto Landa)...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Desplegando con:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Usar MockUSDT existente en Sepolia
    const USDT_ADDRESS = "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";
    console.log("🪙 USDT:", USDT_ADDRESS, "\n");

    // Desplegar Micro V2
    console.log("⏳ Desplegando SanDigital_Micro_V2...");
    const SanDigitalMicroV2 = await hre.ethers.getContractFactory("SanDigital_Micro_V2");
    const microV2Contract = await SanDigitalMicroV2.deploy(USDT_ADDRESS);
    await microV2Contract.waitForDeployment();

    const microV2Address = await microV2Contract.getAddress();

    console.log("\n✅ SanDigital_Micro_V2 desplegado en:", microV2Address);
    console.log("🔍 Verifica en:", `https://sepolia.etherscan.io/address/${microV2Address}`);

    console.log("\n📋 Actualiza addresses.json:");
    console.log(`"microV2": "${microV2Address}",`);

    // Verificar parámetros del contrato
    console.log("\n📊 Parámetros del contrato:");
    const aporte = await microV2Contract.APORTE();
    const turnPayout = await microV2Contract.TURN_PAYOUT();
    const globalPayout = await microV2Contract.GLOBAL_PAYOUT();
    const adminFee = await microV2Contract.ADMIN_FEE();
    const puntoLanda = await microV2Contract.PUNTO_LANDA();
    const exitThreshold = await microV2Contract.EXIT_THRESHOLD();
    const maxActive = await microV2Contract.MAX_ACTIVE_POSITIONS();

    console.log("- Aporte:", hre.ethers.formatUnits(aporte, 6), "USDT");
    console.log("- Turno:", hre.ethers.formatUnits(turnPayout, 6), "USDT");
    console.log("- Global:", hre.ethers.formatUnits(globalPayout, 6), "USDT");
    console.log("- Admin:", hre.ethers.formatUnits(adminFee, 6), "USDT");
    console.log("- Punto Landa:", hre.ethers.formatUnits(puntoLanda, 6), "USDT");
    console.log("- Salida:", hre.ethers.formatUnits(exitThreshold, 6), "USDT");
    console.log("- Límite usuarios:", maxActive.toString());

    // Verificar estado inicial
    console.log("\n🔍 Estado inicial del sistema:");
    const systemState = await microV2Contract.getSystemState();
    console.log("- Posiciones activas:", systemState.activePositions.toString());
    console.log("- Ciclos completados:", systemState.completedCycles.toString());
    console.log("- Total depositado:", hre.ethers.formatUnits(systemState.totalIn, 6), "USDT");
    console.log("- Total retirado:", hre.ethers.formatUnits(systemState.totalOut, 6), "USDT");
    console.log("- Reserva global:", hre.ethers.formatUnits(systemState.reserve, 6), "USDT");

    console.log("\n" + "=".repeat(60));
    console.log("✅ Despliegue completado exitosamente");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
