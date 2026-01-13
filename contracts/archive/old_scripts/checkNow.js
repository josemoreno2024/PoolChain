const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x1d955a3947aBE7A03f16371B9532b51278C7C798');
    
    console.log('\n ANÁLISIS DESPUÉS DE 2 TRANSACCIONES\n');
    console.log('='.repeat(70));
    
    // Estado del sistema
    const state = await contract.getSystemState();
    console.log('\n ESTADO DEL SISTEMA:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('   Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    console.log('   Fondo Cierre:', ethers.formatUnits(state[5], 6), 'USDT');
    console.log('   Fondo Operativo:', ethers.formatUnits(state[6], 6), 'USDT');
    
    // Todas las posiciones
    console.log('\n TODAS LAS POSICIONES:');
    for (let i = 0; i < state[0]; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        console.log(   Posición #:, ethers.formatUnits(balance, 6), 'USDT', '- Owner:', position.owner.substring(0, 10) + '...');
    }
    
    // Usuario específico
    const wallet = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const userPos = await contract.getUserPositions(wallet);
    const totalBalance = await contract.getUserTotalBalance(wallet);
    console.log(\n WALLET: );
    console.log('   Posiciones:', userPos.length);
    console.log('   Balance Total:', ethers.formatUnits(totalBalance, 6), 'USDT');
    
    // Validación matemática
    console.log('\n VALIDACIÓN MATEMÁTICA (Fórmula 40/35/15/10):');
    console.log('\n   TX1: Primera entrada (10 USDT)');
    console.log('      - 4.0 USDT  Global (acumulado)');
    console.log('      - 3.5 USDT  Turno (NO hay nadie, va a Global)');
    console.log('      - 1.5 USDT  Cierre');
    console.log('      - 1.0 USDT  Operativo');
    console.log('      Global acumulado: 7.5 USDT');
    
    console.log('\n   TX2: Segunda entrada (10 USDT)');
    console.log('      - 4.0 USDT  Global');
    console.log('      - 3.5 USDT  Posición #0 (turno)');
    console.log('      - 1.5 USDT  Cierre');
    console.log('      - 1.0 USDT  Operativo');
    console.log('      Se dispersa Global: 11.5 USDT entre 1 posición activa');
    console.log('      Posición #0 recibe: 3.5 (turno) + 11.5 (dispersión) = 15.0 USDT');
    
    console.log('\n   RESULTADO ESPERADO:');
    console.log('      - Posición #0: 15.0 USDT');
    console.log('      - Posición #1: 0.0 USDT');
    console.log('      - Fondo Cierre: 3.0 USDT');
    console.log('      - Fondo Operativo: 2.0 USDT');
    console.log('      - Pool Global: 0.0 USDT (todo dispersado)');
    
    console.log('\n   RESULTADO REAL:');
    console.log('      - Balance Total Usuario:', ethers.formatUnits(totalBalance, 6), 'USDT');
    console.log('      - Fondo Cierre:', ethers.formatUnits(state[5], 6), 'USDT');
    console.log('      - Fondo Operativo:', ethers.formatUnits(state[6], 6), 'USDT');
    console.log('      - Pool Global:', ethers.formatUnits(state[4], 6), 'USDT\n');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
