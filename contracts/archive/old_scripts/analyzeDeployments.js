const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Analizando contratos desplegados...\n");

    // Addresses de las transacciones más recientes
    const txHashes = [
        "0x734d8eace8",  // Más reciente
        "0x431c993ca6",
        "0x18bc2f46b7",
        "0x77eede9840",
        "0x77dbbd4df5",
        "0xc4bd5a3127",
        "0x8c392855df",
        "0x9d13b1f7d8",
        "0x1f1e7760cd",
        "0x6af145d68f"
    ];

    console.log("📋 Últimas 10 transacciones:");
    console.log("Necesitas hacer click en cada una en opBNBScan para ver:");
    console.log("1. Si es 'Contract Creation'");
    console.log("2. La address del contrato creado (campo 'To')\n");

    console.log("🔗 Links directos:");
    for (let i = 0; i < txHashes.length; i++) {
        console.log(`${i + 1}. https://opbnbscan.com/tx/${txHashes[i]}`);
    }

    console.log("\n💡 Busca las 3 transacciones más recientes que sean 'Contract Creation'");
    console.log("   Esos serán: MockUSDT, SanDigital_4Funds_Keeper, y KeeperContract");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
