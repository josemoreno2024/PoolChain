const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 DIAGNÓSTICO COMPLETO DE WALLET\n');

    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    const userAddress = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';

    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('📍 Contrato:', poolChainAddress);
    console.log('📍 Usuario:', userAddress);
    console.log('\n' + '='.repeat(60));

    // 1. Estado actual del contrato
    const currentRound = await PoolChain.currentRound();
    const winnersSelected = await PoolChain.winnersSelected();
    const poolFilled = await PoolChain.poolFilled();
    const participantCount = await PoolChain.ticketsSold();

    console.log('\n📊 ESTADO ACTUAL DEL CONTRATO:');
    console.log(`   Ronda Actual: ${currentRound}`);
    console.log(`   Tickets Vendidos: ${participantCount}`);
    console.log(`   Pool Lleno: ${poolFilled}`);
    console.log(`   Ganadores Seleccionados: ${winnersSelected}`);

    // 2. Premios del usuario
    const claimable = await PoolChain.claimable(userAddress);
    const claimableUSDT = ethers.formatUnits(claimable, 6);

    console.log('\n💰 PREMIOS DEL USUARIO:');
    console.log(`   Claimable: ${claimableUSDT} USDT`);
    if (parseFloat(claimableUSDT) > 0) {
        console.log('   ✅ TIENE PREMIOS PENDIENTES');
    } else {
        console.log('   ❌ NO tiene premios pendientes');
    }

    // 3. Posiciones del usuario
    const userPositions = await PoolChain.getUserPositions(userAddress);
    console.log('\n🎟️ POSICIONES DEL USUARIO:');
    if (userPositions.length > 0) {
        console.log(`   Total: ${userPositions.length} posiciones`);
        console.log(`   Números: [${userPositions.map(p => Number(p)).join(', ')}]`);
    } else {
        console.log('   ❌ NO tiene posiciones registradas');
        console.log('   → Esta wallet NO participó en la ronda actual');
    }

    // 4. Si hay sorteo ejecutado, verificar grupos
    if (winnersSelected) {
        console.log('\n🏆 RESULTADOS DEL SORTEO:');

        const groupA = await PoolChain.getGroupAWinners();
        const groupB = await PoolChain.getGroupBWinners();
        const groupC = await PoolChain.getGroupCWinners();
        const groupD = await PoolChain.getGroupDWinners();

        console.log(`   Grupo A: ${groupA.length} ganadores`);
        console.log(`   Grupo B: ${groupB.length} ganadores`);
        console.log(`   Grupo C: ${groupC.length} ganadores`);
        console.log(`   Grupo D: ${groupD.length} ganadores`);

        if (userPositions.length > 0) {
            // Verificar en qué grupo está
            let foundInGroup = null;
            let winningPositions = [];

            userPositions.forEach(pos => {
                const posNum = Number(pos);
                if (groupA.some(w => Number(w) === posNum)) {
                    foundInGroup = 'A';
                    winningPositions.push({ pos: posNum, group: 'A', prize: '5.82' });
                }
                if (groupB.some(w => Number(w) === posNum)) {
                    foundInGroup = foundInGroup || 'B';
                    winningPositions.push({ pos: posNum, group: 'B', prize: '2.91' });
                }
                if (groupC.some(w => Number(w) === posNum)) {
                    foundInGroup = foundInGroup || 'C';
                    winningPositions.push({ pos: posNum, group: 'C', prize: '1.29' });
                }
                if (groupD.some(w => Number(w) === posNum)) {
                    foundInGroup = foundInGroup || 'D';
                    winningPositions.push({ pos: posNum, group: 'D', prize: '0.97' });
                }
            });

            console.log('\n🎯 ANÁLISIS DEL USUARIO:');
            if (winningPositions.length > 0) {
                console.log('   ✅ Usuario GANÓ en los siguientes grupos:');
                winningPositions.forEach(w => {
                    console.log(`      Posición #${w.pos} → Grupo ${w.group} (${w.prize} USDT)`);
                });
            } else {
                console.log('   ⚠️ Usuario participó PERO no está en ningún grupo ganador');
                console.log('   → Esto es ANORMAL, todos deben ganar algo');
            }
        }
    } else {
        console.log('\n⏳ SORTEO NO EJECUTADO');
        console.log('   El sorteo de esta ronda aún no se ha realizado');
        if (userPositions.length > 0) {
            console.log('   ✅ Usuario participó, esperando sorteo');
        } else {
            console.log('   ❌ Usuario NO ha participado en esta ronda');
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 RESUMEN:');
    console.log(`   Ronda: ${currentRound}`);
    console.log(`   Participó: ${userPositions.length > 0 ? 'SÍ' : 'NO'}`);
    console.log(`   Sorteo ejecutado: ${winnersSelected ? 'SÍ' : 'NO'}`);
    console.log(`   Premios pendientes: ${claimableUSDT} USDT`);
    console.log('\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
