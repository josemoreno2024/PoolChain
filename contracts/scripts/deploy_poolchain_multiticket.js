const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying PoolChain_Micro_MultiTicket to opBNB Testnet...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "BNB\n");

    // Contract parameters
    const USDT_ADDRESS = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD"; // MockUSDT on opBNB Testnet
    const PLATFORM_WALLET = deployer.address;

    console.log("📋 Deployment Parameters:");
    console.log("   USDT Address:", USDT_ADDRESS);
    console.log("   Platform Wallet:", PLATFORM_WALLET);
    console.log("");

    // Deploy contract
    console.log("⏳ Deploying contract...");
    const PoolChainMultiTicket = await hre.ethers.getContractFactory("PoolChain_Micro_MultiTicket");
    const poolchain = await PoolChainMultiTicket.deploy(USDT_ADDRESS, PLATFORM_WALLET);

    await poolchain.waitForDeployment();
    const contractAddress = await poolchain.getAddress();

    console.log("✅ PoolChain_Micro_MultiTicket deployed to:", contractAddress);
    console.log("");

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const ticketPrice = await poolchain.TICKET_PRICE();
    const maxParticipants = await poolchain.MAX_PARTICIPANTS();
    const gasFee = await poolchain.GAS_FEE_PERCENT();
    const maxPerPurchase = await poolchain.MAX_TICKETS_PER_PURCHASE();
    const maxPerUser = await poolchain.MAX_TICKETS_PER_USER_PER_ROUND();

    console.log("   Ticket Price:", hre.ethers.formatUnits(ticketPrice, 6), "USDT");
    console.log("   Max Participants:", maxParticipants.toString());
    console.log("   Gas Fee:", gasFee.toString() + "%");
    console.log("   Max per Purchase:", maxPerPurchase.toString());
    console.log("   Max per User:", maxPerUser.toString());
    console.log("   Current Round:", (await poolchain.currentRound()).toString());
    console.log("");

    // Save deployment info
    const fs = require('fs');

    // Save address to simple file
    fs.writeFileSync('last_deployment.txt', contractAddress);

    // Save full deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "PoolChain_Micro_MultiTicket",
        address: contractAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        parameters: {
            usdt: USDT_ADDRESS,
            platformWallet: PLATFORM_WALLET,
            ticketPrice: "2 USDT",
            maxParticipants: 100,
            gasFee: "3%",
            maxPerPurchase: 10,
            maxPerUser: 20
        }
    };

    fs.writeFileSync(
        'deployment_multiticket.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Deployment info saved to:");
    console.log("   - last_deployment.txt");
    console.log("   - deployment_multiticket.json");
    console.log("");

    console.log("📝 Next Steps:");
    console.log("1. Update src/contracts/addresses.json");
    console.log("2. Copy ABI to frontend");
    console.log("3. Test ticket purchases");
    console.log("");
    console.log("✅ Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
