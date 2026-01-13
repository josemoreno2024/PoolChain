const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying PoolChain_Micro_Mock to opBNB Testnet...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "BNB\n");

    // Contract parameters
    const USDT_ADDRESS = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD"; // MockUSDT on opBNB Testnet
    const PLATFORM_WALLET = deployer.address; // Por ahora usar la misma wallet

    console.log("📋 Deployment Parameters:");
    console.log("   USDT Address:", USDT_ADDRESS);
    console.log("   Platform Wallet:", PLATFORM_WALLET);
    console.log("");

    // Deploy contract
    console.log("⏳ Deploying contract...");
    const PoolChainMicroMock = await hre.ethers.getContractFactory("PoolChain_Micro_Mock");
    const poolchain = await PoolChainMicroMock.deploy(USDT_ADDRESS, PLATFORM_WALLET);

    await poolchain.waitForDeployment();
    const contractAddress = await poolchain.getAddress();

    console.log("✅ PoolChain_Micro_Mock deployed to:", contractAddress);
    console.log("");

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const ticketPrice = await poolchain.TICKET_PRICE();
    const maxParticipants = await poolchain.MAX_PARTICIPANTS();
    const gasFee = await poolchain.GAS_FEE_PERCENT();

    console.log("   Ticket Price:", hre.ethers.formatUnits(ticketPrice, 6), "USDT");
    console.log("   Max Participants:", maxParticipants.toString());
    console.log("   Gas Fee:", gasFee.toString() + "%");
    console.log("   Current Round:", (await poolchain.currentRound()).toString());
    console.log("");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "PoolChain_Micro_Mock",
        address: contractAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        parameters: {
            usdtAddress: USDT_ADDRESS,
            platformWallet: PLATFORM_WALLET,
            ticketPrice: "2 USDT",
            maxParticipants: 100,
            gasFee: "2%"
        }
    };

    console.log("📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("");

    console.log("✅ Deployment completed successfully!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Verify contract on opBNBScan:");
    console.log(`   npx hardhat verify --network opBNBTestnet ${contractAddress} ${USDT_ADDRESS} ${PLATFORM_WALLET}`);
    console.log("");
    console.log("2. Update frontend contract address");
    console.log("3. Test buying tickets");
    console.log("4. Test draw execution");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
