const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying PoolChain_Micro_Automated to BNB Chain Testnet...\n");

    // ============ PARÁMETROS ============

    // Direcciones de contratos
    const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // USDT en BNB Testnet
    const PLATFORM_WALLET = "0x1d6e67c6df802a9cf021924f829513550ffe0024"; // Tu wallet

    // Chainlink VRF parámetros para BNB Chain Testnet
    const VRF_COORDINATOR = "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f";
    const KEY_HASH = "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314";
    const SUBSCRIPTION_ID = "10638378729730733813552235268789344278174729333928928229401647911927330899914";

    console.log("📋 Deployment Parameters:");
    console.log("   USDT:", USDT_ADDRESS);
    console.log("   Platform Wallet:", PLATFORM_WALLET);
    console.log("   VRF Coordinator:", VRF_COORDINATOR);
    console.log("   Key Hash:", KEY_HASH);
    console.log("   Subscription ID:", SUBSCRIPTION_ID);
    console.log("");

    // ============ DEPLOYMENT ============

    console.log("⏳ Deploying contract...");

    const PoolChain = await hre.ethers.getContractFactory("PoolChain_Micro_Automated");
    const poolchain = await PoolChain.deploy(
        USDT_ADDRESS,
        PLATFORM_WALLET,
        VRF_COORDINATOR,
        SUBSCRIPTION_ID,
        KEY_HASH
    );

    await poolchain.waitForDeployment();
    const address = await poolchain.getAddress();

    console.log("✅ Contract deployed at:", address);
    console.log("");

    // ============ VERIFICACIÓN ============

    console.log("🔍 Verifying deployment...");

    const ticketPrice = await poolchain.TICKET_PRICE();
    const maxParticipants = await poolchain.MAX_PARTICIPANTS();
    const gasFee = await poolchain.GAS_FEE_PERCENT();
    const currentRound = await poolchain.currentRound();

    console.log("   Ticket Price:", hre.ethers.formatUnits(ticketPrice, 6), "USDT");
    console.log("   Max Participants:", maxParticipants.toString());
    console.log("   Gas Fee:", gasFee.toString() + "%");
    console.log("   Current Round:", currentRound.toString());
    console.log("");

    // ============ PRÓXIMOS PASOS ============

    console.log("📝 NEXT STEPS:");
    console.log("");
    console.log("1️⃣ Add contract as VRF Consumer:");
    console.log("   - Go to: https://vrf.chain.link");
    console.log("   - Select your subscription");
    console.log("   - Click 'Add Consumer'");
    console.log("   - Paste:", address);
    console.log("");
    console.log("2️⃣ Register Chainlink Automation:");
    console.log("   - Go to: https://automation.chain.link");
    console.log("   - Click 'Register New Upkeep'");
    console.log("   - Select 'Custom logic'");
    console.log("   - Contract address:", address);
    console.log("   - Gas limit: 500000");
    console.log("   - Fund with 5 LINK");
    console.log("");
    console.log("3️⃣ Test the system:");
    console.log("   - Buy tickets until pool fills (100)");
    console.log("   - VRF will be requested automatically");
    console.log("   - Automation will execute draw automatically");
    console.log("");
    console.log("✅ Deployment complete!");

    // Guardar dirección
    const fs = require('fs');
    const deploymentInfo = {
        network: "BNB Chain Testnet",
        contractAddress: address,
        timestamp: new Date().toISOString(),
        parameters: {
            usdt: USDT_ADDRESS,
            platformWallet: PLATFORM_WALLET,
            vrfCoordinator: VRF_COORDINATOR,
            subscriptionId: SUBSCRIPTION_ID,
            keyHash: KEY_HASH
        }
    };

    fs.writeFileSync(
        'deployment_automated.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved to: deployment_automated.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
