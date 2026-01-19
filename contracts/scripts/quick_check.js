const hre = require("hardhat");

async function main() {
    const pc = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", "0x20C8d9689708d7d788f361d60D101397cec49fC7");

    const vrf = await pc.vrfRequested();
    const win = await pc.winnersSelected();
    const rnd = await pc.randomWord();
    const tickets = await pc.ticketsSold();

    console.log("\n=== ESTADO RÁPIDO ===");
    console.log(`Tickets: ${tickets}/100`);
    console.log(`VRF Solicitado: ${vrf}`);
    console.log(`Winners: ${win}`);
    console.log(`Random: ${rnd}`);

    // Buscar eventos
    const curr = await hre.ethers.provider.getBlockNumber();
    const events = await pc.queryFilter(pc.filters.VRFRequested(), curr - 2000, curr);
    console.log(`\nEventos VRFRequested: ${events.length}`);

    if (events.length > 0) {
        const lastEvent = events[events.length - 1];
        console.log(`RequestID: ${lastEvent.args.requestId}`);
        console.log(`Tx: ${lastEvent.transactionHash}`);
        console.log(`Bloque: ${lastEvent.blockNumber}`);

        const bloquesDiferencia = curr - lastEvent.blockNumber;
        const minutos = Math.floor((bloquesDiferencia * 3) / 60); // ~3 seg por bloque
        console.log(`Tiempo esperando: ~${minutos} minutos`);
    }

    // Verificar si hay VRFReceived
    const receivedEvents = await pc.queryFilter(pc.filters.VRFReceived(), curr - 2000, curr);
    console.log(`\nEventos VRFReceived: ${receivedEvents.length}`);

    if (receivedEvents.length > 0) {
        console.log("✅ Chainlink YA RESPONDIÓ!");
    } else if (vrf && !win) {
        console.log("\n⏳ Chainlink NO ha respondido aún");
        console.log("PROBLEMA: Testnet VRF puede tardar 30-60 minutos");
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
