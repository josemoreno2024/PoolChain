const hre = require("hardhat");

async function main() {
    const POOLCHAIN_ADDRESS = "0x20C8d9689708d7d788f361d60D101397cec49fC7";
    const EXPECTED_KEY_HASH = "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186";

    console.log("🔍 Verificando Key Hash del contrato desplegado...\n");

    const PoolChain = await hre.ethers.getContractAt("PoolChain_Hybrid_Auto", POOLCHAIN_ADDRESS);
    const keyHash = await PoolChain.keyHash();

    console.log("Key Hash en el contrato:", keyHash);
    console.log("Key Hash esperado:      ", EXPECTED_KEY_HASH);
    console.log("");

    if (keyHash.toLowerCase() === EXPECTED_KEY_HASH.toLowerCase()) {
        console.log("✅ Key Hash CORRECTO");
    } else {
        console.log("❌ Key Hash INCORRECTO");
        console.log("\n🚨 PROBLEMA: El contrato tiene el Key Hash viejo");
        console.log("🔧 SOLUCIÓN: Necesitas re-desplegar el contrato");
    }
}

main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
