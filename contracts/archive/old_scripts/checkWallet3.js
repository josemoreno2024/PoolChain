const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x08331882A871D85258cB211b0FBd9114d275938C');
    
    const wallet3 = '0x51CF2b4d1E9C6dD8d4f4Dc1d0d9bF7Fd';
    
    console.log('\n VERIFICANDO WALLET 3:', wallet3, '\n');
    
    // Obtener posiciones del usuario
    const userPositions = await contract.getUserPositions(wallet3);
    console.log('Total posiciones:', userPositions.length);
    
    for (let i = 0; i < userPositions.length; i++) {
        const posId = userPositions[i];
        const pos = await contract.positions(posId);
        
        console.log('\n Posición #' + posId + ':');
        console.log('  owner:', pos.owner);
        console.log('  isActive:', pos.isActive);
        console.log('  hasExited:', pos.hasExited);
        console.log('  balance:', ethers.formatUnits(pos.balance, 6), 'USDT');
        console.log('  ¿Debería auto-salir?', parseFloat(ethers.formatUnits(pos.balance, 6)) >= 20);
    }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
