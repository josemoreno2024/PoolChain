const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 ANÁLISIS COMPLETO DE TODAS LAS POSICIONES\n');
    console.log('='.repeat(80));

    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';
    const contract = await ethers.getContractAt('SanDigital_Micro_V2', CONTRACT_ADDRESS);

    // 1. Estado del Sistema
    console.log('\n📊 ESTADO DEL SISTEMA:');
    console.log('-'.repeat(80));

    const [activePos, cycles, totalIn, totalOut, reserve] = await contract.getSystemState();
    console.log(`   Posiciones Activas: ${activePos}`);
    console.log(`   Ciclos Completados: ${cycles}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(totalIn, 6)} USDT`);
    console.log(`   Total Retirado: ${ethers.formatUnits(totalOut, 6)} USDT`);
    console.log(`   Reserva Global: ${ethers.formatUnits(reserve, 6)} USDT`);

    // 2. Análisis de TODAS las posiciones
    console.log('\n\n👥 TODAS LAS POSICIONES (ORDEN DE COLA):');
    console.log('='.repeat(80));

    const activosCount = await contract.getGlobalActivosCount();

    let totalBalances = 0n;

    for (let i = 0; i < activosCount; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        const distancia = 15000000n - balance;

        console.log(`\n${i === 0 ? '🎯' : '⏳'} Posición #${posId} (Cola: ${i + 1}/${activosCount}):`);
        console.log(`   Owner: ${position.owner}`);
        console.log(`   Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        console.log(`   Distancia a Landa: ${ethers.formatUnits(distancia, 6)} USDT`);
        console.log(`   Active: ${position.isActive}`);
        console.log(`   Exited: ${position.hasExited}`);

        totalBalances += balance;

        if (i === 0) {
            console.log(`   ✅ EN TURNO - Recibirá próximo pago de 4.5 USDT`);
        }
    }

    // 3. Verificación de Matemática
    console.log('\n\n🔬 VERIFICACIÓN MATEMÁTICA:');
    console.log('='.repeat(80));

    console.log(`   Suma de balances: ${ethers.formatUnits(totalBalances, 6)} USDT`);
    console.log(`   Total depositado: ${ethers.formatUnits(totalIn, 6)} USDT`);
    console.log(`   Total retirado: ${ethers.formatUnits(totalOut, 6)} USDT`);

    const expectedBalance = totalIn - totalOut - (totalIn / 10n); // Menos admin fee
    console.log(`   Balance esperado: ${ethers.formatUnits(expectedBalance, 6)} USDT`);

    const diff = totalBalances - expectedBalance;
    console.log(`   Diferencia: ${ethers.formatUnits(diff, 6)} USDT`);

    // 4. Buscar posiciones con balance 0
    console.log('\n\n⚠️  POSICIONES CON BALANCE CERO:');
    console.log('='.repeat(80));

    let zeroBalanceCount = 0;
    for (let i = 0; i < activosCount; i++) {
        const posId = await contract.activos(i);
        const balance = await contract.getPositionBalance(posId);

        if (balance === 0n) {
            const position = await contract.positions(posId);
            console.log(`   Posición #${posId}:`);
            console.log(`      Owner: ${position.owner}`);
            console.log(`      Cola: ${i + 1}/${activosCount}`);
            console.log(`      ❌ Balance: 0.00 USDT`);
            zeroBalanceCount++;
        }
    }

    if (zeroBalanceCount === 0) {
        console.log(`   ✅ No hay posiciones con balance cero`);
    } else {
        console.log(`\n   ⚠️  ${zeroBalanceCount} posición(es) con balance cero detectadas`);
    }

    // 5. Eventos recientes
    console.log('\n\n📜 EVENTOS RECIENTES:');
    console.log('='.repeat(80));

    const currentBlock = await ethers.provider.getBlockNumber();
    const fromBlock = currentBlock - 100;

    const createdFilter = contract.filters.PositionCreated();
    const createdEvents = await contract.queryFilter(createdFilter, fromBlock);
    console.log(`   Posiciones Creadas: ${createdEvents.length}`);

    for (const event of createdEvents) {
        console.log(`      - Pos #${event.args[0]} por ${event.args[1].substring(0, 10)}...`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
