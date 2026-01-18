const hre = require("hardhat");

async function main() {
    console.log("🚀 DESPLEGANDO CONTRATO CON FUNCIÓN DE EMERGENCIA\n");
    console.log("=".repeat(60));

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Desplegando con:", deployer.address);

    // BSC Testnet VRF v2.5 Parameters
    const VRF_COORDINATOR = "0xDA3b641D438362C440Ac5458c57e00a712b66700";
    const KEY_HASH = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
    const SUBSCRIPTION_ID = "39265163140503036121577150381371014086785907122241201633055517765001554695711";

    // Contract addresses
    const MOCK_USDT = "0x7885Ab2E39eAAA6005364f7688E2B75FEC35Aa39";
    const PLATFORM_WALLET = deployer.address;

    console.log("\n📋 Parámetros:");
    console.log(`   USDT: ${MOCK_USDT}`);
    console.log(`   Platform Wallet: ${PLATFORM_WALLET}`);
    console.log(`   VRF Coordinator: ${VRF_COORDINATOR}`);
    console.log(`   Key Hash: ${KEY_HASH}`);
    console.log(`   Subscription ID: ${SUBSCRIPTION_ID}`);

    console.log("\n⏳ Desplegando contrato...");

    const PoolChain = await hre.ethers.getContractFactory("PoolChain_Hybrid_Auto_WithEmergency");
    const poolchain = await PoolChain.deploy(
        MOCK_USDT,
        PLATFORM_WALLET,
        VRF_COORDINATOR,
        SUBSCRIPTION_ID,
        KEY_HASH
    );

    await poolchain.waitForDeployment();
    const address = await poolchain.getAddress();

    console.log("\n✅ Contrato desplegado en:", address);

    console.log("\n" + "=".repeat(60));
    console.log("📝 PRÓXIMOS PASOS:");
    console.log("=".repeat(60));
    console.log("\n1. Agregar contrato como consumidor VRF:");
    console.log("   https://vrf.chain.link");
    console.log(`   Agregar: ${address}`);

    console.log("\n2. Actualizar addresses.json:");
    console.log(`   "PoolChain_Micro_PositionSelect": "${address}"`);

    console.log("\n3. FUNCIÓN DE EMERGENCIA disponible:");
    console.log("   emergencyDraw() - Solo owner, ejecuta sorteo sin esperar VRF");
    console.log("   ⚠️  ELIMINAR antes de producción!");

    console.log("\n" + "=".repeat(60) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
