const hre = require("hardhat");

/**
 * DEPLOYMENT SCRIPT PARA BSC MAINNET
 * Chainlink VRF v2.5 - Production Ready
 */

async function main() {
    console.log("🚀 DESPLEGANDO EN BSC MAINNET");
    console.log("=".repeat(80));

    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("\n📝 Cuenta de deployment:", deployer.address);
    console.log("💰 Balance BNB:", hre.ethers.formatEther(balance), "BNB");

    if (balance < hre.ethers.parseEther("0.01")) {
        throw new Error("❌ Balance insuficiente. Necesitas al menos 0.01 BNB (~$3)");
    }

    // ============ BSC MAINNET VRF v2.5 Parameters ============
    const VRF_COORDINATOR = "0x747973a5A2a4Ae1D3a8fDF5479f1514F65Db9C31";
    const KEY_HASH = "0xc251acd21ec4fb7f31bb8868288bfdbaeb4fbfec2df3735ddbd4f7dc8d60103c";

    // IMPORTANTE: Debes crear la subscription ANTES de ejecutar este script
    // Ve a https://vrf.chain.link y crea una subscription en BSC Mainnet
    const SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || "0";

    if (SUBSCRIPTION_ID === "0") {
        console.log("\n⚠️  WARNING: VRF_SUBSCRIPTION_ID no está configurado");
        console.log("📋 PASOS PARA OBTENER SUBSCRIPTION ID:");
        console.log("   1. Ve a https://vrf.chain.link");
        console.log("   2. Conecta tu wallet en BSC Mainnet");
        console.log("   3. Click en 'Create Subscription'");
        console.log("   4. Fondea con 5-10 LINK");
        console.log("   5. Copia el Subscription ID");
        console.log("   6. Ejecuta: VRF_SUBSCRIPTION_ID=<tu_id> npx hardhat run ...");
        console.log("\n⏸️  Pausando deployment hasta que definas SUBSCRIPTION_ID...");
        process.exit(1);
    }

    const PLATFORM_WALLET = deployer.address;

    console.log("\n📋 Parámetros de Deployment:");
    console.log("-".repeat(80));
    console.log("Network:", "BSC Mainnet (Chain ID: 56)");
    console.log("VRF Coordinator:", VRF_COORDINATOR);
    console.log("Key Hash:", KEY_HASH);
    console.log("Subscription ID:", SUBSCRIPTION_ID);
    console.log("Platform Wallet:", PLATFORM_WALLET);
    console.log("-".repeat(80));

    // ============ PASO 1: Deploy MockUSDT (o usar USDT real) ============
    console.log("\n📦 PASO 1: MockUSDT");
    console.log("-".repeat(80));

    // Opción A: Usar USDT real de BSC Mainnet
    const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";
    console.log("Opción A: Usar USDT real:", USDT_MAINNET);

    // Opción B: Desplegar MockUSDT para pruebas
    console.log("Opción B: Desplegar MockUSDT para pruebas");

    console.log("\n¿Qué opción prefieres?");
    console.log("Por defecto usaremos MockUSDT para pruebas...");

    let usdtAddress;

    try {
        console.log("\n⏳ Desplegando MockUSDT...");
        const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
        const mockUsdt = await MockUSDT.deploy();
        await mockUsdt.waitForDeployment();
        usdtAddress = await mockUsdt.getAddress();
        console.log("✅ MockUSDT desplegado en:", usdtAddress);
    } catch (error) {
        console.log("⚠️  Error al desplegar MockUSDT:", error.message);
        console.log("Usando USDT real como fallback...");
        usdtAddress = USDT_MAINNET;
    }

    // ============ PASO 2: Deploy PoolChain ============
    console.log("\n📦 PASO 2: PoolChain_Hybrid_Auto");
    console.log("-".repeat(80));
    console.log("⏳ Desplegando contrato principal...");

    const PoolChain = await hre.ethers.getContractFactory("PoolChain_Hybrid_Auto");
    const poolchain = await PoolChain.deploy(
        usdtAddress,
        PLATFORM_WALLET,
        VRF_COORDINATOR,
        SUBSCRIPTION_ID,
        KEY_HASH
    );

    await poolchain.waitForDeployment();
    const poolchainAddress = await poolchain.getAddress();

    console.log("✅ PoolChain desplegado en:", poolchainAddress);

    // ============ VERIFICACIÓN ============
    console.log("\n🔍 VERIFICACIÓN");
    console.log("-".repeat(80));

    const keyHashCheck = await poolchain.keyHash();
    const coordinatorCheck = await poolchain.COORDINATOR();
    const subIdCheck = await poolchain.subscriptionId();

    console.log("Key Hash configurado:", keyHashCheck);
    console.log("Key Hash esperado:   ", KEY_HASH);
    console.log("Match:", keyHashCheck.toLowerCase() === KEY_HASH.toLowerCase() ? "✅" : "❌");

    console.log("\nCoordinator configurado:", coordinatorCheck);
    console.log("Coordinator esperado:   ", VRF_COORDINATOR);
    console.log("Match:", coordinatorCheck.toLowerCase() === VRF_COORDINATOR.toLowerCase() ? "✅" : "❌");

    console.log("\nSubscription ID:", subIdCheck.toString());

    // ============ RESUMEN Y PRÓXIMOS PASOS ============
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETADO");
    console.log("=".repeat(80));

    console.log("\n📝 DIRECCIONES DESPLEGADAS:");
    console.log(`   MockUSDT: ${usdtAddress}`);
    console.log(`   PoolChain: ${poolchainAddress}`);

    console.log("\n📋 PRÓXIMOS PASOS:");
    console.log("=".repeat(80));

    console.log("\n1️⃣  AGREGAR CONSUMER A VRF SUBSCRIPTION");
    console.log("   → Ve a: https://vrf.chain.link");
    console.log("   → Selecciona tu Subscription:", SUBSCRIPTION_ID);
    console.log("   → Click en 'Add Consumer'");
    console.log(`   → Agrega: ${poolchainAddress}`);

    console.log("\n2️⃣  ACTUALIZAR ADDRESSES.JSON");
    console.log("   Agrega a src/poolchain/contracts/addresses.json:");
    console.log(`   "bscMainnet": {`);
    console.log(`     "MockUSDT": "${usdtAddress}",`);
    console.log(`     "PoolChain_Micro_PositionSelect": "${poolchainAddress}"`);
    console.log(`   }`);

    console.log("\n3️⃣  VERIFICAR CONTRATO EN BSCSCAN (OPCIONAL)");
    console.log("   npx hardhat verify --network bscMainnet", poolchainAddress);
    console.log("   ", usdtAddress, PLATFORM_WALLET, VRF_COORDINATOR, SUBSCRIPTION_ID, KEY_HASH);

    console.log("\n4️⃣  CAMBIAR METAMASK A BSC MAINNET");
    console.log("   → Network: BNB Chain");
    console.log("   → Chain ID: 56");

    console.log("\n5️⃣  PROBAR EL SISTEMA");
    console.log("   → Comprar tickets");
    console.log("   → Llenar pool (100 tickets)");
    console.log("   → ⏱️  VRF responderá en ~30-60 segundos");
    console.log("   → 🎉 Ver modales de celebración");

    console.log("\n⚡ IMPORTANTE:");
    console.log("   - Asegúrate de que la subscription tenga al menos 5 LINK");
    console.log("   - El contrato debe estar agregado como consumer");
    console.log("   - Cada sorteo cuesta ~0.15-0.30 USD en LINK");

    console.log("\n" + "=".repeat(80) + "\n");

    // Guardar info para referencia
    const deploymentInfo = {
        network: "bscMainnet",
        chainId: 56,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            MockUSDT: usdtAddress,
            PoolChain_Hybrid_Auto: poolchainAddress
        },
        vrfConfig: {
            coordinator: VRF_COORDINATOR,
            keyHash: KEY_HASH,
            subscriptionId: SUBSCRIPTION_ID
        }
    };

    const fs = require('fs');
    fs.writeFileSync(
        'deployment_mainnet.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("✅ Info guardada en deployment_mainnet.json\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ ERROR:", error);
        process.exit(1);
    });
