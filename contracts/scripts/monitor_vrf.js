const hre = require("hardhat");

/**
 * MONITOR VRF - Verificación en Tiempo Real
 * Monitorea el estado del sorteo y solicitudes VRF
 */

async function main() {
    console.log("🔍 MONITOREANDO ESTADO VRF EN TIEMPO REAL\n");
    console.log("=".repeat(80));

    const POOLCHAIN_ADDRESS = "0x20C8d9689708d7d788f361d60D101397cec49fC7";
    const VRF_COORDINATOR = "0xDA3b641D438362C440Ac5458c57e00a712b66700";

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Monitoreando con cuenta:", deployer.address);

    try {
        const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);

        // ========== ESTADO DEL POOL ==========
        console.log("\n" + "=".repeat(80));
        console.log("📊 ESTADO DEL POOL");
        console.log("=".repeat(80));

        const ticketsSold = await PoolChain.ticketsSold();
        const currentRound = await PoolChain.currentRound();
        const poolFilled = await PoolChain.poolFilled();
        const vrfRequested = await PoolChain.vrfRequested();
        const winnersSelected = await PoolChain.winnersSelected();
        const randomWord = await PoolChain.randomWord();

        console.log(`🎫 Tickets Vendidos: ${ticketsSold} / 100`);
        console.log(`🔄 Ronda Actual: ${currentRound}`);
        console.log(`📦 Pool Lleno: ${poolFilled ? '✅ SÍ' : '❌ NO'}`);
        console.log(`📡 VRF Solicitado: ${vrfRequested ? '✅ SÍ' : '❌ NO'}`);
        console.log(`🏆 Ganadores Seleccionados: ${winnersSelected ? '✅ SÍ' : '❌ NO'}`);
        console.log(`🎲 Random Word: ${randomWord.toString()}`);

        // ========== DIAGNÓSTICO ==========
        console.log("\n" + "=".repeat(80));
        console.log("🔬 DIAGNÓSTICO");
        console.log("=".repeat(80));

        if (ticketsSold.toString() === "100" && poolFilled && vrfRequested && !winnersSelected && randomWord.toString() === "0") {
            console.log("\n⏳ ESTADO: ESPERANDO RESPUESTA DE CHAINLINK VRF");
            console.log("\n✅ El contrato está funcionando CORRECTAMENTE");
            console.log("✅ Pool lleno detectado");
            console.log("✅ VRF fue solicitado exitosamente");
            console.log("⏳ Esperando que Chainlink envíe el número aleatorio...");
            console.log("\n⏱️  TIEMPO ESTIMADO:");
            console.log("   - Normal: 2-3 minutos");
            console.log("   - Máximo en testnet: 5-10 minutos");
            console.log("\n💡 QUÉ ESTÁ PASANDO AHORA:");
            console.log("   1. Tu contrato envió la solicitud a Chainlink");
            console.log("   2. Chainlink está generando un número aleatorio verificable");
            console.log("   3. Chainlink lo enviará de vuelta a tu contrato");
            console.log("   4. El callback fulfillRandomWords() se ejecutará automáticamente");
            console.log("   5. Los ganadores serán seleccionados automáticamente");
            console.log("\n🔗 PARA MONITOREAR EN CHAINLINK:");
            console.log("   https://vrf.chain.link");
            console.log("   Busca tu Subscription ID: 392651...5711");

        } else if (winnersSelected) {
            console.log("\n🎉 ESTADO: SORTEO COMPLETADO");
            console.log("\n✅ El sorteo se ejecutó exitosamente");
            console.log(`✅ Número aleatorio recibido: ${randomWord.toString()}`);
            console.log("✅ Ganadores seleccionados");

            // Mostrar ganadores
            const groupAWinners = await PoolChain.getGroupAWinners();
            const groupBWinners = await PoolChain.getGroupBWinners();
            const groupCWinners = await PoolChain.getGroupCWinners();
            const groupDWinners = await PoolChain.getGroupDWinners();

            console.log("\n🏆 GANADORES:");
            console.log(`   Grupo A (10): ${groupAWinners.length} ganadores`);
            console.log(`   Grupo B (20): ${groupBWinners.length} ganadores`);
            console.log(`   Grupo C (30): ${groupCWinners.length} ganadores`);
            console.log(`   Grupo D (40): ${groupDWinners.length} ganadores`);

        } else if (!poolFilled) {
            console.log("\n📋 ESTADO: POOL ABIERTO");
            console.log(`\n⏳ Esperando más participantes (${ticketsSold}/100)`);
            console.log(`   Faltan ${100 - Number(ticketsSold)} tickets para llenar el pool`);

        } else if (poolFilled && !vrfRequested) {
            console.log("\n🚨 PROBLEMA DETECTADO");
            console.log("\n❌ Pool está lleno pero VRF NO fue solicitado");
            console.log("❌ Esto NO debería pasar en el sistema automático");
            console.log("\n🔧 POSIBLES CAUSAS:");
            console.log("   1. Error en la transacción del ticket #100");
            console.log("   2. Falta de gas al solicitar VRF");
            console.log("   3. Problema con el contrato VRF Coordinator");
        }

        // ========== VERIFICACIÓN DE CONFIGURACIÓN VRF ==========
        console.log("\n" + "=".repeat(80));
        console.log("🔧 VERIFICACIÓN DE CONFIGURACIÓN VRF");
        console.log("=".repeat(80));

        const coordinator = await PoolChain.COORDINATOR();
        const keyHash = await PoolChain.keyHash();
        const subscriptionId = await PoolChain.subscriptionId();

        console.log(`📡 VRF Coordinator: ${coordinator}`);
        console.log(`🔑 Key Hash: ${keyHash}`);
        console.log(`🆔 Subscription ID: ${subscriptionId.toString()}`);

        // Verificar si son los valores correctos
        const EXPECTED_COORDINATOR = "0xDA3b641D438362C440Ac5458c57e00a712b66700";
        const EXPECTED_KEY_HASH = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
        const EXPECTED_SUB_ID = "39265163140503036121577150381371014086785907122241201633055517765001554695711";

        if (coordinator.toLowerCase() === EXPECTED_COORDINATOR.toLowerCase()) {
            console.log("✅ VRF Coordinator correcto");
        } else {
            console.log("❌ VRF Coordinator incorrecto");
        }

        if (keyHash.toLowerCase() === EXPECTED_KEY_HASH.toLowerCase()) {
            console.log("✅ Key Hash correcto");
        } else {
            console.log("❌ Key Hash incorrecto");
        }

        if (subscriptionId.toString() === EXPECTED_SUB_ID) {
            console.log("✅ Subscription ID correcto");
        } else {
            console.log("❌ Subscription ID incorrecto");
        }

        // ========== BUSCAR EVENTOS ==========
        console.log("\n" + "=".repeat(80));
        console.log("📜 EVENTOS RECIENTES DEL CONTRATO");
        console.log("=".repeat(80));

        try {
            // Obtener eventos de los últimos 1000 bloques
            const currentBlock = await hre.ethers.provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 1000);

            console.log(`\n🔍 Buscando eventos desde bloque ${fromBlock} hasta ${currentBlock}...\n`);

            // VRF Requested
            const vrfRequestedEvents = await PoolChain.queryFilter(
                PoolChain.filters.VRFRequested(),
                fromBlock,
                currentBlock
            );

            if (vrfRequestedEvents.length > 0) {
                console.log(`📡 VRFRequested (${vrfRequestedEvents.length} eventos):`);
                vrfRequestedEvents.forEach((event, i) => {
                    console.log(`   ${i + 1}. Round: ${event.args.round}, RequestID: ${event.args.requestId}`);
                    console.log(`      Bloque: ${event.blockNumber}, Tx: ${event.transactionHash}`);
                });
            } else {
                console.log("📡 VRFRequested: Ningún evento encontrado");
            }

            // VRF Received
            const vrfReceivedEvents = await PoolChain.queryFilter(
                PoolChain.filters.VRFReceived(),
                fromBlock,
                currentBlock
            );

            if (vrfReceivedEvents.length > 0) {
                console.log(`\n✅ VRFReceived (${vrfReceivedEvents.length} eventos):`);
                vrfReceivedEvents.forEach((event, i) => {
                    console.log(`   ${i + 1}. Round: ${event.args.round}, RandomWord: ${event.args.randomWord}`);
                    console.log(`      Bloque: ${event.blockNumber}, Tx: ${event.transactionHash}`);
                });
            } else {
                console.log("\n⏳ VRFReceived: Ningún evento encontrado (aún esperando respuesta)");
            }

            // Winners Selected
            const winnersEvents = await PoolChain.queryFilter(
                PoolChain.filters.WinnersSelected(),
                fromBlock,
                currentBlock
            );

            if (winnersEvents.length > 0) {
                console.log(`\n🏆 WinnersSelected (${winnersEvents.length} eventos):`);
                winnersEvents.forEach((event, i) => {
                    console.log(`   ${i + 1}. Round: ${event.args.round}`);
                    console.log(`      Bloque: ${event.blockNumber}, Tx: ${event.transactionHash}`);
                });
            } else {
                console.log("\n⏳ WinnersSelected: Ningún evento encontrado (pendiente)");
            }

        } catch (error) {
            console.log("⚠️  No se pudieron obtener eventos:", error.message);
        }

        // ========== RESUMEN FINAL ==========
        console.log("\n" + "=".repeat(80));
        console.log("📋 RESUMEN FINAL");
        console.log("=".repeat(80));

        if (vrfRequested && !winnersSelected && randomWord.toString() === "0") {
            console.log("\n✅ TODO ESTÁ FUNCIONANDO CORRECTAMENTE");
            console.log("⏳ Solo necesitas ESPERAR a que Chainlink responda (2-5 min)");
            console.log("\n💡 RECOMENDACIÓN:");
            console.log("   - Mantente en la página del dashboard");
            console.log("   - Ejecuta este script cada 1-2 minutos para verificar progreso");
            console.log("   - Cuando veas randomWord != 0, el sorteo se completó");
        } else if (winnersSelected) {
            console.log("\n🎉 ¡SORTEO COMPLETADO EXITOSAMENTE!");
            console.log("✅ Los ganadores ya fueron seleccionados");
            console.log("✅ Verifica la interfaz para ver los premios");
        } else {
            console.log("\n⚠️  Revisa el diagnóstico arriba para más detalles");
        }

        console.log("\n" + "=".repeat(80));
        console.log("FIN DEL MONITOREO");
        console.log("=".repeat(80) + "\n");

    } catch (error) {
        console.error("\n🚨 ERROR AL MONITOREAR:", error.message);
        console.error("\nStack:", error.stack);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n🚨 ERROR FATAL:", error);
        process.exit(1);
    });
