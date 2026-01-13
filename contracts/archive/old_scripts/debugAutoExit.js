const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0xc7Bf5436672F8f01fE3c716fE5E6a1e78e1F2b92');
    
    console.log('\n DEBUG AUTO-EXIT\n');
    
    // Verificar constantes
    const MIN_EXIT = await contract.MIN_BALANCE_FOR_EXIT();
    const MAX_EXIT = await contract.MAX_BALANCE_FOR_EXIT();
    console.log(' Constantes:');
    console.log('   MIN_BALANCE_FOR_EXIT:', ethers.formatUnits(MIN_EXIT, 6), 'USDT');
    console.log('   MAX_BALANCE_FOR_EXIT:', ethers.formatUnits(MAX_EXIT, 6), 'USDT');
    
    const state = await contract.getSystemState();
    console.log('\n Estado:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Ciclos Completados:', state[1].toString());
    
    if (state[0] > 0) {
        console.log('\n Posición en Turno:');
        const turnId = await contract.activos(0);
        const pos = await contract.positions(turnId);
        const balance = await contract.getPositionBalance(turnId);
        console.log('   Ciclo #' + turnId);
        console.log('   Owner:', pos.owner.substring(0, 10) + '...');
        console.log('   Balance:', ethers.formatUnits(balance, 6), 'USDT');
        console.log('   isActive:', pos.isActive);
        console.log('   hasExited:', pos.hasExited);
        
        console.log('\n Debería auto-exit?');
        console.log('   balance >= MIN?', balance >= MIN_EXIT, '(' + ethers.formatUnits(balance, 6) + ' >= ' + ethers.formatUnits(MIN_EXIT, 6) + ')');
        console.log('   balance <= MAX?', balance <= MAX_EXIT, '(' + ethers.formatUnits(balance, 6) + ' <= ' + ethers.formatUnits(MAX_EXIT, 6) + ')');
        console.log('   Ambas condiciones:', (balance >= MIN_EXIT && balance <= MAX_EXIT));
    }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
