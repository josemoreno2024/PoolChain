const { ethers } = require('hardhat');

async function main() {
    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    // Usar getAddress para obtener checksum correcto
    const userAddress = ethers.getAddress('0xb69e4e1dd24e1bf0bde8d62f6f40f7326f1c5cb4');

    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('\n💰 VERIFICANDO GANANCIAS HISTÓRICAS\n');
    console.log('Contrato:', poolChainAddress);
    console.log('Usuario:', userAddress);
    console.log('='.repeat(60));

    // Buscar eventos PrizeClaimed para este usuario
    const filter = PoolChain.filters.PrizeClaimed(userAddress);
    const events = await PoolChain.queryFilter(filter, 0, 'latest');

    console.log(`\n📊 Total de premios reclamados: ${events.length}\n`);

    if (events.length === 0) {
        console.log('❌ NO se encontraron eventos PrizeClaimed para esta wallet');
        console.log('   Esto significa que:');
        console.log('   - Nunca has reclamado premios, O');
        console.log('   - Los premios están pendientes de reclamar\n');

        // Verificar si hay premios pendientes
        const claimable = await PoolChain.claimable(userAddress);
        console.log(`💎 Premios pendientes: ${ethers.formatUnits(claimable, 6)} USDT\n`);

    } else {
        console.log('✅ Premios reclamados encontrados:\n');

        let totalClaimed = 0n;

        for (const event of events) {
            const block = await event.getBlock();
            const date = new Date(block.timestamp * 1000);
            const amount = ethers.formatUnits(event.args.amount, 6);

            totalClaimed += event.args.amount;

            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`💰 Monto: ${amount} USDT`);
            console.log(`   Fecha: ${date.toLocaleString('es-ES')}`);
            console.log(`   Bloque: ${event.blockNumber}`);
            console.log(`   Hash: ${event.transactionHash}`);
            console.log('');
        }

        const totalFormatted = ethers.formatUnits(totalClaimed, 6);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`\n🎉 TOTAL ACUMULADO: ${totalFormatted} USDT\n`);

        // Verificar también premios pendientes
        const claimable = await PoolChain.claimable(userAddress);
        const claimableFormatted = ethers.formatUnits(claimable, 6);
        console.log(`💎 Premios pendientes: ${claimableFormatted} USDT`);
        console.log(`📊 Total (reclamado + pendiente): ${(parseFloat(totalFormatted) + parseFloat(claimableFormatted)).toFixed(2)} USDT\n`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
