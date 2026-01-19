const hre = require("hardhat");

async function main() {
    console.log("🚀 Desplegando Tier Ultra (100→200 USDT)...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Desplegando con:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

    const USDT_ADDRESS = process.env.USDT_ADDRESS || "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";
    console.log("🪙 USDT:", USDT_ADDRESS, "\n");

    console.log("⏳ Desplegando SanDigital_Ultra...");
    const Contract = await hre.ethers.getContractFactory("SanDigital_Ultra");
    const contract = await Contract.deploy(USDT_ADDRESS);
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("\n✅ Tier Ultra desplegado en:", address);
    console.log("🔍 Verifica en:", `https://sepolia.etherscan.io/address/${address}`);
    console.log("\n📋 Guarda esta dirección:");
    console.log(`"ultra": "${address}",`);
    console.log("\n" + "=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
