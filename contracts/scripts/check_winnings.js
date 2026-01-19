const { ethers } = require('hardhat');

async function checkWinnings() {
    console.log('\n🔍 Verificando premios en PoolChain_Simple...\n');

    const poolChainAddress = '0x544543a9665C65F48Ad4a5b81b5Ce57258905D2c';

    // Tu wallet address (reemplaza con la tuya)
    const userAddress = process.env.USER_ADDRESS || '0xYourAddressHere';

    if (userAddress === '0xYourAddressHere') {
        console.log('❌ Por favor configura tu dirección:');
        console.log('   export USER_ADDRESS=0xTuDireccion');
        console.log('   o edita el script directamente\n');
        return;
    }

    const PoolChain = await ethers.getContractAt('PoolChain_Simple', poolChainAddress);

    try {
        // Verificar premios reclamables
        const claimable = await PoolChain.claimable(userAddress);
        const claimableUSDT = ethers.formatUnits(claimable, 6);

        console.log('📊 Resultados:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Usuario: ${userAddress}`);
        console.log(`💰 Premios Reclamables: ${claimableUSDT} USDT`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (parseFloat(claimableUSDT) > 0) {
            console.log('🎉 ¡FELICIDADES! Tienes premios para reclamar');
            console.log('   Ve al frontend y haz clic en "Reclamar Premio"\n');
        } else {
            console.log('😔 No ganaste en esta ronda');
            console.log('   Puedes comprar tickets para la siguiente ronda\n');
        }

        // Verificar ronda actual
        const currentRound = await PoolChain.currentRound();
        const ticketsSold = await PoolChain.ticketsSold();

        console.log('📈 Estado del Pool:');
        console.log(`   Ronda Actual: #${currentRound}`);
        console.log(`   Tickets Vendidos: ${ticketsSold}/100\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkWinnings()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
