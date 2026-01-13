const { ethers } = require('hardhat');

/**
 * Script para redesplegar SanDigital_Micro_V2 con Cap and Redistribute
 * 
 * Uso:
 * npx hardhat run scripts/deployMicroV2_CapRedistribute.js --network sepolia
 */

async function main() {
    console.log('\n🚀 Desplegando SanDigital_Micro_V2 (Cap and Redistribute System)...\n');

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

    // Verificar funciones nuevas
    console.log('\n🔍 Verificando nuevas funciones...');

    try {
        // Test getAdminMetrics
        const metrics = await contract.getAdminMetrics();
        console.log(`   ✅ getAdminMetrics:`);
        console.log(`      - globalReserve: ${ethers.formatUnits(metrics[0], 6)} USDT`);
        console.log(`      - totalExcessRedistributed: ${ethers.formatUnits(metrics[1], 6)} USDT`);
        console.log(`      - totalExitsCapped: ${metrics[2]}`);
        console.log(`      - efficiencyPercent: ${metrics[6]}%`);

        // Test getAverageExcess
        const avgExcess = await contract.getAverageExcess();
        console.log(`   ✅ getAverageExcess: ${ethers.formatUnits(avgExcess, 6)} USDT`);

        console.log('\n✅ Todas las funciones nuevas funcionan correctamente!');
    } catch (error) {
        console.error(`\n❌ Error verificando funciones: ${error.message}`);
    }

    console.log('\n📋 RESUMEN DEL DEPLOY:');
    console.log(`   Contrato: SanDigital_Micro_V2 (Cap and Redistribute)`);
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Network: Sepolia`);
    console.log(`   USDT: ${USDT_ADDRESS}`);
    console.log(`   Punto Landa: 15 USDT`);
    console.log(`   Exit Cap: 20 USDT`);
    console.log(`   Límite Usuarios: 30`);

    console.log('\n✨ NUEVAS CARACTERÍSTICAS:');
    console.log(`   ✅ Cap en 20 USDT (excedentes a globalReserve)`);
    console.log(`   ✅ Tracking de excedentes redistribuidos`);
    console.log(`   ✅ Métricas de admin (getAdminMetrics)`);
    console.log(`   ✅ Evento ExcessRedistributed`);

    console.log('\n📌 PRÓXIMOS PASOS:');
    console.log(`   1. Actualizar addresses.json:`);
    console.log(`      "microV2": "${contractAddress}"`);
    console.log(`   2. Actualizar ABI en frontend`);
    console.log(`   3. Probar con transacciones reales`);
    console.log(`   4. Monitorear métricas de admin\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
