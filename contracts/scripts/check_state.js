const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 Verificando estado del contrato PoolChain_Final...\n');

    const poolChainAddress = '0xeb922B3eA8adE8d9041A296E96cF56DC3800d230';

    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('📊 Estado Actual:');
    console.log('================');

    const currentRound = await PoolChain.currentRound();
    const ticketsSold = await PoolChain.ticketsSold();
    const poolFilled = await PoolChain.poolFilled();
    const winnersSelected = await PoolChain.winnersSelected();
    const commitBlock = await PoolChain.commitBlock();

    console.log(`Ronda Actual: ${currentRound}`);
    console.log(`Tickets Vendidos: ${ticketsSold}`);
    console.log(`Pool Lleno: ${poolFilled}`);
    console.log(`Ganadores Seleccionados: ${winnersSelected}`);
    console.log(`Commit Block: ${commitBlock}`);

    // Verificar bloque actual
    const currentBlock = await ethers.provider.getBlockNumber();
    console.log(`\n📍 Bloque Actual: ${currentBlock}`);

    if (commitBlock > 0) {
        const blocksToWait = Number(commitBlock) - currentBlock;
        console.log(`⏳ Bloques para ejecutar sorteo: ${blocksToWait}`);

        if (blocksToWait > 0) {
            console.log(`\n⚠️  PROBLEMA DETECTADO:`);
            console.log(`   El sorteo NO se puede ejecutar todavía.`);
            console.log(`   Debes esperar ${blocksToWait} bloques más (~${blocksToWait} segundos).`);
        } else if (blocksToWait < -256) {
            console.log(`\n⚠️  PROBLEMA DETECTADO:`);
            console.log(`   El commitBlock expiró (>256 bloques).`);
            console.log(`   Al ejecutar performDraw() se creará un nuevo commit.`);
        } else {
            console.log(`\n✅ El sorteo PUEDE ejecutarse ahora.`);
        }
    }

    console.log('\n================\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
