const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';
    const contract = await ethers.getContractAt('SanDigital_Micro_V2', CONTRACT_ADDRESS);

    console.log('\n=== ESTADO DEL CONTRATO CAP AND REDISTRIBUTE ===\n');
    console.log('Contrato:', CONTRACT_ADDRESS);

    // Posiciones activas
    const activosCount = await contract.getGlobalActivosCount();
    console.log('\nPosiciones Activas Totales:', activosCount.toString());

    // Mostrar cada posición
    console.log('\n--- DETALLES DE CADA POSICIÓN ---\n');

    for (let i = 0; i < activosCount; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        const balance = ethers.formatUnits(position.saldoTurno, 6);

        console.log(`Posición #${posId}:`);
        console.log(`  Wallet: ${position.owner}`);
        console.log(`  Balance: ${balance} USDT`);
        console.log(`  En cola: #${i + 1}`);
        console.log('');
    }

    // Estado del sistema
    const [activePos, cycles, totalIn, totalOut] = await contract.getSystemState();
    console.log('--- RESUMEN ---');
    console.log('Total Depositado:', ethers.formatUnits(totalIn, 6), 'USDT');
    console.log('Total Retirado:', ethers.formatUnits(totalOut, 6), 'USDT');
    console.log('Ciclos Completados:', cycles.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
    });
