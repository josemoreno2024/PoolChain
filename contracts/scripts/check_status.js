const hre = require("hardhat");

async function main() {
    const POOLCHAIN_ADDRESS = "0x20C8d9689708d7d788f361d60D101397cec49fC7";

    console.log("🔍 ESTADO ACTUAL DEL CONTRATO\n");
    console.log("=".repeat(60));

    const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);

    const ticketsSold = await PoolChain.ticketsSold();
    const poolFilled = await PoolChain.poolFilled();
    const vrfRequested = await PoolChain.vrfRequested();
    const winnersSelected = await PoolChain.winnersSelected();
    const randomWord = await PoolChain.randomWord();
    const currentRound = await PoolChain.currentRound();

    console.log(`📊 Tickets Vendidos: ${ticketsSold}/100`);
    console.log(`📦 Pool Lleno: ${poolFilled ? 'SÍ' : 'NO'}`);
    console.log(`📡 VRF Solicitado: ${vrfRequested ? 'SÍ' : 'NO'}`);
    console.log(`🏆 Ganadores: ${winnersSelected ? 'SÍ' : 'NO'}`);
    console.log(`🎲 Random Word: ${randomWord.toString()}`);
    console.log(`🔄 Ronda: ${currentRound}`);
    console.log("=".repeat(60));

    if (poolFilled && vrfRequested && !winnersSelected && randomWord.toString() === "0") {
        console.log("\n⏳ ESPERANDO RESPUESTA DE CHAINLINK VRF");
        console.log("✅ Todo configurado correctamente");
        console.log("⏱️  Tiempo estimado: 2-5 minutos");
    } else if (winnersSelected) {
        console.log("\n🎉 ¡SORTEO COMPLETADO!");
    } else if (!poolFilled) {
        console.log(`\n📋 Pool abierto (${ticketsSold}/100 tickets)`);
    } else if (poolFilled && !vrfRequested) {
        console.log("\n🚨 PROBLEMA: Pool lleno pero VRF no solicitado");
    }
}

main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
