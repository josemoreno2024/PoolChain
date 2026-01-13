const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0x1d955a3947aBE7A03f16371B9532b51278C7C798';
    const WALLET = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';

    const contract = await ethers.getContractAt('SanDigital_4Funds', CONTRACT_ADDRESS);

    console.log('\n🔍 VERIFICACIÓN RÁPIDA\n');
    console.log('='.repeat(70));

    // Estado del sistema
    const state = await contract.getSystemState();
    console.log('\n📊 ESTADO DEL SISTEMA:');
    console.log(`   Posiciones Activas: ${state[0]}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(state[2], 6)} USDT`);

    // Posiciones del usuario
    const userPositions = await contract.getUserPositions(WALLET);
    console.log(`\n👤 WALLET: ${WALLET}`);
    console.log(`   Posiciones: ${userPositions.length}`);

    if (userPositions.length > 0) {
        console.log(`   IDs: [${userPositions.join(', ')}]`);
        for (let i = 0; i < userPositions.length; i++) {
            const posId = userPositions[i];
            const balance = await contract.getPositionBalance(posId);
            console.log(`   Posición #${posId}: ${ethers.formatUnits(balance, 6)} USDT`);
        }
    }

    const totalBalance = await contract.getUserTotalBalance(WALLET);
    console.log(`   Balance Total: ${ethers.formatUnits(totalBalance, 6)} USDT`);

    console.log('\n' + '='.repeat(70) + '\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
