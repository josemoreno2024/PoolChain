const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x1d955a3947aBE7A03f16371B9532b51278C7C798');
    const state = await contract.getSystemState();
    console.log('Posiciones activas:', state[0].toString());
    const userPos = await contract.getUserPositions('0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4');
    console.log('Posiciones usuario:', userPos.length);
    const balance = await contract.getUserTotalBalance('0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4');
    console.log('Balance:', ethers.formatUnits(balance, 6), 'USDT');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
