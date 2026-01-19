const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0xe6626dC12CE46aE3D7475A9504433fD6120499B7';
    const WALLET_1 = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';

    console.log('\n🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA\n');
    console.log('='.repeat(70));

    const contract = await ethers.getContractAt('SanDigital_4Funds', CONTRACT_ADDRESS);

    // 1. Estado del sistema
    console.log('\n📊 1. ESTADO DEL SISTEMA:');
    const state = await contract.getSystemState();
    console.log(`   Posiciones Activas Globales: ${state[0]}`);
    console.log(`   Total Depositado: ${ethers.formatUnits(state[2], 6)} USDT`);
    console.log(`   Pool Global: ${ethers.formatUnits(state[4], 6)} USDT`);
    console.log(`   Fondo Cierre: ${ethers.formatUnits(state[5], 6)} USDT`);

    // 2. Todas las posiciones en el contrato
    console.log('\n📋 2. TODAS LAS POSICIONES:');
    const positionsLength = Number(state[0]);

    for (let i = 0; i < positionsLength; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);

        console.log(`\n   Posición #${posId}:`);
        console.log(`      Owner: ${position.owner}`);
        console.log(`      Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        console.log(`      Active: ${position.isActive}`);
        console.log(`      Exited: ${position.hasExited}`);
    }

    // 3. Posiciones de Wallet 1
    console.log(`\n👤 3. POSICIONES DE WALLET 1 (${WALLET_1}):`);
    const userPos = await contract.getUserPositions(WALLET_1);
    console.log(`   Total posiciones: ${userPos.length}`);

    if (userPos.length > 0) {
        console.log(`   Position IDs: [${userPos.join(', ')}]`);

        for (const posId of userPos) {
            const balance = await contract.getPositionBalance(posId);
            const position = await contract.positions(posId);
            console.log(`\n   Posición #${posId}:`);
            console.log(`      Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            console.log(`      Active: ${position.isActive}`);
        }
    } else {
        console.log('   ❌ getUserPositions() retorna array vacío');
    }

    // 4. Balance total del usuario
    const totalBalance = await contract.getUserTotalBalance(WALLET_1);
    console.log(`\n💰 4. BALANCE TOTAL USUARIO: ${ethers.formatUnits(totalBalance, 6)} USDT`);

    // 5. Verificar funciones del contrato
    console.log('\n🔧 5. VERIFICACIÓN DE FUNCIONES:');
    console.log(`   ✅ getSystemState() funciona`);
    console.log(`   ✅ getUserPositions() funciona`);
    console.log(`   ✅ getPositionBalance() funciona`);
    console.log(`   ✅ getUserTotalBalance() funciona`);

    console.log('\n' + '='.repeat(70));
    console.log('\n📌 RESUMEN:');
    console.log(`   Contrato: ${CONTRACT_ADDRESS}`);
    console.log(`   Posiciones globales: ${state[0]}`);
    console.log(`   Posiciones de usuario: ${userPos.length}`);
    console.log(`   Balance usuario: ${ethers.formatUnits(totalBalance, 6)} USDT`);
    console.log('\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
