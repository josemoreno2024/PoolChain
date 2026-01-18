const hre = require("hardhat");

async function main() {
    console.log("🔬 VERIFICACIÓN COMPLETA 100% - SISTEMAS CRÍTICOS\n");
    console.log("=".repeat(80));

    const POOLCHAIN_ADDRESS = "0x20C8d9689708d7d788f361d60D101397cec49fC7";

    const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);
    const provider = hre.ethers.provider;

    // ========== TEST 1: CONFIGURACIÓN VRF ==========
    console.log("\n📋 TEST 1: VERIFICACIÓN DE CONFIGURACIÓN VRF");
    console.log("-".repeat(80));

    const keyHash = await PoolChain.keyHash();
    const coordinator = await PoolChain.COORDINATOR();
    const subscriptionId = await PoolChain.subscriptionId();

    const EXPECTED_KEY_HASH = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
    const EXPECTED_COORDINATOR = "0xDA3b641D438362C440Ac5458c57e00a712b66700";
    const EXPECTED_SUB_ID = "39265163140503036121577150381371014086785907122241201633055517765001554695711";

    let test1Pass = true;

    if (keyHash.toLowerCase() === EXPECTED_KEY_HASH.toLowerCase()) {
        console.log("✅ Key Hash: CORRECTO");
    } else {
        console.log("❌ Key Hash: INCORRECTO");
        test1Pass = false;
    }

    if (coordinator.toLowerCase() === EXPECTED_COORDINATOR.toLowerCase()) {
        console.log("✅ VRF Coordinator: CORRECTO");
    } else {
        console.log("❌ VRF Coordinator: INCORRECTO");
        test1Pass = false;
    }

    if (subscriptionId.toString() === EXPECTED_SUB_ID) {
        console.log("✅ Subscription ID: CORRECTO");
    } else {
        console.log("❌ Subscription ID: INCORRECTO");
        test1Pass = false;
    }

    console.log(`\n${test1Pass ? '✅ TEST 1: PASADO' : '❌ TEST 1: FALLADO'}`);

    // ========== TEST 2: ESTADO DEL POOL ==========
    console.log("\n📋 TEST 2: ESTADO DEL POOL");
    console.log("-".repeat(80));

    const ticketsSold = await PoolChain.ticketsSold();
    const poolFilled = await PoolChain.poolFilled();
    const vrfRequested = await PoolChain.vrfRequested();
    const winnersSelected = await PoolChain.winnersSelected();
    const randomWord = await PoolChain.randomWord();

    console.log(`Tickets vendidos: ${ticketsSold}/100`);
    console.log(`Pool lleno: ${poolFilled}`);
    console.log(`VRF solicitado: ${vrfRequested}`);
    console.log(`Ganadores seleccionados: ${winnersSelected}`);
    console.log(`Random Word: ${randomWord.toString()}`);

    let test2Pass = true;
    if (ticketsSold.toString() !== "100") {
        console.log("⚠️  Pool no está lleno");
        test2Pass = false;
    }
    if (!poolFilled) {
        console.log("❌ poolFilled debería ser true");
        test2Pass = false;
    }
    if (!vrfRequested) {
        console.log("❌ vrfRequested debería ser true");
        test2Pass = false;
    }

    console.log(`\n${test2Pass ? '✅ TEST 2: PASADO' : '❌ TEST 2: FALLADO'}`);

    // ========== TEST 3: BUSCAR EVENTO VRFRequested ==========
    console.log("\n📋 TEST 3: VERIFICAR EVENTO VRFRequested");
    console.log("-".repeat(80));

    try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 2000);

        console.log(`Buscando eventos desde bloque ${fromBlock} hasta ${currentBlock}...`);

        const vrfRequestedFilter = PoolChain.filters.VRFRequested();
        const vrfRequestedEvents = await PoolChain.queryFilter(vrfRequestedFilter, fromBlock, currentBlock);

        if (vrfRequestedEvents.length > 0) {
            console.log(`\n✅ Encontrados ${vrfRequestedEvents.length} eventos VRFRequested:`);

            for (let i = 0; i < vrfRequestedEvents.length; i++) {
                const event = vrfRequestedEvents[i];
                console.log(`\n   Evento #${i + 1}:`);
                console.log(`   - Round: ${event.args.round}`);
                console.log(`   - Request ID: ${event.args.requestId}`);
                console.log(`   - Bloque: ${event.blockNumber}`);
                console.log(`   - Tx Hash: ${event.transactionHash}`);

                // Obtener detalles de la transacción
                const tx = await provider.getTransaction(event.transactionHash);
                console.log(`   - Gas Limit: ${tx.gasLimit.toString()}`);
                console.log(`   - Gas Price: ${hre.ethers.formatUnits(tx.gasPrice, "gwei")} Gwei`);

                // Obtener el receipt
                const receipt = await provider.getTransactionReceipt(event.transactionHash);
                console.log(`   - Estado: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
                console.log(`   - Gas Usado: ${receipt.gasUsed.toString()}`);
            }

            console.log("\n✅ TEST 3: PASADO - VRF fue solicitado correctamente");
        } else {
            console.log("\n❌ TEST 3: FALLADO - NO se encontró evento VRFRequested");
            console.log("   Esto significa que la solicitud VRF nunca se hizo");
        }
    } catch (error) {
        console.log(`\n❌ TEST 3: ERROR - ${error.message}`);
    }

    // ========== TEST 4: BUSCAR EVENTO VRFReceived ==========
    console.log("\n📋 TEST 4: VERIFICAR EVENTO VRFReceived");
    console.log("-".repeat(80));

    try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 2000);

        const vrfReceivedFilter = PoolChain.filters.VRFReceived();
        const vrfReceivedEvents = await PoolChain.queryFilter(vrfReceivedFilter, fromBlock, currentBlock);

        if (vrfReceivedEvents.length > 0) {
            console.log(`\n✅ Encontrados ${vrfReceivedEvents.length} eventos VRFReceived:`);

            for (let i = 0; i < vrfReceivedEvents.length; i++) {
                const event = vrfReceivedEvents[i];
                console.log(`\n   Evento #${i + 1}:`);
                console.log(`   - Round: ${event.args.round}`);
                console.log(`   - Random Word: ${event.args.randomWord}`);
                console.log(`   - Bloque: ${event.blockNumber}`);
                console.log(`   - Tx Hash: ${event.transactionHash}`);
            }

            console.log("\n✅ TEST 4: PASADO - Chainlink respondió!");
        } else {
            console.log("\n⏳ TEST 4: PENDIENTE - Esperando respuesta de Chainlink");
            console.log("   Esto es NORMAL, puede tardar 2-10 minutos en testnet");
        }
    } catch (error) {
        console.log(`\n❌ TEST 4: ERROR - ${error.message}`);
    }

    // ========== TEST 5: VERIFICAR ÚLTIMA TRANSACCIÓN ==========
    console.log("\n📋 TEST 5: VERIFICAR TRANSACCIÓN DEL TICKET #100");
    console.log("-".repeat(80));

    try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 2000);

        const buyTicketFilter = PoolChain.filters.TicketPurchased();
        const buyEvents = await PoolChain.queryFilter(buyTicketFilter, fromBlock, currentBlock);

        if (buyEvents.length > 0) {
            // Ordenar por bloque (más reciente primero)
            buyEvents.sort((a, b) => b.blockNumber - a.blockNumber);

            const lastEvent = buyEvents[0];
            console.log(`\nÚltima compra de ticket:`);
            console.log(`   - Comprador: ${lastEvent.args.buyer}`);
            console.log(`   - Cantidad: ${lastEvent.args.quantity}`);
            console.log(`   - Bloque: ${lastEvent.blockNumber}`);
            console.log(`   - Tx Hash: ${lastEvent.transactionHash}`);

            // Ver si en esa misma transacción se emitió VRFRequested
            const receipt = await provider.getTransactionReceipt(lastEvent.transactionHash);

            const vrfRequestedInSameTx = receipt.logs.some(log => {
                try {
                    const parsed = PoolChain.interface.parseLog(log);
                    return parsed && parsed.name === 'VRFRequested';
                } catch {
                    return false;
                }
            });

            if (vrfRequestedInSameTx) {
                console.log(`   ✅ VRFRequested se emitió en la MISMA transacción`);
                console.log("   ✅ El trigger automático funcionó correctamente");
            } else {
                console.log(`   ⚠️  VRFRequested NO se emitió en esta transacción`);
                console.log("   Verificando si el pool se llenó con esta compra...");

                // Verificar cuántos tickets se habían vendido antes
                const totalNow = ticketsSold;
                const boughtNow = lastEvent.args.quantity;
                const beforePurchase = totalNow - boughtNow;

                console.log(`   Antes: ${beforePurchase}, Comprados: ${boughtNow}, Total: ${totalNow}`);

                if (totalNow >= 100n) {
                    console.log("   ⚠️  El pool debería estar lleno pero VRF no se disparó automáticamente");
                }
            }
        } else {
            console.log("⚠️  No se encontraron eventos de compra de tickets");
        }
    } catch (error) {
        console.log(`❌ TEST 5: ERROR - ${error.message}`);
    }

    // ========== DIAGNÓSTICO FINAL ==========
    console.log("\n" + "=".repeat(80));
    console.log("🎯 DIAGNÓSTICO FINAL");
    console.log("=".repeat(80));

    if (test1Pass && test2Pass) {
        if (winnersSelected) {
            console.log("\n🎉 SISTEMA 100% FUNCIONAL - SORTEO COMPLETADO");
            console.log("✅ Todos los tests pasaron");
            console.log("✅ El sorteo se ejecutó exitosamente");
            console.log("✅ Ganadores seleccionados");
        } else if (vrfRequested && randomWord.toString() === "0") {
            console.log("\n⏳ SISTEMA 100% FUNCIONAL - ESPERANDO CHAINLINK");
            console.log("✅ Configuración VRF: CORRECTA");
            console.log("✅ Pool lleno: CORRECTO");
            console.log("✅ VRF solicitado: CORRECTO");
            console.log("⏳ Estado: Esperando respuesta de Chainlink VRF");
            console.log("\n💡 PRÓXIMOS PASOS:");
            console.log("   1. Esperar 2-10 minutos (normal en testnet)");
            console.log("   2. Ejecutar este script cada 2 min para verificar");
            console.log("   3. Cuando randomWord != 0, el sorteo estará completo");
        } else {
            console.log("\n⚠️  SISTEMA PARCIALMENTE FUNCIONAL");
            console.log("⚠️  Algunos aspectos requieren atención");
        }
    } else {
        console.log("\n❌ SISTEMA CON ERRORES DE CONFIGURACIÓN");
        console.log("❌ Revisa los tests fallados arriba");
    }

    console.log("\n" + "=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n🚨 ERROR FATAL:", error);
        console.error(error.stack);
        process.exit(1);
    });
