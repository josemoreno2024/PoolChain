const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    // La dirección del MockUSDT del usuario (el que tiene 980 USDT)
    const USER_MOCK_USDT = "0xB35b75a2392659701600a6e816C5DB00f09Ed6C7";

    console.log(`🚀 Desplegando NUEVO SanDigital2026 vinculado a MockUSDT: ${USER_MOCK_USDT}`);

    const SanDigital = await hre.ethers.getContractFactory("SanDigital2026");
    const sanDigital = await SanDigital.deploy(USER_MOCK_USDT);

    await sanDigital.waitForDeployment();

    const address = await sanDigital.getAddress();
    console.log(`✅ SanDigital2026 desplegado en: ${address}`);
    console.log(`🔗 Vinculado correctamente al token: ${USER_MOCK_USDT}`);

    // Actualizar addresses.json
    const addressesPath = path.join(__dirname, '../../src/contracts/addresses.json');
    const addresses = {
        mockUSDT: USER_MOCK_USDT,
        sanDigital2026: address,
        network: "sepolia",
        chainId: "11155111",
        exitThreshold: "40",
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log(`📝 addresses.json actualizado`);

    // Guardar en last_deployment.txt
    fs.writeFileSync('last_deployment.txt', address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
