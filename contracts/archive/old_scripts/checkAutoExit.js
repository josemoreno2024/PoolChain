const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x08331882A871D85258cB211b0FBd9114d275938C');
    
    console.log('\n VERIFICANDO AUTO-EXIT\n');
    
    // Obtener eventos PositionExited
    const filter = contract.filters.PositionExited();
    const events = await contract.queryFilter(filter, 0, 'latest');
    
    console.log(' EVENTOS DE SALIDA (PositionExited):');
    console.log('   Total eventos:', events.length);
    
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log('\n   Evento #' + (i + 1) + ':');
        console.log('      Ciclo ID:', event.args.positionId.toString());
        console.log('      Usuario:', event.args.user);
        console.log('      Monto Pagado:', ethers.formatUnits(event.args.amountPaid, 6), 'USDT');
        console.log('      Bloque:', event.blockNumber);
        console.log('      TX Hash:', event.transactionHash);
    }
    
    // Verificar estado del contrato
    const state = await contract.getSystemState();
    console.log('\n ESTADO DEL CONTRATO:');
    console.log('   Total Retirado:', ethers.formatUnits(state[3], 6), 'USDT');
    console.log('   Ciclos Completados:', state[1].toString());
    
    // Verificar Ciclo #0
    const pos0 = await contract.positions(0);
    console.log('\n CICLO #0:');
    console.log('   Owner:', pos0.owner);
    console.log('   hasExited:', pos0.hasExited);
    console.log('   isActive:', pos0.isActive);
    console.log('   balance:', ethers.formatUnits(pos0.balance, 6), 'USDT');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
