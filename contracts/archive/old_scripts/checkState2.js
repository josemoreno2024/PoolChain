const { ethers } = require('hardhat');
async function main() {
    const contract = await ethers.getContractAt('SanDigital_4Funds', '0x08331882A871D85258cB211b0FBd9114d275938C');
    
    console.log('\n ESTADO DEL CONTRATO\n');
    
    const state = await contract.getSystemState();
    console.log(' Sistema:');
    console.log('   Total Retirado:', ethers.formatUnits(state[3], 6), 'USDT');
    console.log('   Ciclos Completados:', state[1].toString());
    
    // Verificar Ciclo #0
    const pos0 = await contract.positions(0);
    console.log('\n CICLO #0:');
    console.log('   Owner:', pos0.owner);
    console.log('   hasExited:', pos0.hasExited);
    console.log('   isActive:', pos0.isActive);
    console.log('   balance:', ethers.formatUnits(pos0.balance, 6), 'USDT');
    
    if (pos0.hasExited) {
        console.log('\n EL CICLO #0 SÍ SALIÓ');
        console.log('   El auto-exit funcionó correctamente');
        console.log('   El usuario debería haber recibido 20 USDT');
        console.log('\n CÓMO VERIFICAR:');
        console.log('   1. Revisa tu balance de USDT en MetaMask');
        console.log('   2. Busca en Sepolia Etherscan:');
        console.log('      https://sepolia.etherscan.io/address/0xb69e0914cD275a34EbFF5c5d90E7bdD6c7B42Cb4#tokentxns');
        console.log('   3. Filtra por token USDT (0xB35b75a2392659701600a6e816C5DB00f09Ed6C7)');
        console.log('   4. Busca transferencia de 20 USDT desde el contrato');
    } else {
        console.log('\n EL CICLO #0 NO HA SALIDO');
        console.log('   Balance actual:', ethers.formatUnits(pos0.balance, 6), 'USDT');
    }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
