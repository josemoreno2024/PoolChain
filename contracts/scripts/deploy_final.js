const { ethers } = require('hardhat');

async function main() {
    console.log('\n🚀 Desplegando PoolChain_Final en opBNB Testnet...\n');

    const [deployer] = await ethers.getSigners();
    console.log('📍 Deployer:', deployer.address);

    // Direcciones en opBNB Testnet
    const mockUSDTAddress = '0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD';
    const platformWallet = deployer.address;

    console.log('💵 MockUSDT:', mockUSDTAddress);
    console.log('👛 Platform Wallet:', platformWallet);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Deploy PoolChain_Final
    console.log('⏳ Desplegando PoolChain_Final...');
    const PoolChain = await ethers.getContractFactory('PoolChain_Final');
    const poolChain = await PoolChain.deploy(mockUSDTAddress, platformWallet);
    await poolChain.waitForDeployment();

    const poolChainAddress = await poolChain.getAddress();
    console.log('✅ PoolChain_Final desplegado:', poolChainAddress);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 RESUMEN DEL DEPLOYMENT:\n');
    console.log('Contrato: PoolChain_Final');
    console.log('Dirección:', poolChainAddress);
    console.log('Red: opBNB Testnet');
    console.log('MockUSDT:', mockUSDTAddress);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 CARACTERÍSTICAS DEL SISTEMA:\n');
    console.log('✅ Commit-Reveal pattern');
    console.log('✅ Bloque futuro para entropía');
    console.log('✅ performDraw() ejecutable por cualquiera');
    console.log('✅ resetRound() ejecutable por cualquiera');
    console.log('✅ 100% autónomo y verificable');
    console.log('✅ Sin VRF, sin Chainlink, sin costos externos');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 PRÓXIMOS PASOS:\n');
    console.log('1. Actualizar addresses.json con la nueva dirección');
    console.log('2. Actualizar frontend para usar PoolChain_Final ABI');
    console.log('3. Agregar botón "Ejecutar Sorteo" en el frontend');
    console.log('4. Agregar botón "Resetear Ronda" en el frontend');
    console.log('5. Mostrar countdown hasta commitBlock');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 FLUJO DEL SISTEMA:\n');
    console.log('1. Usuarios compran tickets (1-100)');
    console.log('2. Al llegar a 100: emit DrawCommitted(commitBlock)');
    console.log('3. Esperar 3 bloques (~9 segundos)');
    console.log('4. Cualquiera llama performDraw()');
    console.log('5. Sorteo se ejecuta con blockhash(commitBlock)');
    console.log('6. Ganadores reclaman premios');
    console.log('7. Cualquiera llama resetRound()');
    console.log('8. Nueva ronda comienza automáticamente');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 SEGURIDAD:\n');
    console.log('❌ Minero NO puede manipular (hash futuro)');
    console.log('❌ Usuario NO puede manipular (no conoce hash)');
    console.log('❌ Owner NO participa en sorteo');
    console.log('✅ Resultado verificable off-chain');
    console.log('✅ Auditable en explorador de bloques');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 DEPLOYMENT COMPLETADO!\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
