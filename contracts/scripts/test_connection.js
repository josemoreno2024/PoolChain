const hre = require("hardhat");

async function main() {
    console.log("🔍 Testing opBNB Testnet Connection...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deployer address:", deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB");

    // Check network
    const network = await hre.ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.chainId.toString());

    // Check block number
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("📦 Current block:", blockNumber);

    console.log("\n✅ Connection test completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Connection test failed:");
        console.error(error);
        process.exit(1);
    });
