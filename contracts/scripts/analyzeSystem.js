const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0x7beF0c7257097f7999163C2e55f86afa191f429E';
    const WALLET_1 = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const WALLET_2 = '0x1A194E8cB654D5A8fC0E8b5d8b0C0a8d77977950';

    const contract = await ethers.getContractAt('SanDigital_4Funds', CONTRACT_ADDRESS);

    console.log('\n🔍 ANÁLISIS COMPLETO DEL SISTEMA\n');
    console.log('='.repeat(70));

    // Estado del sistema
    const state = await contract.getSystemState();
    console.log('\n📊 ESTADO DEL SISTEMA:');
    console.log(`   Posiciones Activas: ${state[0]}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(state[2], 6)} USDT`);
    console.log(`   Pool Global: ${ethers.formatUnits(state[4], 6)} USDT`);
    console.log(`   Fondo Cierre: ${ethers.formatUnits(state[5], 6)} USDT`);
    console.log(`   Fondo Operativo: ${ethers.formatUnits(state[6], 6)} USDT`);

    // Todas las posiciones
    console.log('\n📋 TODAS LAS POSICIONES:');
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

    // Wallet 1
    console.log(`\n👤 WALLET 1: ${WALLET_1}`);
    const wallet1Positions = await contract.getUserPositions(WALLET_1);
    console.log(`   Posiciones: ${wallet1Positions.length}`);
    const wallet1Balance = await contract.getUserTotalBalance(WALLET_1);
    console.log(`   Balance Total: ${ethers.formatUnits(wallet1Balance, 6)} USDT`);

    // Wallet 2
    console.log(`\n👤 WALLET 2: ${WALLET_2}`);
    const wallet2Positions = await contract.getUserPositions(WALLET_2);
    console.log(`   Posiciones: ${wallet2Positions.length}`);
    const wallet2Balance = await contract.getUserTotalBalance(WALLET_2);
    console.log(`   Balance Total: ${ethers.formatUnits(wallet2Balance, 6)} USDT`);

    console.log('\n' + '='.repeat(70));

    // Validación matemática
    console.log('\n🧮 VALIDACIÓN MATEMÁTICA:');
    console.log(`   Total depositado: ${ethers.formatUnits(state[2], 6)} USDT`);
    console.log(`   Esperado con 2 entradas: 20 USDT`);

    const expectedGlobal = 8.0; // 4.0 + 4.0 de las 2 entradas
    const expectedClosure = 2.0; // 1.0 + 1.0
    const expectedOperational = 2.0; // 1.0 + 1.0
    const expectedTurn = 3.5; // Solo la segunda entrada pagó turno

    console.log(`\n   Distribución esperada (TX2):`);
    console.log(`      - Wallet 1 recibe turno: 3.5 USDT`);
    console.log(`      - Global dispersado: 8.0 USDT`);
    console.log(`      - Fondo Cierre: 2.0 USDT`);
    console.log(`      - Fondo Operativo: 2.0 USDT`);

    console.log(`\n   Distribución real:`);
    console.log(`      - Wallet 1 balance: ${ethers.formatUnits(wallet1Balance, 6)} USDT`);
    console.log(`      - Pool Global: ${ethers.formatUnits(state[4], 6)} USDT`);
    console.log(`      - Fondo Cierre: ${ethers.formatUnits(state[5], 6)} USDT`);
    console.log(`      - Fondo Operativo: ${ethers.formatUnits(state[6], 6)} USDT\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
