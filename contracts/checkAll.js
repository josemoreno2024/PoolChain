const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x1d955a3947aBE7A03f16371B9532b51278C7C798');
    
    console.log('\n ANÁLISIS COMPLETO - 3 TRANSACCIONES\n');
    
    const state = await contract.getSystemState();
    console.log(' ESTADO DEL SISTEMA:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('   Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    console.log('   Fondo Cierre:', ethers.formatUnits(state[5], 6), 'USDT');
    console.log('   Fondo Operativo:', ethers.formatUnits(state[6], 6), 'USDT');
    
    console.log('\n TODAS LAS POSICIONES:');
    for (let i = 0; i < state[0]; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        console.log('   Pos #' + posId + ':', ethers.formatUnits(balance, 6), 'USDT -', position.owner.substring(0, 10) + '...');
    }
    
    const wallet1 = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const bal1 = await contract.getUserTotalBalance(wallet1);
    console.log('\n Wallet 1:', ethers.formatUnits(bal1, 6), 'USDT');
    
    console.log('\n ESPERADO (TX3):');
    console.log('   Pos #0: 15 + 3.5 (turno) + dispersión = ~20.5 USDT');
    console.log('   Pos #1: 0 + dispersión = ~2.0 USDT');
    console.log('   Pos #2: 0 USDT (nueva)');
    console.log('   Total Wallet 1: ~22.5 USDT ');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
