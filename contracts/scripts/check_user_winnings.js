const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 Verificando estado del sorteo y premios...\n');

    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    const userAddress = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';

    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('📍 Contrato:', poolChainAddress);
    console.log('📍 Usuario:', userAddress);
    console.log('\n================');

    // Estado general
    const currentRound = await PoolChain.currentRound();
    const winnersSelected = await PoolChain.winnersSelected();
    const poolFilled = await PoolChain.poolFilled();

    console.log('\n📊 Estado del Contrato:');
    console.log(`Ronda Actual: ${currentRound}`);
    console.log(`Pool Lleno: ${poolFilled}`);
    console.log(`Ganadores Seleccionados: ${winnersSelected}`);

    // Premios del usuario
    const claimable = await PoolChain.claimable(userAddress);
    const claimableUSDT = ethers.formatUnits(claimable, 6);

    console.log('\n💰 Premios del Usuario:');
    console.log(`Claimable: ${claimableUSDT} USDT`);

    // Grupos de ganadores
    if (winnersSelected) {
        console.log('\n🏆 Grupos de Ganadores:');

        const groupA = await PoolChain.getGroupAWinners();
        const groupB = await PoolChain.getGroupBWinners();
        const groupC = await PoolChain.getGroupCWinners();
        const groupD = await PoolChain.getGroupDWinners();

        console.log(`Grupo A: ${groupA.length} ganadores`);
        console.log(`Grupo B: ${groupB.length} ganadores`);
        console.log(`Grupo C: ${groupC.length} ganadores`);
        console.log(`Grupo D: ${groupD.length} ganadores`);

        // Verificar si el usuario está en algún grupo
        const userPositions = await PoolChain.getUserPositions(userAddress);
        console.log(`\n📍 Posiciones del Usuario: [${userPositions.join(', ')}]`);

        const isInA = groupA.some(pos => userPositions.includes(pos));
        const isInB = groupB.some(pos => userPositions.includes(pos));
        const isInC = groupC.some(pos => userPositions.includes(pos));
        const isInD = groupD.some(pos => userPositions.includes(pos));

        console.log('\n🎯 Usuario en Grupos:');
        console.log(`Grupo A: ${isInA ? '✅ SÍ' : '❌ NO'}`);
        console.log(`Grupo B: ${isInB ? '✅ SÍ' : '❌ NO'}`);
        console.log(`Grupo C: ${isInC ? '✅ SÍ' : '❌ NO'}`);
        console.log(`Grupo D: ${isInD ? '✅ SÍ' : '❌ NO'}`);
    } else {
        console.log('\n⚠️  El sorteo NO se ha ejecutado todavía.');
    }

    console.log('\n================\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
