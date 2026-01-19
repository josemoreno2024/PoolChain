const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Identificando contratos desplegados...\n");

    const provider = ethers.provider;
    const [deployer] = await ethers.getSigners();

    console.log("📍 Wallet:", deployer.address);

    // Obtener el nonce actual
    const currentNonce = await provider.getTransactionCount(deployer.address);
    console.log("📊 Total transacciones:", currentNonce, "\n");

    if (currentNonce === 0) {
        console.log("❌ No se han realizado transacciones");
        return;
    }

    console.log("🔎 Buscando contratos desplegados...\n");

    // Los últimos 10 nonces (transacciones más recientes)
    const startNonce = Math.max(0, currentNonce - 10);

    for (let nonce = startNonce; nonce < currentNonce; nonce++) {
        // Calcular la address del contrato desplegado con este nonce
        const contractAddress = ethers.getCreateAddress({
            from: deployer.address,
            nonce: nonce
        });

        // Verificar si hay código en esa address (es un contrato)
        const code = await provider.getCode(contractAddress);

        if (code !== "0x") {
            console.log(`✅ Nonce ${nonce}:`);
            console.log(`   Contract: ${contractAddress}`);

            // Intentar identificar el tipo de contrato
            try {
                const mockUSDT = await ethers.getContractAt("MockUSDT", contractAddress);
                const symbol = await mockUSDT.symbol();
                console.log(`   Tipo: MockUSDT (${symbol})`);
            } catch {
                try {
                    const keeper = await ethers.getContractAt("KeeperContract", contractAddress);
                    const mainContract = await keeper.mainContract();
                    console.log(`   Tipo: KeeperContract`);
                    console.log(`   Main Contract: ${mainContract}`);
                } catch {
                    try {
                        const main = await ethers.getContractAt("SanDigital_4Funds_Keeper", contractAddress);
                        const token = await main.token();
                        console.log(`   Tipo: SanDigital_4Funds_Keeper`);
                        console.log(`   Token: ${token}`);
                    } catch {
                        console.log(`   Tipo: Contrato desconocido`);
                    }
                }
            }
            console.log("");
        }
    }

    console.log("\n📋 Resumen:");
    console.log("Revisa las addresses de arriba y guárdalas.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
