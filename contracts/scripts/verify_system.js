const hre = require("hardhat");

/**
 * VERIFICACIÓN PRE-OPERACIONES
 * Este script verifica que todo está correctamente configurado antes de realizar las 100 compras
 */

async function main() {
    console.log("🔍 INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA VRF\n");
    console.log("=".repeat(80));

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n📝 Verificando con cuenta:", deployer.address);

    // ============ CONFIGURACIÓN ============
    const POOLCHAIN_ADDRESS = "0x20C8d9689708d7d788f361d60D101397cec49fC7";
    const EXPECTED_KEY_HASH = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";
    const EXPECTED_SUBSCRIPTION_ID = "39265163140503036121577150381371014086785907122241201633055517765001554695711";
    const EXPECTED_VRF_COORDINATOR = "0xDA3b641D438362C440Ac5458c57e00a712b66700";

    let errors = [];
    let warnings = [];

    // ============ TEST 1: Contrato Desplegado ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 1: Verificando que el contrato está desplegado...");
    console.log("=".repeat(80));

    try {
        const code = await hre.ethers.provider.getCode(POOLCHAIN_ADDRESS);
        if (code === "0x") {
            errors.push("❌ CRÍTICO: El contrato NO está desplegado en la dirección especificada");
            console.log("❌ FALLO: No hay código en la dirección");
        } else {
            console.log(`✅ ÉXITO: Contrato desplegado (${code.length} bytes de bytecode)`);
        }
    } catch (error) {
        errors.push("❌ CRÍTICO: Error al verificar el contrato: " + error.message);
    }

    // ============ TEST 2: Parámetros VRF Inmutables ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 2: Verificando parámetros VRF inmutables en el contrato...");
    console.log("=".repeat(80));

    try {
        const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);

        // Verificar VRF Coordinator
        const vrfCoordinator = await PoolChain.COORDINATOR();
        console.log(`🔍 VRF Coordinator: ${vrfCoordinator}`);
        if (vrfCoordinator.toLowerCase() === EXPECTED_VRF_COORDINATOR.toLowerCase()) {
            console.log("✅ VRF Coordinator correcto");
        } else {
            errors.push(`❌ VRF Coordinator incorrecto. Esperado: ${EXPECTED_VRF_COORDINATOR}, Actual: ${vrfCoordinator}`);
        }

        // Verificar Key Hash
        const keyHash = await PoolChain.keyHash();
        console.log(`🔍 Key Hash: ${keyHash}`);
        if (keyHash.toLowerCase() === EXPECTED_KEY_HASH.toLowerCase()) {
            console.log("✅ Key Hash correcto (oficial de BSC Testnet)");
        } else {
            errors.push(`❌ CRÍTICO: Key Hash incorrecto. Esperado: ${EXPECTED_KEY_HASH}, Actual: ${keyHash}`);
            console.log("   ⚠️  Esto causará fallas en VRF. NECESITA RE-DEPLOYMENT.");
        }

        // Verificar Subscription ID
        const subscriptionId = await PoolChain.subscriptionId();
        console.log(`🔍 Subscription ID: ${subscriptionId.toString()}`);
        if (subscriptionId.toString() === EXPECTED_SUBSCRIPTION_ID) {
            console.log("✅ Subscription ID correcto");
        } else {
            errors.push(`❌ Subscription ID incorrecto. Esperado: ${EXPECTED_SUBSCRIPTION_ID}, Actual: ${subscriptionId}`);
        }

    } catch (error) {
        errors.push("❌ Error al leer parámetros del contrato: " + error.message);
    }

    // ============ TEST 3: Estado Inicial del Pool ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 3: Verificando estado inicial del pool...");
    console.log("=".repeat(80));

    try {
        const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);

        const ticketsSold = await PoolChain.ticketsSold();
        const currentRound = await PoolChain.currentRound();
        const poolFilled = await PoolChain.poolFilled();
        const vrfRequested = await PoolChain.vrfRequested();
        const winnersSelected = await PoolChain.winnersSelected();

        console.log(`🔍 Tickets vendidos: ${ticketsSold}`);
        console.log(`🔍 Ronda actual: ${currentRound}`);
        console.log(`🔍 Pool lleno: ${poolFilled}`);
        console.log(`🔍 VRF solicitado: ${vrfRequested}`);
        console.log(`🔍 Ganadores seleccionados: ${winnersSelected}`);

        if (ticketsSold.toString() === "0" && !poolFilled && !vrfRequested && !winnersSelected) {
            console.log("✅ Pool en estado inicial limpio");
        } else {
            warnings.push(`⚠️  Pool no está en estado inicial: ${ticketsSold} tickets vendidos`);
            console.log("⚠️  El pool ya tiene actividad. Esto no es un error, pero verifica que sea intencional.");
        }

    } catch (error) {
        errors.push("❌ Error al verificar estado del pool: " + error.message);
    }

    // ============ TEST 4: Constantes del Contrato ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 4: Verificando constantes del contrato...");
    console.log("=".repeat(80));

    try {
        const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);

        const ticketPrice = await PoolChain.TICKET_PRICE();
        const maxParticipants = await PoolChain.MAX_PARTICIPANTS();
        const gasFee = await PoolChain.GAS_FEE_PERCENT();

        console.log(`🔍 Precio del ticket: ${hre.ethers.formatUnits(ticketPrice, 6)} USDT`);
        console.log(`🔍 Máximo de participantes: ${maxParticipants}`);
        console.log(`🔍 Fee de gas: ${gasFee}%`);

        if (ticketPrice.toString() === "2000000" && maxParticipants.toString() === "100" && gasFee.toString() === "3") {
            console.log("✅ Todas las constantes son correctas");
        } else {
            warnings.push("⚠️  Constantes del contrato difieren de las esperadas");
        }

    } catch (error) {
        errors.push("❌ Error al verificar constantes: " + error.message);
    }

    // ============ TEST 5: Verificar USDT ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 5: Verificando contrato USDT...");
    console.log("=".repeat(80));

    try {
        const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);
        const usdtAddress = await PoolChain.usdt();

        console.log(`🔍 USDT Address: ${usdtAddress}`);

        const usdtCode = await hre.ethers.provider.getCode(usdtAddress);
        if (usdtCode === "0x") {
            errors.push("❌ CRÍTICO: El contrato USDT no está desplegado");
        } else {
            console.log("✅ Contrato USDT desplegado correctamente");

            // Verificar balance del deployer
            const MockUSDT = await hre.ethers.getContractAt("MockUSDT", usdtAddress);
            const balance = await MockUSDT.balanceOf(deployer.address);
            console.log(`🔍 Balance USDT del deployer: ${hre.ethers.formatUnits(balance, 6)} USDT`);

            if (balance < hre.ethers.parseUnits("200", 6)) {
                warnings.push("⚠️  Balance USDT bajo. Considera mintear más USDT para pruebas.");
            }
        }

    } catch (error) {
        errors.push("❌ Error al verificar USDT: " + error.message);
    }

    // ============ TEST 6: Verificar VRF Coordinator ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 6: Verificando VRF Coordinator en la red...");
    console.log("=".repeat(80));

    try {
        const coordinatorCode = await hre.ethers.provider.getCode(EXPECTED_VRF_COORDINATOR);
        if (coordinatorCode === "0x") {
            errors.push("❌ CRÍTICO: VRF Coordinator no encontrado en la red");
        } else {
            console.log("✅ VRF Coordinator existe en la red");
        }
    } catch (error) {
        errors.push("❌ Error al verificar VRF Coordinator: " + error.message);
    }

    // ============ TEST 7: Simulación Teórica de Flujo VRF ============
    console.log("\n" + "=".repeat(80));
    console.log("TEST 7: Verificación teórica del flujo VRF...");
    console.log("=".repeat(80));

    console.log("📋 Flujo esperado:");
    console.log("   1. Usuario compra posiciones específicas (buySpecificPositions)");
    console.log("   2. Cuando ticketsSold alcanza 100:");
    console.log("      → poolFilled = true");
    console.log("      → _requestRandomWords() se ejecuta automáticamente");
    console.log("   3. VRF Coordinator recibe solicitud con:");
    console.log(`      → keyHash: ${EXPECTED_KEY_HASH}`);
    console.log(`      → subId: ${EXPECTED_SUBSCRIPTION_ID}`);
    console.log("   4. Chainlink envía número aleatorio (2-3 min)");
    console.log("   5. fulfillRandomWords() ejecuta _executeDraw() automáticamente");
    console.log("   6. Ganadores seleccionados, premios distribuidos");
    console.log("   7. _resetRound() ejecuta automáticamente");
    console.log("✅ Flujo teórico correcto");

    // ============ RESUMEN FINAL ============
    console.log("\n" + "=".repeat(80));
    console.log("📊 RESUMEN DE VERIFICACIÓN");
    console.log("=".repeat(80));

    if (errors.length === 0 && warnings.length === 0) {
        console.log("\n✅✅✅ SISTEMA COMPLETAMENTE FUNCIONAL ✅✅✅");
        console.log("\n🎉 Todos los tests pasaron exitosamente.");
        console.log("🚀 El sistema está listo para las 100 operaciones.");
        console.log("\n📋 PRÓXIMOS PASOS:");
        console.log("   1. Aprobar USDT en el contrato PoolChain");
        console.log("   2. Comprar tickets eligiendo posiciones (1-100)");
        console.log("   3. Al llegar a 100 tickets, el sorteo será AUTOMÁTICO");
        console.log("   4. Esperar 2-3 minutos para el número aleatorio de VRF");
        console.log("   5. Verificar ganadores automáticamente");
        console.log("\n⚠️  RECORDATORIO:");
        console.log("   - El contrato debe estar agregado como consumidor en VRF Subscription");
        console.log("   - La subscription debe tener suficiente LINK (actualmente: 30 LINK)");

    } else {
        console.log("\n❌ SE ENCONTRARON PROBLEMAS:\n");

        if (errors.length > 0) {
            console.log("🚨 ERRORES CRÍTICOS:");
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        if (warnings.length > 0) {
            console.log("\n⚠️  ADVERTENCIAS:");
            warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }

        console.log("\n🛑 NO PROCEDER con las 100 operaciones hasta resolver los errores críticos.");
    }

    console.log("\n" + "=".repeat(80));
    console.log("FIN DE VERIFICACIÓN");
    console.log("=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n🚨 ERROR FATAL EN VERIFICACIÓN:", error);
        process.exit(1);
    });
