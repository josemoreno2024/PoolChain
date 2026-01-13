const { ethers } = require('hardhat');

async function main() {
    console.log('\n🚀 Desplegando SanDigital_4Funds...\n');
    console.log('='.repeat(70));

    // Dirección del MockUSDT en Sepolia (ya desplegado)
    const USDT_ADDRESS = '0xB35b75a2392659701600a6e816C5DB00f09Ed6C7';

    console.log(`\n📍 MockUSDT: ${USDT_ADDRESS}`);

    // Desplegar contrato
    const SanDigital4Funds = await ethers.getContractFactory('SanDigital_4Funds');
    const contract = await SanDigital4Funds.deploy(USDT_ADDRESS);
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log(`\n✅ SanDigital_4Funds desplegado en: ${contractAddress}`);

    // Verificar configuración
    console.log('\n🔍 Verificando configuración...');

    const entryAmount = await contract.ENTRY_AMOUNT();
    const exitAmount = await contract.EXIT_AMOUNT();
    const globalPercent = await contract.GLOBAL_PERCENT();
    const turnPercent = await contract.TURN_PERCENT();
    const closurePercent = await contract.CLOSURE_PERCENT();
    const operationalPercent = await contract.OPERATIONAL_PERCENT();

    console.log(`   Entrada: ${ethers.formatUnits(entryAmount, 6)} USDT`);
    console.log(`   Salida: ${ethers.formatUnits(exitAmount, 6)} USDT`);
    console.log(`   Distribución:`);
    console.log(`      - Global: ${globalPercent}%`);
    console.log(`      - Turno: ${turnPercent}%`);
    console.log(`      - Cierre: ${closurePercent}%`);
    console.log(`      - Operativo: ${operationalPercent}%`);

    // Verificar estado inicial
    const state = await contract.getSystemState();
    console.log(`\n📊 Estado inicial:`);
    console.log(`   Posiciones activas: ${state[0]}`);
    console.log(`   Ciclos completados: ${state[1]}`);
    console.log(`   Total depositado: ${ethers.formatUnits(state[2], 6)} USDT`);
    console.log(`   Total retirado: ${ethers.formatUnits(state[3], 6)} USDT`);
    console.log(`   Pool global: ${ethers.formatUnits(state[4], 6)} USDT`);
    console.log(`   Fondo de cierre: ${ethers.formatUnits(state[5], 6)} USDT`);
    console.log(`   Fondo operativo: ${ethers.formatUnits(state[6], 6)} USDT`);

    console.log('\n' + '='.repeat(70));
    console.log('\n📋 RESUMEN DEL DEPLOY:');
    console.log(`   Contrato: SanDigital_4Funds`);
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Network: Sepolia`);
    console.log(`   USDT: ${USDT_ADDRESS}`);

    console.log('\n✨ ARQUITECTURA DE 4 FONDOS:');
    console.log(`   ✅ 40% (4 USDT) → Dispersión Global Automática`);
    console.log(`   ✅ 40% (4 USDT) → Fondo de Turno`);
    console.log(`   ✅ 10% (1 USDT) → Fondo de Cierre (garantiza 20 USDT exactos)`);
    console.log(`   ✅ 10% (1 USDT) → Fondo Operativo`);

    console.log('\n📌 PRÓXIMOS PASOS:');
    console.log(`   1. Actualizar addresses.json:`);
    console.log(`      "4funds": "${contractAddress}"`);
    console.log(`   2. Actualizar ABI en frontend`);
    console.log(`   3. Probar con wallets existentes`);
    console.log(`   4. Verificar Fondo de Cierre funciona correctamente\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
