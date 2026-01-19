const { ethers } = require('hardhat');

async function main() {
    console.log('\n💰 Verificando premios reclamables...\n');

    const poolChainAddress = '0x31f6D2fe01462Cf424aff59f8FA6F4a39DC63273';
    const userAddress = process.argv[2] || '0x1A194e0E5D97F1C1d1F8a6dD1C3d4c5E6F777950'; // Tu wallet

    const PoolChain = await ethers.getContractAt('PoolChain_Final', poolChainAddress);

    console.log('📍 Usuario:', userAddress);
    console.log('📍 Contrato:', poolChainAddress);
    console.log('\n================');

    const claimable = await PoolChain.claimable(userAddress);
    const claimableUSDT = ethers.formatUnits(claimable, 6);

    console.log(`💎 Premios Reclamables: ${claimableUSDT} USDT`);

    if (parseFloat(claimableUSDT) > 0) {
        console.log('\n✅ ¡Tienes premios para reclamar!');
        console.log('   El botón "Mis Premios" debería aparecer en la UI.');
    } else {
        console.log('\n❌ No tienes premios pendientes.');
        console.log('   El botón "Mis Premios" NO aparecerá.');
    }

    console.log('\n================\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
