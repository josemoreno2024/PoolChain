const { ethers } = require('hardhat');

async function main() {
    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('\n🔍 VERIFICANDO EVENTOS DE SORTEOS\n');
    console.log('Contrato:', poolChainAddress);
    console.log('='.repeat(60));

    // Obtener eventos WinnersSelected
    const filter = PoolChain.filters.WinnersSelected();
    const events = await PoolChain.queryFilter(filter, 0, 'latest');

    console.log(`\n📊 Total de sorteos ejecutados: ${events.length}\n`);

    if (events.length === 0) {
        console.log('❌ NO se han ejecutado sorteos aún');
        console.log('   El historial estará vacío hasta que se ejecute el primer sorteo\n');
    } else {
        console.log('✅ Sorteos encontrados:\n');
        for (const event of events) {
            const block = await event.getBlock();
            const date = new Date(block.timestamp * 1000);
            console.log(`   Ronda #${event.args.round}`);
            console.log(`   Bloque: ${event.blockNumber}`);
            console.log(`   Fecha: ${date.toLocaleString('es-ES')}`);
            console.log(`   Hash: ${event.transactionHash}`);
            console.log('');
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
