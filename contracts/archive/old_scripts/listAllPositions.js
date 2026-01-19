const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0xe6626dC12CE46aE3D7475A9504433fD6120499B7';

    const contract = await ethers.getContractAt('SanDigital_4Funds', CONTRACT_ADDRESS);

    console.log('\n🔍 Verificando todas las posiciones en el contrato...\n');
    console.log('='.repeat(70));

    // Estado del sistema
    const state = await contract.getSystemState();
    console.log('\n📊 ESTADO DEL SISTEMA:');
    console.log(`   Posiciones Activas (Global): ${state[0]}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(state[2], 6)} USDT`);
    console.log(`   Pool Global: ${ethers.formatUnits(state[4], 6)} USDT`);
    console.log(`   Fondo de Cierre: ${ethers.formatUnits(state[5], 6)} USDT`);
    console.log(`   Fondo Operativo: ${ethers.formatUnits(state[6], 6)} USDT`);

    // Obtener todas las posiciones
    const totalPositions = await contract.positions.length;
    console.log(`\n📋 TODAS LAS POSICIONES:`);

    for (let i = 0; i < state[0]; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);

        console.log(`\n   Posición #${posId}:`);
        console.log(`      Owner: ${position.owner}`);
        console.log(`      Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        console.log(`      Active: ${position.isActive}`);
        console.log(`      Index en cola: ${position.indexInActivos}`);
    }

    console.log('\n' + '='.repeat(70) + '\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
