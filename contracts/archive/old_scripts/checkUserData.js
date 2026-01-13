const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x08331882A871D85258cB211b0FBd9114d275938C');
    
    const wallet1 = '0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4';
    
    console.log('\n VERIFICANDO DATOS DE WALLET 1\n');
    
    // Obtener posiciones del usuario
    const userPositions = await contract.getUserPositions(wallet1);
    console.log('Total posiciones:', userPositions.length);
    
    let closedCount = 0;
    let totalReceived = 0n;
    
    for (let i = 0; i < userPositions.length; i++) {
        const posId = userPositions[i];
        const pos = await contract.positions(posId);
        
        console.log('\nPosición #' + posId + ':');
        console.log('  hasExited:', pos.hasExited);
        console.log('  isActive:', pos.isActive);
        console.log('  balance:', ethers.formatUnits(pos.balance, 6), 'USDT');
        
        if (pos.hasExited) {
            closedCount++;
            totalReceived += 20000000n; // 20 USDT por cada posición cerrada
        }
    }
    
    console.log('\n RESUMEN:');
    console.log('Posiciones Cerradas:', closedCount);
    console.log('Total Recibido:', ethers.formatUnits(totalReceived, 6), 'USDT');
    
    // Verificar closedPositionsCount del contrato
    const closedFromContract = await contract.closedPositionsCount(wallet1);
    console.log('\nclosedPositionsCount del contrato:', closedFromContract.toString());
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
