const hre = require("hardhat");

async function main() {
  console.log("🚀 Desplegando Tier Micro (10→20 USDT)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Desplegando con:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Dirección del MockUSDT
  const USDT_ADDRESS = process.env.USDT_ADDRESS || "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";
  console.log("🪙 USDT:", USDT_ADDRESS, "\n");

  // Desplegar Micro
  console.log("⏳ Desplegando SanDigital_Micro...");
  const SanDigitalMicro = await hre.ethers.getContractFactory("SanDigital_Micro");
  const microContract = await SanDigitalMicro.deploy(USDT_ADDRESS);
  await microContract.waitForDeployment();
  
  const microAddress = await microContract.getAddress();
  
  console.log("\n✅ Tier Micro desplegado en:", microAddress);
  console.log("🔍 Verifica en:", `https://sepolia.etherscan.io/address/${microAddress}`);
  
  console.log("\n📋 Guarda esta dirección en addresses.json:");
  console.log(`"micro": "${microAddress}",`);
  
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
