const { ethers } = require('hardhat');

async function main() {
    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('\n🔍 BUSCANDO TODOS LOS SORTEOS EJECUTADOS\n');
    console.log('Contrato:', poolChainAddress);
    console.log('='.repeat(60));

    // Buscar desde bloque 0 (inicio de la red)
    console.log('\n⏳ Buscando eventos WinnersSelected desde el inicio...\n');

    const filter = PoolChain.filters.WinnersSelected();
    const events = await PoolChain.queryFilter(filter, 0, 'latest');

    console.log(`📊 Total de sorteos encontrados: ${events.length}\n`);

    if (events.length === 0) {
        console.log('❌ NO se encontraron eventos WinnersSelected');
        console.log('\n🔍 Verificando otros eventos del contrato...\n');

        // Buscar PoolFilled
        const poolFilledFilter = PoolChain.filters.PoolFilled();
        const poolFilledEvents = await PoolChain.queryFilter(poolFilledFilter, 0, 'latest');
        console.log(`   PoolFilled: ${poolFilledEvents.length} eventos`);

        // Buscar TicketsPurchased
        const ticketsFilter = PoolChain.filters.TicketsPurchased();
        const ticketsEvents = await PoolChain.queryFilter(ticketsFilter, 0, 'latest');
        console.log(`   TicketsPurchased: ${ticketsEvents.length} eventos`);

    } else {
        console.log('✅ Sorteos encontrados:\n');
        for (const event of events) {
            const block = await event.getBlock();
            const date = new Date(block.timestamp * 1000);
            const tx = await event.getTransaction();

            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🎲 Ronda #${event.args.round}`);
            console.log(`   Bloque: ${event.blockNumber}`);
            console.log(`   Fecha: ${date.toLocaleString('es-ES')}`);
            console.log(`   Hash TX: ${event.transactionHash}`);
            console.log(`   Ejecutado por: ${tx.from}`);
            console.log('');
        }
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }

    // Verificar estado actual
    console.log('\n📍 Estado actual del contrato:');
    const currentRound = await PoolChain.currentRound();
    const winnersSelected = await PoolChain.winnersSelected();
    const poolFilled = await PoolChain.poolFilled();

    console.log(`   Ronda actual: ${currentRound}`);
    console.log(`   Pool lleno: ${poolFilled}`);
    console.log(`   Ganadores seleccionados: ${winnersSelected}`);
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
