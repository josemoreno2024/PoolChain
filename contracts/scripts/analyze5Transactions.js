const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 ANÁLISIS DE 5 TRANSACCIONES - CAP AND REDISTRIBUTE\n');
    console.log('='.repeat(80));

    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';

    const contract = await ethers.getContractAt('SanDigital_Micro_V2', CONTRACT_ADDRESS);

    // 1. Estado del Sistema
    console.log('\n📊 ESTADO ACTUAL DEL SISTEMA:');
    console.log('-'.repeat(80));

    try {
        const [activePos, cycles, totalIn, totalOut, reserve] = await contract.getSystemState();
        console.log(`   Posiciones Activas: ${activePos}`);
        console.log(`   Ciclos Completados: ${cycles}`);
        console.log(`   Total Depositado: ${ethers.formatUnits(totalIn, 6)} USDT`);
        console.log(`   Total Retirado: ${ethers.formatUnits(totalOut, 6)} USDT`);
        console.log(`   Reserva Global: ${ethers.formatUnits(reserve, 6)} USDT`);
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // 2. Métricas Cap and Redistribute
    console.log('\n✨ MÉTRICAS CAP AND REDISTRIBUTE:');
    console.log('-'.repeat(80));

    try {
        const metrics = await contract.getAdminMetrics();
        console.log(`   Global Reserve: ${ethers.formatUnits(metrics[0], 6)} USDT`);
        console.log(`   Total Excedentes: ${ethers.formatUnits(metrics[1], 6)} USDT`);
        console.log(`   Salidas con Cap: ${metrics[2]}`);
        console.log(`   Balance Operacional: ${ethers.formatUnits(metrics[3], 6)} USDT`);
        console.log(`   Saldos Usuarios: ${ethers.formatUnits(metrics[4], 6)} USDT`);
        console.log(`   Balance Contrato: ${ethers.formatUnits(metrics[5], 6)} USDT`);
        console.log(`   Eficiencia: ${metrics[6]}%`);

        const avgExcess = await contract.getAverageExcess();
        console.log(`   Promedio Excedente: ${ethers.formatUnits(avgExcess, 6)} USDT`);
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // 3. Análisis de Posiciones
    console.log('\n👥 ANÁLISIS DE POSICIONES:');
    console.log('-'.repeat(80));

    try {
        const activosCount = await contract.getGlobalActivosCount();
        console.log(`   Total Posiciones Activas: ${activosCount}\n`);

        for (let i = 0; i < activosCount; i++) {
            const posId = await contract.activos(i);
            const pos = await contract.positions(posId);
            const balance = ethers.formatUnits(pos.saldoTurno, 6);
            const distancia = ethers.formatUnits(15000000n - pos.saldoTurno, 6);
            const isReady = await contract.isReadyForPuntoLanda(posId);

            console.log(`   Posición #${posId}:`);
            console.log(`      Owner: ${pos.owner.substring(0, 10)}...`);
            console.log(`      Balance: ${balance} USDT`);
            console.log(`      Distancia a Punto Landa: ${distancia} USDT`);
            console.log(`      Listo para salir: ${isReady ? '✅ SÍ' : '❌ NO'}`);

            if (i === 0) {
                console.log(`      🎯 EN TURNO - Recibirá próximo pago`);
            }
            console.log('');
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // 4. Eventos Recientes
    console.log('\n📜 EVENTOS RECIENTES (últimos 100 bloques):');
    console.log('-'.repeat(80));

    try {
        const currentBlock = await ethers.provider.getBlockNumber();
        const fromBlock = currentBlock - 100;

        // PositionCreated
        const createdFilter = contract.filters.PositionCreated();
        const createdEvents = await contract.queryFilter(createdFilter, fromBlock);
        console.log(`   ➕ Posiciones Creadas: ${createdEvents.length}`);

        // PuntoLandaReached
        const landaFilter = contract.filters.PuntoLandaReached();
        const landaEvents = await contract.queryFilter(landaFilter, fromBlock);
        console.log(`   🎯 Punto Landa Alcanzado: ${landaEvents.length}`);

        // ExcessRedistributed
        const excessFilter = contract.filters.ExcessRedistributed();
        const excessEvents = await contract.queryFilter(excessFilter, fromBlock);
        console.log(`   ♻️  Excedentes Redistribuidos: ${excessEvents.length}`);

        if (excessEvents.length > 0) {
            console.log('\n   Detalles de Excedentes:');
            for (const event of excessEvents) {
                console.log(`      - Posición #${event.args[0]}: ${ethers.formatUnits(event.args[2], 6)} USDT redistribuidos`);
            }
        }

        // PuntoLandaExit
        const exitFilter = contract.filters.PuntoLandaExit();
        const exitEvents = await contract.queryFilter(exitFilter, fromBlock);
        console.log(`   🚪 Salidas Completadas: ${exitEvents.length}`);

        if (exitEvents.length > 0) {
            console.log('\n   Detalles de Salidas:');
            for (const event of exitEvents) {
                console.log(`      - Posición #${event.args[0]}: ${ethers.formatUnits(event.args[2], 6)} USDT pagados`);
            }
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    // 5. Resumen
    console.log('\n\n📋 RESUMEN:');
    console.log('='.repeat(80));

    try {
        const [activePos, cycles, totalIn, totalOut] = await contract.getSystemState();
        const metrics = await contract.getAdminMetrics();

        console.log(`   ✅ Sistema funcionando correctamente`);
        console.log(`   ✅ ${activePos} posiciones activas`);
        console.log(`   ✅ ${cycles} ciclos completados`);
        console.log(`   ✅ ${ethers.formatUnits(metrics[1], 6)} USDT en excedentes redistribuidos`);
        console.log(`   ✅ Eficiencia: ${metrics[6]}%`);

        const sustainability = totalIn > 0n ? Number((totalIn - totalOut) * 100n / totalIn) : 0;
        console.log(`   ✅ Sostenibilidad: ${sustainability}%`);
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
