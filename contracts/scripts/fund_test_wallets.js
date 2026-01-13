const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const walletsPath = path.join(__dirname, "..", "test_wallets.json");

    if (!fs.existsSync(walletsPath)) {
        console.error("❌ Error: test_wallets.json no encontrado");
        console.log("Ejecuta primero: node scripts/generate_test_wallets.js");
        process.exit(1);
    }

    const wallets = JSON.parse(fs.readFileSync(walletsPath));
    const [funder] = await hre.ethers.getSigners();

    console.log("💰 Fondeando 30 billeteras desde:", funder.address);

    const funderBalance = await hre.ethers.provider.getBalance(funder.address);
    console.log("Balance del funder:", hre.ethers.formatEther(funderBalance), "ETH\n");

    const USDT_ADDRESS = "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";
    const usdt = await hre.ethers.getContractAt("MockERC20", USDT_ADDRESS);

    console.log("🪙 MockUSDT:", USDT_ADDRESS);
    console.log("📊 Configuración:");
    console.log("   - ETH por wallet: 0.05 ETH");
    console.log("   - USDT por wallet: 100 USDT\n");

    let successCount = 0;
    let failCount = 0;

    for (const wallet of wallets) {
        try {
            console.log(`\n📝 Wallet ${wallet.index}/${wallets.length}: ${wallet.address}`);

            // Enviar 0.05 ETH para gas
            const ethTx = await funder.sendTransaction({
                to: wallet.address,
                value: hre.ethers.parseEther("0.05")
            });
            await ethTx.wait();
            console.log("   ✅ ETH enviado");

            // Enviar 100 USDT
            const usdtTx = await usdt.mint(wallet.address, hre.ethers.parseUnits("100", 6));
            await usdtTx.wait();
            console.log("   ✅ USDT enviado");

            successCount++;

            // Pausa de 1 segundo entre transacciones para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            failCount++;
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN:");
    console.log("=".repeat(60));
    console.log(`✅ Exitosas: ${successCount}/${wallets.length}`);
    console.log(`❌ Fallidas: ${failCount}/${wallets.length}`);

    if (successCount === wallets.length) {
        console.log("\n🎉 ¡Todas las billeteras fondeadas exitosamente!");
    } else {
        console.log("\n⚠️ Algunas billeteras no se pudieron fondear. Revisa los errores arriba.");
    }

    console.log("\n📋 Próximo paso:");
    console.log("   - Importa las billeteras en MetaMask usando test_wallets.json");
    console.log("   - O ejecuta la prueba automatizada:");
    console.log("     npx hardhat run scripts/test_30_wallets.js --network sepolia");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error fatal:", error);
        process.exit(1);
    });
