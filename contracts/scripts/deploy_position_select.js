const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying PoolChain_Micro_PositionSelect...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

    // Contract addresses
    const USDT_ADDRESS = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD"; // MockUSDT on opBNB Testnet
    const PLATFORM_WALLET = deployer.address;

    console.log("📋 Deployment Parameters:");
    console.log("   USDT Address:", USDT_ADDRESS);
    console.log("   Platform Wallet:", PLATFORM_WALLET);
    console.log("");

    // Deploy contract
    const PoolChain = await hre.ethers.getContractFactory("PoolChain_Micro_PositionSelect");
    const poolChain = await PoolChain.deploy(USDT_ADDRESS, PLATFORM_WALLET);

    await poolChain.waitForDeployment();
    const contractAddress = await poolChain.getAddress();

    console.log("✅ PoolChain_Micro_PositionSelect deployed to:", contractAddress);
    console.log("");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contract: "PoolChain_Micro_PositionSelect",
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
            maxPerUser: 20,
            features: "Position Selection (1-100)"
        }
    };

    const fs = require('fs');
    fs.writeFileSync(
        'deployment_position_select.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📄 Deployment info saved to deployment_position_select.json");
    console.log("");
    console.log("🎯 Next steps:");
    console.log("   1. Update frontend addresses.json with new contract address");
    console.log("   2. Update frontend to use PoolChain_Micro_PositionSelect ABI");
    console.log("   3. Implement position selection UI");
    console.log("");
    console.log("🔗 Contract Address:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
