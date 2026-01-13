const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 Verificando wallet específica...\n');

    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';
    const WALLET_ADDRESS = '0xF5882b3D0c5e4c0b5F5b5b5b5b5b5b5b5b5d438'; // Ajusta esta dirección

    const contract = await ethers.getContractAt('SanDigital_Micro_V2', CONTRACT_ADDRESS);

    console.log(`Wallet: ${WALLET_ADDRESS}`);
    console.log(`Contrato: ${CONTRACT_ADDRESS}\n`);

    // Obtener posiciones del usuario
    const userPositionIds = await contract.getUserPositions(WALLET_ADDRESS);
    console.log(`Posiciones del usuario: ${userPositionIds.length}`);

    if (userPositionIds.length > 0) {
        console.log(`IDs: [${userPositionIds.join(', ')}]\n`);

        for (let i = 0; i < userPositionIds.length; i++) {
            const posId = userPositionIds[i];
            const position = await contract.positions(posId);
            const balance = await contract.getPositionBalance(posId);

            console.log(`Posición #${posId}:`);
            console.log(`  Owner: ${position.owner}`);
            console.log(`  Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            console.log(`  Active: ${position.isActive}`);
            console.log(`  Exited: ${position.hasExited}`);
            console.log('');
        }
    }

    // Verificar conteo de posiciones activas
    const activeCount = await contract.getUserActivePositionsCount(WALLET_ADDRESS);
    console.log(`Posiciones activas (función): ${activeCount}`);

    // Verificar balance total
    const totalBalance = await contract.getUserTotalBalance(WALLET_ADDRESS);
    console.log(`Balance total: ${ethers.formatUnits(totalBalance, 6)} USDT`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
