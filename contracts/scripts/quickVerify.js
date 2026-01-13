const { ethers } = require('hardhat');

async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x1d955a3947aBE7A03f16371B9532b51278C7C798');

    console.log('\n🔍 VERIFICACIÓN RÁPIDA\n');

    const state = await contract.getSystemState();
    console.log('Posiciones Activas:', state[0].toString());
    console.log('Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    console.log('Fondo Cierre:', ethers.formatUnits(state[5], 6), 'USDT');
    console.log('Fondo Operativo:', ethers.formatUnits(state[6], 6), 'USDT');

    const wallet = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const totalBalance = await contract.getUserTotalBalance(wallet);
    console.log('\nBalance Usuario:', ethers.formatUnits(totalBalance, 6), 'USDT');

    console.log('\n✅ ESPERADO: 15.0 USDT (3.5 turno + 11.5 dispersión)');
    console.log('✅ REAL:', ethers.formatUnits(totalBalance, 6), 'USDT\n');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
