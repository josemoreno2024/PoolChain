const { ethers } = require('hardhat');

async function main() {
    const CONTRACT_ADDRESS = '0xC415c6D412B3Cf0B680C8a29E967e88fa26A8a8E';
    const contract = await ethers.getContractAt('SanDigital_Micro_V2', CONTRACT_ADDRESS);

    console.log('\n=== MÉTRICAS CAP AND REDISTRIBUTE ===\n');

    // Admin Metrics
    const metrics = await contract.getAdminMetrics();
    console.log('Global Reserve:', ethers.formatUnits(metrics[0], 6), 'USDT');
    console.log('Total Excedentes Redistribuidos:', ethers.formatUnits(metrics[1], 6), 'USDT');
    console.log('Salidas con Cap:', metrics[2].toString());
    console.log('Balance Operacional:', ethers.formatUnits(metrics[3], 6), 'USDT');
    console.log('Total Saldos Usuarios:', ethers.formatUnits(metrics[4], 6), 'USDT');
    console.log('Balance Contrato:', ethers.formatUnits(metrics[5], 6), 'USDT');
    console.log('Eficiencia:', metrics[6].toString(), '%');

    const avgExcess = await contract.getAverageExcess();
    console.log('Promedio Excedente:', ethers.formatUnits(avgExcess, 6), 'USDT');

    console.log('\n=== ANÁLISIS DE DISPERSIÓN ===\n');

    // Sistema
    const [activePos, cycles, totalIn, totalOut, reserve] = await contract.getSystemState();
    console.log('Total Depositado:', ethers.formatUnits(totalIn, 6), 'USDT');
    console.log('Total Retirado:', ethers.formatUnits(totalOut, 6), 'USDT');
    console.log('Reserva Global:', ethers.formatUnits(reserve, 6), 'USDT');

    // Calculado
    const adminFee = totalIn / 10n; // 10% = 1 USDT por cada 10
    const globalDistributed = (totalIn * 45n) / 100n; // 4.5 USDT por TX * 5 TX
    const turnoDistributed = (totalIn * 45n) / 100n;

    console.log('\nAdmin Fee (10%):', ethers.formatUnits(adminFee, 6), 'USDT');
    console.log('Global Distribuido (45%):', ethers.formatUnits(globalDistributed, 6), 'USDT');
    console.log('Turno Distribuido (45%):', ethers.formatUnits(turnoDistributed, 6), 'USDT');

    // Sumar balances
    const activosCount = await contract.getGlobalActivosCount();
    let totalBalances = 0n;

    for (let i = 0; i < activosCount; i++) {
        const posId = await contract.activos(i);
        const position = await contract.positions(posId);
        totalBalances += position.saldoTurno;
    }

    console.log('\nSuma de todos los balances:', ethers.formatUnits(totalBalances, 6), 'USDT');
    console.log('Esperado (Global + Turno):', ethers.formatUnits(globalDistributed + turnoDistributed, 6), 'USDT');

    const diff = (globalDistributed + turnoDistributed) - totalBalances;
    console.log('DIFERENCIA:', ethers.formatUnits(diff, 6), 'USDT');

    if (diff > 0) {
        console.log('\n⚠️  FALTA DINERO - HAY UN BUG EN LA DISPERSIÓN');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
    });
