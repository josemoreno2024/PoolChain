const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0x7beF0c7257097f7999163C2e55f86afa191f429E';
    const WALLET_ADDRESS = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';

    const contract = await ethers.getContractAt('SanDigital_4Funds', CONTRACT_ADDRESS);

    console.log('\n🔍 Verificando estado del contrato...\n');
    console.log('='.repeat(70));

    // Estado del sistema
    const state = await contract.getSystemState();
    console.log('\n📊 ESTADO DEL SISTEMA:');
    console.log(`   Posiciones Activas (Global): ${state[0]}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(state[2], 6)} USDT`);
    console.log(`   Pool Global: ${ethers.formatUnits(state[4], 6)} USDT`);
    console.log(`   Fondo de Cierre: ${ethers.formatUnits(state[5], 6)} USDT`);
    console.log(`   Fondo Operativo: ${ethers.formatUnits(state[6], 6)} USDT`);

    // Posiciones del usuario
    console.log(`\n👤 POSICIONES DEL USUARIO: ${WALLET_ADDRESS}`);
    const userPositions = await contract.getUserPositions(WALLET_ADDRESS);
    console.log(`   Total posiciones: ${userPositions.length}`);

    if (userPositions.length > 0) {
        console.log(`   IDs: [${userPositions.join(', ')}]`);

        for (let i = 0; i < userPositions.length; i++) {
            const posId = userPositions[i];
            const position = await contract.positions(posId);
            const balance = await contract.getPositionBalance(posId);

            console.log(`\n   Posición #${posId}:`);
            console.log(`      Owner: ${position.owner}`);
            console.log(`      Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            console.log(`      Active: ${position.isActive}`);
            console.log(`      Exited: ${position.hasExited}`);
        }
    }

    // Balance total del usuario
    const totalBalance = await contract.getUserTotalBalance(WALLET_ADDRESS);
    console.log(`\n💰 Balance Total Usuario: ${ethers.formatUnits(totalBalance, 6)} USDT`);

    console.log('\n' + '='.repeat(70));

    console.log('\n📌 EXPLICACIÓN:');
    console.log('   Si el balance es 0, es NORMAL para la primera entrada.');
    console.log('   La primera posición recibe fondos cuando entra la SEGUNDA persona.');
    console.log('   Haz una segunda transacción para ver cómo funciona el sistema.\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
