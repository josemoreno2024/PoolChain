const { ethers } = require('hardhat');

/**
 * Script para verificar el estado del contrato SanDigital_Micro_V2
 * Uso: npx hardhat run scripts/verifyContractState.js --network sepolia
 */

async function main() {
    console.log('\n🔍 Verificando Estado del Contrato SanDigital_Micro_V2...\n');

    // Dirección del contrato (actualizar con la tuya)
    const CONTRACT_ADDRESS = '0x5bA3B5Cb3A4d95FD39f0cD2e8fFb7f6D856c3Fa2'; // microV2 de addresses.json

    // Dirección de la wallet que hizo la transacción
    const USER_ADDRESS = '0xE3D5D4c5ab2702Aa6360cDf7dD9E713b0BF1bBae';

    // Conectar al contrato
    const SanDigital = await ethers.getContractFactory('SanDigital_Micro_V2');
    const contract = SanDigital.attach(CONTRACT_ADDRESS);

    console.log(`📍 Contrato: ${CONTRACT_ADDRESS}`);
    console.log(`👤 Usuario: ${USER_ADDRESS}\n`);

    // ==========================================
    // VERIFICAR ESTADO DEL USUARIO
    // ==========================================
    console.log('═══════════════════════════════════════');
    console.log('  ESTADO DEL USUARIO');
    console.log('═══════════════════════════════════════\n');

    try {
        // 1. Posiciones del usuario
        const userPositions = await contract.getUserPositions(USER_ADDRESS);
        console.log(`📋 IDs de Posiciones: [${userPositions.join(', ')}]`);
        console.log(`   Total: ${userPositions.length} posiciones\n`);

        // 2. Contador de posiciones activas
        const activeCount = await contract.getUserActivePositionsCount(USER_ADDRESS);
        console.log(`✅ Posiciones Activas: ${activeCount}`);

        // 3. Contador de posiciones cerradas
        const closedCount = await contract.getUserClosedPositionsCount(USER_ADDRESS);
        console.log(`🔒 Posiciones Cerradas: ${closedCount}\n`);

        // 4. Balance total del usuario
        const totalBalance = await contract.getUserTotalBalance(USER_ADDRESS);
        console.log(`💰 Balance Total Acumulado: ${ethers.formatUnits(totalBalance, 6)} USDT\n`);

        // 5. Detalles de cada posición
        if (userPositions.length > 0) {
            console.log('📊 DETALLES DE POSICIONES:\n');
            for (const posId of userPositions) {
                const posInfo = await contract.getPositionInfo(posId);
                console.log(`   Posición #${posId}:`);
                console.log(`   ├─ Owner: ${posInfo.owner}`);
                console.log(`   ├─ Balance: ${ethers.formatUnits(posInfo.balance, 6)} USDT`);
                console.log(`   ├─ Activa: ${posInfo.isActive}`);
                console.log(`   ├─ Salió: ${posInfo.hasExited}`);
                console.log(`   ├─ Distancia a Punto Landa: ${ethers.formatUnits(posInfo.distanceToPuntoLanda, 6)} USDT`);
                console.log(`   └─ Listo para Punto Landa: ${posInfo.readyForPuntoLanda}\n`);
            }
        }

    } catch (error) {
        console.error(`❌ Error leyendo estado del usuario: ${error.message}\n`);
    }

    // ==========================================
    // VERIFICAR ESTADO GLOBAL DEL SISTEMA
    // ==========================================
    console.log('═══════════════════════════════════════');
    console.log('  ESTADO GLOBAL DEL SISTEMA');
    console.log('═══════════════════════════════════════\n');

    try {
        const systemState = await contract.getSystemState();
        console.log(`📊 Posiciones Activas (Global): ${systemState.activePositions}`);
        console.log(`✅ Ciclos Completados: ${systemState.completedCycles}`);
        console.log(`💵 Total Depositado: ${ethers.formatUnits(systemState.totalDeposited, 6)} USDT`);
        console.log(`💸 Total Retirado: ${ethers.formatUnits(systemState.totalWithdrawn, 6)} USDT`);
        console.log(`💰 Balance Operacional: ${ethers.formatUnits(systemState.operationalBalance, 6)} USDT`);
        console.log(`🔢 Total Saldos Usuarios: ${ethers.formatUnits(systemState.totalUserBalances, 6)} USDT\n`);

        // Verificar límite de usuarios
        const MAX_ACTIVE = 30;
        console.log(`⚠️  Límite de Usuarios: ${systemState.activePositions}/${MAX_ACTIVE}`);
        if (systemState.activePositions >= MAX_ACTIVE) {
            console.log(`   🔴 LÍMITE ALCANZADO - No se pueden crear más posiciones\n`);
        } else {
            console.log(`   ✅ Espacio disponible: ${MAX_ACTIVE - systemState.activePositions} posiciones\n`);
        }

    } catch (error) {
        console.error(`❌ Error leyendo estado global: ${error.message}\n`);
    }

    // ==========================================
    // VERIFICAR PRIMERAS 3 POSICIONES EN COLA
    // ==========================================
    console.log('═══════════════════════════════════════');
    console.log('  COLA DE POSICIONES (FIFO)');
    console.log('═══════════════════════════════════════\n');

    try {
        const systemState = await contract.getSystemState();
        const activeCount = Number(systemState.activePositions);

        for (let i = 0; i < Math.min(3, activeCount); i++) {
            const posId = await contract.activos(i);
            const posInfo = await contract.getPositionInfo(posId);

            const position = i === 0 ? '🎯 TURNO' : i === 1 ? '⏭️  SIGUIENTE' : '⏳ TERCERO';
            console.log(`${position} - Posición #${posId}:`);
            console.log(`   Balance: ${ethers.formatUnits(posInfo.balance, 6)} USDT`);
            console.log(`   Distancia: ${ethers.formatUnits(posInfo.distanceToPuntoLanda, 6)} USDT\n`);
        }

    } catch (error) {
        console.error(`❌ Error leyendo cola: ${error.message}\n`);
    }

    console.log('✅ Verificación completada\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
