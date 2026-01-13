const hre = require("hardhat");

async function main() {
    console.log("🪙 Deploying MockUSDT to opBNB Testnet...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "BNB\n");

    console.log("⏳ Deploying MockUSDT...");
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();

    await mockUSDT.waitForDeployment();
    const contractAddress = await mockUSDT.getAddress();

    console.log("✅ MockUSDT deployed to:", contractAddress);
    console.log("");

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const name = await mockUSDT.name();
    const symbol = await mockUSDT.symbol();
    const decimals = await mockUSDT.decimals();
    const deployerBalance = await mockUSDT.balanceOf(deployer.address);

    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Decimals:", decimals.toString());
    console.log("   Deployer balance:", hre.ethers.formatUnits(deployerBalance, 6), "mUSDT");
    console.log("");

    console.log("✅ Deployment completed successfully!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Mint tokens using:");
    console.log(`   mockUSDT.faucet() - Get 1000 USDT`);
    console.log(`   mockUSDT.mint(address, amount) - Mint specific amount`);
    console.log("");
    console.log("2. Update PoolChain contract to use this USDT:");
    console.log(`   New USDT Address: ${contractAddress}`);
    console.log("");
    console.log("3. Or redeploy PoolChain with new USDT address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
