const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x53f0A84f34D562cc4a05E882B23BD7edE2fC6cE4');
    
    console.log('\n VERIFICACIÓN - TX #1\n');
    
    const state = await contract.getSystemState();
    console.log(' ESTADO DEL SISTEMA:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('   Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    console.log('   Fondo Cierre:', ethers.formatUnits(state[5], 6), 'USDT');
    console.log('   Fondo Operativo:', ethers.formatUnits(state[6], 6), 'USDT');
    
    const wallet = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const balance = await contract.getUserTotalBalance(wallet);
    console.log('\n Wallet:', wallet);
    console.log('   Balance:', ethers.formatUnits(balance, 6), 'USDT');
    
    console.log('\n ESPERADO:');
    console.log('   - Ciclo #0: 0 USDT');
    console.log('   - Global Pool: 7.5 USDT (4.0 + 3.5)');
    console.log('   - Fondo Cierre: 1.5 USDT');
    console.log('   - Fondo Operativo: 1.0 USDT\n');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
