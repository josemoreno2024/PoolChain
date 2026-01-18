const hre = require("hardhat");

async function main() {
    console.log("🚨 EJECUTANDO SORTEO DE EMERGENCIA\n");

    const POOLCHAIN_ADDRESS = process.env.CONTRACT_ADDRESS || "PONER_DIRECCIÓN_AQUÍ";

    if (POOLCHAIN_ADDRESS === "PONER_DIRECCIÓN_AQUÍ") {
        console.error("❌ Error: Define CONTRACT_ADDRESS en .env o en este script");
        process.exit(1);
    }

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Ejecutando con:", deployer.address);
    console.log("📍 Contrato:", POOLCHAIN_ADDRESS);

    const PoolChain = await hre.ethers.getContractAt(
        "PoolChain_Hybrid_Auto_WithEmergency",
        POOLCHAIN_ADDRESS
    );

    // Verificar estado
    const poolFilled = await PoolChain.poolFilled();
    const vrfRequested = await PoolChain.vrfRequested();
    const winnersSelected = await PoolChain.winnersSelected();

    console.log("\n📊 Estado:");
    console.log(`   Pool Lleno: ${poolFilled}`);
    console.log(`   VRF Solicitado: ${vrfRequested}`);
    console.log(`   Ganadores: ${winnersSelected}`);

    if (!poolFilled) {
        console.log("\n❌ Pool no está lleno");
        process.exit(1);
    }

    if (winnersSelected) {
        console.log("\n❌ Sorteo ya ejecutado");
        process.exit(1);
    }

    console.log("\n⚠️  EJECUTANDO SORTEO DE EMERGENCIA...");
    console.log("⚠️  Esto usa pseudo-aleatoriedad (NO seguro para producción)");

    const tx = await PoolChain.emergencyDraw();
    console.log("\n⏳ Transacción enviada:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transacción confirmada");

    // Verificar resultado
    const winnersNow = await PoolChain.winnersSelected();
    const randomWord = await PoolChain.randomWord();

    console.log("\n🎉 SORTEO COMPLETADO:");
    console.log(`   Ganadores seleccionados: ${winnersNow}`);
    console.log(`   Random Word: ${randomWord}`);

    console.log("\n📊 Ganadores por grupo:");
    const groupA = await PoolChain.getGroupAWinners();
    const groupB = await PoolChain.getGroupBWinners();
    const groupC = await PoolChain.getGroupCWinners();
    const groupD = await PoolChain.getGroupDWinners();

    console.log(`   Grupo A (10): ${groupA.length} ganadores`);
    console.log(`   Grupo B (20): ${groupB.length} ganadores`);
    console.log(`   Grupo C (30): ${groupC.length} ganadores`);
    console.log(`   Grupo D (40): ${groupD.length} ganadores`);

    console.log("\n🎊 Revisa la interfaz - deberías ver los modales de celebración!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
