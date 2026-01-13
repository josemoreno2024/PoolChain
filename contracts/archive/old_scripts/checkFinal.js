const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0xA8efC08e62532c72400B6f3dEBDDe4a3b26447c5');
    
    console.log('\n VERIFICACIÓN FINAL - TX #1\n');
    
    const state = await contract.getSystemState();
    console.log(' ESTADO DEL SISTEMA:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('   Saldos Usuarios:', ethers.formatUnits(state[3], 6), 'USDT');
    console.log('   Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    console.log('   Fondo Cierre:', ethers.formatUnits(state[5], 6), 'USDT');
    console.log('   Fondo Operativo:', ethers.formatUnits(state[6], 6), 'USDT');
    
    if (state[0] > 0) {
        console.log('\n POSICIONES:');
        for (let i = 0; i < state[0]; i++) {
            const posId = await contract.activos(i);
            const balance = await contract.getPositionBalance(posId);
            console.log('   Ciclo #' + posId + ':', ethers.formatUnits(balance, 6), 'USDT');
        }
    }
    
    const wallet = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const userBalance = await contract.getUserTotalBalance(wallet);
    console.log('\n Balance Wallet:', ethers.formatUnits(userBalance, 6), 'USDT');
    
    console.log('\n ESPERADO:');
    console.log('   Ciclo #0: 7.5 USDT');
    console.log('   Pool Global: 0 USDT (todo dispersado)');
    console.log('   Fondo Cierre: 1.5 USDT');
    console.log('   Fondo Operativo: 1.0 USDT\n');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
