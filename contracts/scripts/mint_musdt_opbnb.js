const hre = require("hardhat");

/**
 * Script para acuñar MockUSDT en opBNB Testnet
 * Útil para obtener USDT de prueba rápidamente
 */

async function main() {
    console.log("🪙 ACUÑANDO MockUSDT EN opBNB TESTNET\n");
    console.log("=".repeat(60));

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Cuenta:", deployer.address);

    // MockUSDT en opBNB Testnet
    const MOCK_USDT_ADDRESS = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD";
    const AMOUNT = "1000"; // 1,000 USDT

    console.log("\n📋 Parámetros:");
    console.log("   MockUSDT:", MOCK_USDT_ADDRESS);
    console.log("   Cantidad:", AMOUNT, "USDT");
    console.log("   Destinatario:", deployer.address);

    try {
        // Conectar al contrato MockUSDT
        const mockUSDT = await hre.ethers.getContractAt("MockUSDT", MOCK_USDT_ADDRESS);

        // Verificar balance actual
        const balanceBefore = await mockUSDT.balanceOf(deployer.address);
        console.log("\n💰 Balance actual:", hre.ethers.formatUnits(balanceBefore, 6), "USDT");

        // Acuñar tokens
        console.log("\n⏳ Acuñando tokens...");
        const amountWithDecimals = hre.ethers.parseUnits(AMOUNT, 6); // 6 decimals
        const tx = await mockUSDT.mint(deployer.address, amountWithDecimals);

        console.log("📤 Transacción enviada:", tx.hash);
        console.log("⏳ Esperando confirmación...");

        const receipt = await tx.wait();
        console.log("✅ Transacción confirmada en bloque:", receipt.blockNumber);

        // Verificar nuevo balance
        const balanceAfter = await mockUSDT.balanceOf(deployer.address);
        console.log("\n💰 Nuevo balance:", hre.ethers.formatUnits(balanceAfter, 6), "USDT");
        console.log("✅ Acuñados:", AMOUNT, "USDT");

        console.log("\n" + "=".repeat(60));
        console.log("🎉 ACUÑACIÓN COMPLETADA");
        console.log("=".repeat(60));

        console.log("\n📝 PRÓXIMOS PASOS:");
        console.log("1. Abre la interfaz de PoolChain");
        console.log("2. Conecta tu wallet en opBNB Testnet");
        console.log("3. Verás automáticamente tu balance actualizado");
        console.log("4. ¡Comienza a comprar tickets!");

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);

        if (error.message.includes("Ownable")) {
            console.log("\n⚠️  NOTA: Solo el owner del contrato puede acuñar tokens.");
            console.log("Si no eres el owner, usa el botón de faucet en la interfaz.");
        }
    }

    console.log("\n" + "=".repeat(60) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
