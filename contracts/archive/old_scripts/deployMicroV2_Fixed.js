const { ethers } = require('hardhat');

/**
 * Script para redesplegar SanDigital_Micro_V2 con funciones helper completas
 * 
 * Uso:
 * npx hardhat run scripts/deployMicroV2_Fixed.js --network sepolia
 */

async function main() {
    console.log('\n🚀 Desplegando SanDigital_Micro_V2 (FIXED - Con Helper Functions)...\n');

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💵 Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Dirección del MockUSDT en Sepolia
    const USDT_ADDRESS = '0xB35b75a2392659701600a6e816C5DB00f09Ed6C7';
    console.log(`🪙 MockUSDT: ${USDT_ADDRESS}\n`);

    // Deploy
    console.log('📦 Desplegando contrato...');
    const SanDigital = await ethers.getContractFactory('SanDigital_Micro_V2');
    const contract = await SanDigital.deploy(USDT_ADDRESS);

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log(`\n✅ Contrato desplegado en: ${contractAddress}`);

    // Verificar funciones
    console.log('\n🔍 Verificando funciones helper...');

    try {
        // Test getUserActivePositionsCount
        const activeCount = await contract.getUserActivePositionsCount(deployer.address);
        console.log(`   ✅ getUserActivePositionsCount: ${activeCount}`);

        // Test getGlobalActivosCount
        const globalCount = await contract.getGlobalActivosCount();
        console.log(`   ✅ getGlobalActivosCount: ${globalCount}`);

        // Test getUserClosedPositionsCount
        const closedCount = await contract.getUserClosedPositionsCount(deployer.address);
        console.log(`   ✅ getUserClosedPositionsCount: ${closedCount}`);

        console.log('\n✅ Todas las funciones helper funcionan correctamente!');
    } catch (error) {
        console.error(`\n❌ Error verificando funciones: ${error.message}`);
    }

    console.log('\n📋 RESUMEN DEL DEPLOY:');
    console.log(`   Contrato: SanDigital_Micro_V2`);
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Network: Sepolia`);
    console.log(`   USDT: ${USDT_ADDRESS}`);
    console.log(`   Punto Landa: 15 USDT`);
    console.log(`   Límite Usuarios: 30`);

    console.log('\n📌 PRÓXIMOS PASOS:');
    console.log(`   1. Actualizar addresses.json:`);
    console.log(`      "microV2": "${contractAddress}"`);
    console.log(`   2. Actualizar ABI en frontend`);
    console.log(`   3. Probar con primera transacción`);
    console.log(`   4. Verificar que UI muestra datos correctamente\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
