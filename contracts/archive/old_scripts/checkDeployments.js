const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verificando transacciones en opBNB Mainnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Wallet:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance actual:", ethers.formatEther(balance), "BNB\n");

    // Obtener el nonce (número de transacciones)
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("📊 Total de transacciones:", nonce);

    if (nonce > 0) {
        console.log("\n✅ Se han realizado", nonce, "transacciones desde esta wallet");
        console.log("\n🔗 Ver en opBNBScan:");
        console.log("   https://opbnbscan.com/address/" + deployer.address);
    } else {
        console.log("\n❌ No se han realizado transacciones desde esta wallet");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
