const { ethers } = require('hardhat');

/**
 * Script de verificación completa del sistema Cap and Redistribute
 * Analiza el estado del contrato después de múltiples transacciones
 */

async function main() {
    console.log('\n🔍 VERIFICACIÓN COMPLETA DEL SISTEMA CAP AND REDISTRIBUTE\n');
    console.log('='.repeat(70));

    // Conectar al contrato
    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';
    const USDT_ADDRESS = '0xB35b75a2392659701600a6e816C5DB00f09Ed6C7';

    const SanDigital = await ethers.getContractFactory('SanDigital_Micro_V2');
    const contract = SanDigital.attach(CONTRACT_ADDRESS);

    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    const usdt = MockUSDT.attach(USDT_ADDRESS);

    console.log(`\n📍 Contrato: ${CONTRACT_ADDRESS}`);
    console.log(`💰 USDT: ${USDT_ADDRESS}\n`);

    // 1. Estado del Sistema
    console.log('📊 ESTADO DEL SISTEMA:');
    console.log('-'.repeat(70));

    const systemState = await contract.getSystemState();
    console.log(`   Posiciones Activas: ${systemState[0]}`);
    console.log(`   Ciclos Completados: ${systemState[1]}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(systemState[2], 6)} USDT`);
    console.log(`   Total Retirado: ${ethers.formatUnits(systemState[3], 6)} USDT`);
    console.log(`   Reserva Global: ${ethers.formatUnits(systemState[4], 6)} USDT`);

    // 2. Métricas de Admin (Cap and Redistribute)
    console.log('\n✨ MÉTRICAS CAP AND REDISTRIBUTE:');
    console.log('-'.repeat(70));

    const adminMetrics = await contract.getAdminMetrics();
    console.log(`   Global Reserve: ${ethers.formatUnits(adminMetrics[0], 6)} USDT`);
    console.log(`   Total Excedentes Redistribuidos: ${ethers.formatUnits(adminMetrics[1], 6)} USDT`);
    console.log(`   Salidas con Cap: ${adminMetrics[2]}`);
    console.log(`   Balance Operacional (Admin): ${ethers.formatUnits(adminMetrics[3], 6)} USDT`);
    console.log(`   Total Saldos Usuarios: ${ethers.formatUnits(adminMetrics[4], 6)} USDT`);
    console.log(`   Balance del Contrato: ${ethers.formatUnits(adminMetrics[5], 6)} USDT`);
    console.log(`   Eficiencia: ${adminMetrics[6]}%`);

    const avgExcess = await contract.getAverageExcess();
    console.log(`   Promedio Excedente: ${ethers.formatUnits(avgExcess, 6)} USDT`);

    // 3. Balance Real del Contrato
    console.log('\n💼 BALANCE DEL CONTRATO:');
    console.log('-'.repeat(70));

    const contractBalance = await usdt.balanceOf(CONTRACT_ADDRESS);
    console.log(`   USDT en Contrato: ${ethers.formatUnits(contractBalance, 6)} USDT`);

    // 4. Análisis de Posiciones Activas
    console.log('\n👥 POSICIONES ACTIVAS:');
    console.log('-'.repeat(70));

    const activosCount = await contract.getGlobalActivosCount();

    for (let i = 0; i < activosCount; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        const isReady = await contract.isReadyForPuntoLanda(posId);

        console.log(`\n   Posición #${posId}:`);
        console.log(`      Owner: ${position.owner}`);
        console.log(`      Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        console.log(`      Distancia a Punto Landa: ${ethers.formatUnits(15000000n - balance, 6)} USDT`);
        console.log(`      ¿Listo para salir?: ${isReady ? '✅ SÍ' : '❌ NO'}`);

        if (balance > 15000000n) {
            const excess = balance - 20000000n;
            if (excess > 0) {
                console.log(`      ⚠️ Excedente potencial: ${ethers.formatUnits(excess, 6)} USDT`);
            }
        }
    }

    // 5. Análisis de Sostenibilidad
    console.log('\n\n🔬 ANÁLISIS DE SOSTENIBILIDAD:');
    console.log('-'.repeat(70));

    const totalIn = systemState[2];
    const totalOut = systemState[3];
    const netBalance = totalIn - totalOut;

    console.log(`   Total Entradas: ${ethers.formatUnits(totalIn, 6)} USDT`);
    console.log(`   Total Salidas: ${ethers.formatUnits(totalOut, 6)} USDT`);
    console.log(`   Balance Neto: ${ethers.formatUnits(netBalance, 6)} USDT`);

    const sustainability = totalIn > 0n ? Number((netBalance * 100n) / totalIn) : 0;
    console.log(`   Sostenibilidad: ${sustainability}%`);

    if (sustainability > 0) {
        console.log(`   ✅ Sistema SOSTENIBLE`);
    } else {
        console.log(`   ⚠️ Sistema en déficit`);
    }

    // 6. Verificación de Punto Landa
    console.log('\n\n🎯 VERIFICACIÓN PUNTO LANDA:');
    console.log('-'.repeat(70));

    let readyForExit = 0;
    for (let i = 0; i < activosCount; i++) {
        const posId = await contract.activos(i);
        const isReady = await contract.isReadyForPuntoLanda(posId);
        if (isReady) readyForExit++;
    }

    console.log(`   Usuarios listos para salir: ${readyForExit} de ${activosCount}`);
    console.log(`   Punto Landa: 15 USDT`);
    console.log(`   Exit Cap: 20 USDT`);

    // 7. Resumen Final
    console.log('\n\n📋 RESUMEN EJECUTIVO:');
    console.log('='.repeat(70));
    console.log(`   ✅ Posiciones Activas: ${activosCount}`);
    console.log(`   ✅ Ciclos Completados: ${systemState[1]}`);
    console.log(`   ✅ Excedentes Redistribuidos: ${ethers.formatUnits(adminMetrics[1], 6)} USDT`);
    console.log(`   ✅ Eficiencia del Sistema: ${adminMetrics[6]}%`);
    console.log(`   ✅ Balance del Contrato: ${ethers.formatUnits(contractBalance, 6)} USDT`);
    console.log(`   ✅ Sostenibilidad: ${sustainability}%`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Verificación completada!\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
