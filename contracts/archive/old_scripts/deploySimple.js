const hre = require("hardhat");

async function main() {
    console.log('\n🚀 Desplegando SanDigital_4Funds (55/35/10) - EXPERIMENTAL...\n');

    const USDT_ADDRESS = '0xB35b75a2392659701600a6e816C5DB00f09Ed6C7';

    console.log('📍 MockUSDT:', USDT_ADDRESS);

    const [deployer] = await hre.ethers.getSigners();
    console.log('👤 Deployer:', deployer.address);
    console.log('⏳ Desplegando contrato...\n');

    const SanDigital4Funds = await hre.ethers.getContractFactory("SanDigital_4Funds");
    const contract = await SanDigital4Funds.deploy(USDT_ADDRESS);

    console.log('⏳ Esperando confirmación de la blockchain...');

    // Esperar confirmaciones
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log('\n✅ Contrato desplegado en:', address);
    console.log('\n📋 Distribución: 55% Global / 35% Turno / 10% Operativo');
    console.log('\n⚠️  EXPERIMENTAL: Sin Fondo de Cierre + Auto-Exit 20-21 USDT');
    console.log('\n📌 Actualiza addresses.json con:');
    console.log(`   "4funds": "${address}"\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
