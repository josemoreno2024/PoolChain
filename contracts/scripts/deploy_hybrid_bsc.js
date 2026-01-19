const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for PoolChain HYBRID (Position Selection + Full Automation)
 * Best of both worlds: Users choose positions + 100% automatic execution
 */

async function main() {
    console.log("🚀 Deploying HYBRID PoolChain (Position Selection + Automation) to BSC Testnet...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "BNB\n");

    // ============ BSC Testnet Chainlink VRF v2.5 Parameters ============

    const VRF_COORDINATOR = "0xDA3b641D438362C440Ac5458c57e00a712b66700"; // BSC Testnet VRF Coordinator v2.5
    const KEY_HASH = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186"; // ✅ CORRECTED: Official BSC Testnet Key Hash

    // NEW VRF Subscription ID (created by user with deployment wallet)
    const SUBSCRIPTION_ID = "39265163140503036121577150381371014086785907122241201633055517765001554695711";

    // Use existing MockUSDT (to preserve wallet balances)
    const EXISTING_USDT = "0x7885Ab2E39eAAA6005364f7688E2B75FEC35Aa39";
    console.log("📦 Using existing MockUSDT:", EXISTING_USDT);

    // ============ Deploy PoolChain HYBRID ============

    console.log("\n📦 Deploying PoolChain_Hybrid_Auto...");
    const PoolChain = await hre.ethers.getContractFactory("PoolChain_Hybrid_Auto");
    const poolchain = await PoolChain.deploy(
        EXISTING_USDT,
        deployer.address, // Platform wallet
        VRF_COORDINATOR,
        BigInt(SUBSCRIPTION_ID),
        KEY_HASH
    );
    await poolchain.waitForDeployment();
    const poolchainAddress = await poolchain.getAddress();
    console.log("✅ PoolChain HYBRID deployed to:", poolchainAddress);

    // ============ Save Addresses ============

    const addressesPath = path.join(__dirname, "../../src/poolchain/contracts/addresses.json");
    let addresses = {};

    if (fs.existsSync(addressesPath)) {
        addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    }

    addresses.bscTestnet = {
        MockUSDT: EXISTING_USDT,
        PoolChain_Micro_PositionSelect: poolchainAddress
    };

    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to:", addressesPath);

    // ============ Next Steps ============

    console.log("\n" + "=".repeat(70));
    console.log("✅ HYBRID CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(70));

    console.log("\n📋 CARACTERÍSTICAS DEL CONTRATO:");
    console.log("   ✅ Usuarios eligen posiciones específicas (1-100)");
    console.log("   ✅ Máximo 10 tickets por compra");
    console.log("   ✅ Máximo 20 tickets por usuario por ronda");
    console.log("   ✅ Sorteo 100% automático (Chainlink VRF + Automation)");
    console.log("   ✅ Nadie puede manipular el sorteo");

    console.log("\n📋 PRÓXIMOS PASOS:");

    console.log("\n1️⃣  Add contract as VRF consumer:");
    console.log("   - Go to https://vrf.chain.link");
    console.log("   - Select your subscription");
    console.log("   - Click 'Add Consumer'");
    console.log("   - Paste contract address:", poolchainAddress);

    console.log("\n2️⃣  Register Chainlink Automation Upkeep:");
    console.log("   - Go to https://automation.chain.link");
    console.log("   - Click 'Register New Upkeep'");
    console.log("   - Select 'Custom logic'");
    console.log("   - Contract address:", poolchainAddress);
    console.log("   - Upkeep name: 'PoolChain Hybrid Auto Draw'");
    console.log("   - Gas limit: 500000");
    console.log("   - Starting balance: 5 LINK");

    console.log("\n3️⃣  Cómo funciona (100% AUTOMÁTICO):");
    console.log("   1. Usuario elige posiciones en el grid (1-100)");
    console.log("   2. Compra hasta 10 tickets por transacción");
    console.log("   3. Cuando pool llega a 100 tickets:");
    console.log("      → VRF se solicita AUTOMÁTICAMENTE");
    console.log("   4. Chainlink envía número aleatorio (2-3 min)");
    console.log("   5. Chainlink Automation detecta VRF recibido");
    console.log("      → Ejecuta sorteo AUTOMÁTICAMENTE");
    console.log("   6. Ganadores seleccionados, premios asignados");
    console.log("   7. Ronda se resetea AUTOMÁTICAMENTE");
    console.log("   8. ¡Listo para siguiente ronda!");

    console.log("\n4️⃣  Probar:");
    console.log("   - Reload frontend (ya tiene las direcciones actualizadas)");
    console.log("   - Compra tickets eligiendo posiciones");
    console.log("   - Llena el pool (100 tickets)");
    console.log("   - ¡Observa la magia automática! 🎉");

    console.log("\n" + "=".repeat(70));
    console.log("🎉 Sistema PERFECTO: Selección de posiciones + Automation!");
    console.log("=".repeat(70) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
