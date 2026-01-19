const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0x7beF0c7257097f7999163C2e55f86afa191f429E';
    const WALLET_1 = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';

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
    if (wallet1Positions.length > 0) {
        console.log(`   IDs: [${wallet1Positions.join(', ')}]`);
    }
    const wallet1Balance = await contract.getUserTotalBalance(WALLET_1);
    console.log(`   Balance Total: ${ethers.formatUnits(wallet1Balance, 6)} USDT`);

    console.log('\n' + '='.repeat(70));

    // Validación matemática
    console.log('\n🧮 VALIDACIÓN MATEMÁTICA (Fórmula 40/35/15/10):');
    console.log(`\n   Con 2 entradas de 10 USDT cada una:`);
    console.log(`   TX1: Wallet 1 entra`);
    console.log(`      - 4.0 USDT → Global (acumulado)`);
    console.log(`      - 3.5 USDT → Turno (NO hay nadie, va a Global)`);
    console.log(`      - 1.0 USDT → Cierre`);
    console.log(`      - 1.0 USDT → Operativo`);
    console.log(`      Global acumulado: 7.5 USDT`);

    console.log(`\n   TX2: Wallet 2 entra`);
    console.log(`      - 4.0 USDT → Global`);
    console.log(`      - 3.5 USDT → Wallet 1 (turno)`);
    console.log(`      - 1.0 USDT → Cierre`);
    console.log(`      - 1.0 USDT → Operativo`);
    console.log(`      Se dispersa Global: 11.5 USDT entre 2 posiciones`);

    console.log(`\n   Resultado esperado:`);
    console.log(`      - Wallet 1: 3.5 (turno) + ~5.75 (dispersión) = ~9.25 USDT`);
    console.log(`      - Wallet 2: ~5.75 (dispersión) = ~5.75 USDT`);
    console.log(`      - Fondo Cierre: 2.0 USDT`);
    console.log(`      - Fondo Operativo: 2.0 USDT`);

    console.log(`\n   Resultado real:`);
    console.log(`      - Wallet 1: ${ethers.formatUnits(wallet1Balance, 6)} USDT`);
    console.log(`      - Fondo Cierre: ${ethers.formatUnits(state[5], 6)} USDT`);
    console.log(`      - Fondo Operativo: ${ethers.formatUnits(state[6], 6)} USDT`);
    console.log(`      - Pool Global restante: ${ethers.formatUnits(state[4], 6)} USDT\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
