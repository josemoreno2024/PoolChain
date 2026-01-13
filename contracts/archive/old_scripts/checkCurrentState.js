const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x08331882A871D85258cB211b0FBd9114d275938C');
    
    console.log('\n ESTADO ACTUAL DEL CONTRATO\n');
    
    const state = await contract.getSystemState();
    console.log(' Sistema:');
    console.log('   Posiciones Activas:', state[0].toString());
    console.log('   Ciclos Completados:', state[1].toString());
    console.log('   Total Depositado:', ethers.formatUnits(state[2], 6), 'USDT');
    console.log('   Total Retirado:', ethers.formatUnits(state[3], 6), 'USDT');
    console.log('   Pool Global:', ethers.formatUnits(state[4], 6), 'USDT');
    console.log('   Fondo Operativo:', ethers.formatUnits(state[5], 6), 'USDT');
    
    console.log('\n TODAS LAS POSICIONES:');
    for (let i = 0; i < state[0]; i++) {
        const posId = await contract.activos(i);
        const pos = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        console.log('   Ciclo #' + posId + ':');
        console.log('      Owner:', pos.owner.substring(0, 10) + '...');
        console.log('      Balance:', ethers.formatUnits(balance, 6), 'USDT');
        console.log('      isActive:', pos.isActive);
        console.log('      hasExited:', pos.hasExited);
    }
    
    // Verificar wallet específica
    const wallet1 = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    const userPositions = await contract.getUserPositions(wallet1);
    console.log('\n Wallet 1 (' + wallet1.substring(0, 10) + '...):');
    console.log('   Total Posiciones:', userPositions.length);
    
    let totalBalance = 0n;
    let activeCount = 0;
    let closedCount = 0;
    
    for (let i = 0; i < userPositions.length; i++) {
        const posId = userPositions[i];
        const pos = await contract.positions(posId);
        const balance = await contract.getPositionBalance(posId);
        
        console.log('   Posición #' + posId + ':');
        console.log('      Balance:', ethers.formatUnits(balance, 6), 'USDT');
        console.log('      isActive:', pos.isActive);
        console.log('      hasExited:', pos.hasExited);
        
        if (pos.isActive && !pos.hasExited) {
            totalBalance += balance;
            activeCount++;
        }
        if (pos.hasExited) {
            closedCount++;
        }
    }
    
    console.log('\n RESUMEN WALLET 1:');
    console.log('   Balance Total:', ethers.formatUnits(totalBalance, 6), 'USDT');
    console.log('   Posiciones Activas:', activeCount);
    console.log('   Posiciones Cerradas:', closedCount);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
