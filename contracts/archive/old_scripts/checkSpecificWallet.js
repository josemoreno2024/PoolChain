const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 Verificando saldo de wallet específica...\n');

    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';

    // Pide la wallet address como argumento
    const walletAddress = process.env.WALLET_ADDRESS || process.argv[2];

    if (!walletAddress) {
        console.log('❌ Por favor proporciona una wallet address');
        console.log('Uso: WALLET_ADDRESS=0x... npx hardhat run scripts/checkSpecificWallet.js --network sepolia');
        process.exit(1);
    }

    const contract = await ethers.getContractAt('SanDigital_Micro_V2', CONTRACT_ADDRESS);

    console.log(`Wallet: ${walletAddress}`);
    console.log(`Contrato: ${CONTRACT_ADDRESS}\n`);
    console.log('='.repeat(70));

    // 1. Obtener posiciones del usuario
    console.log('\n📋 POSICIONES DEL USUARIO:');
    const userPositionIds = await contract.getUserPositions(walletAddress);
    console.log(`   Total posiciones: ${userPositionIds.length}`);

    if (userPositionIds.length === 0) {
        console.log('   ❌ No tiene posiciones en este contrato');
        process.exit(0);
    }

    console.log(`   IDs: [${userPositionIds.join(', ')}]`);

    // 2. Detalles de cada posición
    console.log('\n💰 DETALLES DE POSICIONES:');
    console.log('-'.repeat(70));

    let totalBalance = 0n;

    for (let i = 0; i < userPositionIds.length; i++) {
        const posId = userPositionIds[i];
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);

        console.log(`\n   Posición #${posId}:`);
        console.log(`      Owner: ${position.owner}`);
        console.log(`      Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        console.log(`      Active: ${position.isActive}`);
        console.log(`      Exited: ${position.hasExited}`);
        console.log(`      Index in Activos: ${position.indexInActivos}`);

        if (position.isActive && !position.hasExited) {
            totalBalance += balance;
        }
    }

    // 3. Verificar funciones de conteo
    console.log('\n\n📊 VERIFICACIÓN DE FUNCIONES:');
    console.log('-'.repeat(70));

    const activeCount = await contract.getUserActivePositionsCount(walletAddress);
    console.log(`   getUserActivePositionsCount(): ${activeCount}`);

    const userTotalBalance = await contract.getUserTotalBalance(walletAddress);
    console.log(`   getUserTotalBalance(): ${ethers.formatUnits(userTotalBalance, 6)} USDT`);

    console.log(`   Balance calculado manualmente: ${ethers.formatUnits(totalBalance, 6)} USDT`);

    // 4. Posición en la cola
    console.log('\n\n🎯 POSICIÓN EN LA COLA:');
    console.log('-'.repeat(70));

    const globalActivos = await contract.getGlobalActivosCount();
    console.log(`   Total posiciones activas (global): ${globalActivos}`);

    for (let i = 0; i < userPositionIds.length; i++) {
        const posId = userPositionIds[i];
        const position = await contract.positions(posId);

        if (position.isActive) {
            const queuePosition = Number(position.indexInActivos) + 1;
            console.log(`   Posición #${posId} está en lugar ${queuePosition} de ${globalActivos}`);

            if (queuePosition === 1) {
                console.log(`      🎯 EN TURNO - Recibirá próximo pago`);
            } else {
                console.log(`      ⏳ Esperando turno (${queuePosition - 1} adelante)`);
            }
        }
    }

    // 5. Resumen
    console.log('\n\n📋 RESUMEN:');
    console.log('='.repeat(70));
    console.log(`   Wallet: ${walletAddress}`);
    console.log(`   Posiciones Activas: ${activeCount}`);
    console.log(`   Balance Total: ${ethers.formatUnits(userTotalBalance, 6)} USDT`);

    if (userTotalBalance === 0n) {
        console.log(`\n   ⚠️  BALANCE EN CERO`);
        console.log(`   Razón: Posición recién creada o última en cola`);
        console.log(`   Solución: Esperar a que entren más usuarios para recibir dispersión`);
    }

    console.log('\n' + '='.repeat(70) + '\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
