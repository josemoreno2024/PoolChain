const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando MockUSDT en Sepolia...\n");

  const USDT_ADDRESS = "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";
  
  // Conectar al contrato
  const usdt = await hre.ethers.getContractAt("MockERC20", USDT_ADDRESS);
  
  console.log("📋 Dirección del contrato:", USDT_ADDRESS);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${USDT_ADDRESS}\n`);
  
  // Obtener información básica
  const name = await usdt.name();
  const symbol = await usdt.symbol();
  const decimals = await usdt.decimals();
  
  console.log("📊 Información del Token:");
  console.log("- Nombre:", name);
  console.log("- Símbolo:", symbol);
  console.log("- Decimales:", decimals.toString());
  
  // Verificar si tiene función mint
  console.log("\n🔧 Verificando funciones disponibles:");
  
  try {
    // Intentar obtener el owner (si existe)
    const owner = await usdt.owner();
    console.log("✅ Función owner() disponible");
    console.log("   Owner:", owner);
  } catch (error) {
    console.log("❌ Función owner() no disponible");
  }
  
  // Verificar balance del deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n💰 Balance del deployer:");
  console.log("   Dirección:", deployer.address);
  
  const balance = await usdt.balanceOf(deployer.address);
  console.log("   Balance USDT:", hre.ethers.formatUnits(balance, 6), "USDT");
  
  console.log("\n✅ Para acuñar USDT a una dirección, usa:");
  console.log("   npx hardhat run scripts/mint-usdt.js --network sepolia");
  
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
