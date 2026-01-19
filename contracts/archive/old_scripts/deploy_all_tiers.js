// Script de despliegue para todos los tiers en Sepolia
// Despliega los 6 contratos y guarda las direcciones

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Iniciando despliegue de todos los tiers en Sepolia...\n");

    // Obtener el deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Desplegando con la cuenta:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Dirección del token USDT en Sepolia (MockUSDT o real)
    const USDT_ADDRESS = process.env.USDT_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"; // MockUSDT en Sepolia
    console.log("🪙 USDT Address:", USDT_ADDRESS, "\n");

    // Array para guardar las direcciones desplegadas
    const deployedContracts = {};

    // Configuración de tiers
    const tiers = [
        { name: "Micro", contract: "SanDigital_Micro", entry: 10, exit: 20 },
        { name: "Standard", contract: "SanDigital_Standard", entry: 20, exit: 40 },
        { name: "Plus", contract: "SanDigital_Plus", entry: 30, exit: 60 },
        { name: "Premium", contract: "SanDigital_Premium", entry: 40, exit: 80 },
        { name: "Elite", contract: "SanDigital_Elite", entry: 50, exit: 100 },
        { name: "Ultra", contract: "SanDigital_Ultra", entry: 100, exit: 200 }
    ];

    // Desplegar cada tier
    for (const tier of tiers) {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`📦 Desplegando ${tier.name} Tier (${tier.entry}→${tier.exit} USDT)`);
        console.log(`${"=".repeat(60)}\n`);

        try {
            // Obtener el contrato
            const Contract = await hre.ethers.getContractFactory(tier.contract);

            // Desplegar
            console.log(`⏳ Desplegando ${tier.contract}...`);
            const contract = await Contract.deploy(USDT_ADDRESS);

            // Esperar confirmación
            await contract.waitForDeployment();
            const address = await contract.getAddress();

            console.log(`✅ ${tier.name} desplegado en:`, address);

            // Guardar dirección
            deployedContracts[tier.name.toLowerCase()] = {
                address: address,
                contract: tier.contract,
                entry: tier.entry,
                exit: tier.exit,
                deployedAt: new Date().toISOString()
            };

            // Esperar un poco entre despliegues
            console.log("⏱️  Esperando 5 segundos antes del siguiente despliegue...");
            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (error) {
            console.error(`❌ Error desplegando ${tier.name}:`, error.message);
            throw error;
        }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("✅ TODOS LOS CONTRATOS DESPLEGADOS");
    console.log(`${"=".repeat(60)}\n`);

    // Mostrar resumen
    console.log("📋 Resumen de Despliegues:\n");
    for (const [tier, info] of Object.entries(deployedContracts)) {
        console.log(`${tier.toUpperCase().padEnd(10)} → ${info.address}`);
    }

    // Guardar addresses.json
    const addressesPath = path.join(__dirname, "..", "src", "web3", "addresses.json");
    const addressesData = {
        network: "sepolia",
        chainId: 11155111,
        usdt: USDT_ADDRESS,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: deployedContracts
    };

    fs.writeFileSync(addressesPath, JSON.stringify(addressesData, null, 2));
    console.log(`\n💾 Direcciones guardadas en: ${addressesPath}`);

    // Guardar también en contracts/deployments
    const deploymentsDir = path.join(__dirname, "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(addressesData, null, 2));
    console.log(`💾 Backup guardado en: ${deploymentFile}`);

    console.log("\n🎉 ¡Despliegue completado exitosamente!");
    console.log("\n📝 Próximos pasos:");
    console.log("1. Verificar contratos en Etherscan");
    console.log("2. Probar frontend con contratos desplegados");
    console.log("3. Realizar transacciones de prueba");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error en el despliegue:");
        console.error(error);
        process.exit(1);
    });
