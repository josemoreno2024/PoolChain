const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x1550Ee30653FDFe1dAeE9dF3d396Cfae606A66bf');
    
    console.log('\n VERIFICACIÓN - OVERFLOW DE BALANCE\n');
    
    const state = await contract.getSystemState();
    console.log(' ESTADO DEL SISTEMA:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('   Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    
    console.log('\n TODAS LAS POSICIONES:');
    for (let i = 0; i < state[0]; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        console.log('   Ciclo #' + posId + ':', ethers.formatUnits(balance, 6), 'USDT');
        console.log('      Owner:', position.owner.substring(0, 10) + '...');
        console.log('      isActive:', position.isActive);
        console.log('      hasExited:', position.hasExited);
    }
    
    console.log('\n PROBLEMA:');
    console.log('   Si Ciclo #0 > 20 USDT, debería hacer exit()');
    console.log('   El usuario debe llamar manualmente exit(0)');
    console.log('   O implementar salida automática\n');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
