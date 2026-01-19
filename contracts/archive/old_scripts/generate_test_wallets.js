const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔑 Generando 30 billeteras de prueba...\n");

    const wallets = [];

    for (let i = 0; i < 30; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push({
            index: i + 1,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase
        });
        console.log(`Wallet ${i + 1}: ${wallet.address}`);
    }

    // Guardar en archivo JSON
    const outputPath = path.join(__dirname, "..", "test_wallets.json");
    fs.writeFileSync(
        outputPath,
        JSON.stringify(wallets, null, 2)
    );

    console.log("\n✅ Billeteras guardadas en:", outputPath);

    // Generar archivo CSV para fácil importación
    const csvPath = path.join(__dirname, "..", "test_wallets.csv");
    const csvContent = "Index,Address,PrivateKey\n" +
        wallets.map(w => `${w.index},${w.address},${w.privateKey}`).join("\n");
    fs.writeFileSync(csvPath, csvContent);

    console.log("✅ CSV guardado en:", csvPath);

    // Mostrar instrucciones
    console.log("\n" + "=".repeat(60));
    console.log("📋 PRÓXIMOS PASOS:");
    console.log("=".repeat(60));
    console.log("\n1. Fondear billeteras con ETH y USDT:");
    console.log("   npx hardhat run scripts/fund_test_wallets.js --network sepolia");
    console.log("\n2. Importar en MetaMask:");
    console.log("   - Usa las private keys del archivo test_wallets.json");
    console.log("   - Importa al menos las primeras 10 para pruebas manuales");
    console.log("\n3. Ejecutar prueba automatizada (opcional):");
    console.log("   npx hardhat run scripts/test_30_wallets.js --network sepolia");
    console.log("\n" + "=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
