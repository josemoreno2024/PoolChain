const { ethers } = require('hardhat');

async function main() {
    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    const userAddress = ethers.getAddress('0x51CFcA2C677d3d9200dd0D220E72A8d16Fa7F7Fd');

    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('\n💰 HISTORIAL COMPLETO DE WALLET\n');
    console.log('Contrato:', poolChainAddress);
    console.log('Usuario:', userAddress);
    console.log('='.repeat(60));

    // 1️⃣ SALDO HISTÓRICO RETIRADO (eventos PrizeClaimed)
    console.log('\n📤 EVENTOS PrizeClaimed');

    const claimFilter = PoolChain.filters.PrizeClaimed(userAddress);
    const claimEvents = await PoolChain.queryFilter(claimFilter, 0, 'latest');

    console.log(`   Eventos encontrados: ${claimEvents.length}`);

    let totalClaimed = 0n;
    for (const event of claimEvents) {
        totalClaimed += event.args.amount;
        const block = await event.getBlock();
        const date = new Date(block.timestamp * 1000);
        console.log(`   - ${ethers.formatUnits(event.args.amount, 6)} USDT (${date.toLocaleString('es-ES')}) - Bloque: ${event.blockNumber}`);
        console.log(`     TX: ${event.transactionHash}`);
    }
    console.log(`   ✅ Total Reclamado: ${ethers.formatUnits(totalClaimed, 6)} USDT`);

    // 2️⃣ SALDO PENDIENTE (claimable actual)
    console.log('\n💎 SALDO PENDIENTE ACTUAL');
    const claimable = await PoolChain.claimable(userAddress);
    console.log(`   Pendiente por reclamar: ${ethers.formatUnits(claimable, 6)} USDT`);

    // 3️⃣ RESUMEN
    console.log('\n📊 RESUMEN');
    console.log('━'.repeat(50));
    console.log(`   Total Reclamado (histórico): ${ethers.formatUnits(totalClaimed, 6)} USDT`);
    console.log(`   Pendiente (actual): ${ethers.formatUnits(claimable, 6)} USDT`);
    console.log(`   TOTAL GANADO: ${ethers.formatUnits(totalClaimed + claimable, 6)} USDT`);
    console.log('━'.repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
