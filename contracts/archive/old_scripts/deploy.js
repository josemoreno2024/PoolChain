const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Desplegando SanDigital2026 (Modelo 40 USDT)...\n");

    // Obtener signers
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Desplegando con cuenta:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

    // 1. Desplegar MockUSDT
    console.log("📝 Desplegando MockUSDT...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", 6);
    await mockUSDT.waitForDeployment();
    const usdtAddress = await mockUSDT.getAddress();
    console.log("✅ MockUSDT desplegado en:", usdtAddress, "\n");

    // 2. Desplegar SanDigital2026
    console.log("📝 Desplegando SanDigital2026...");
    const SanDigital = await hre.ethers.getContractFactory("SanDigital2026");
    const sanDigital = await SanDigital.deploy(usdtAddress);
    await sanDigital.waitForDeployment();
    const sanAddress = await sanDigital.getAddress();
    console.log("✅ SanDigital2026 desplegado en:", sanAddress, "\n");

    // 3. Mintear USDT para cuentas de prueba
    console.log("💰 Minteando USDT para cuentas de prueba...");

    const accounts = [
        deployer.address, // Cuenta principal
    ];

    const mintAmount = hre.ethers.parseUnits("1000", 6); // 1000 USDT

    for (const account of accounts) {
        const tx = await mockUSDT.mint(account, mintAmount);
        await tx.wait();
        console.log(`✅ ${account}: 1000 USDT`);
    }

    console.log("\n📄 Guardando direcciones y ABIs...");

    // 4. Guardar direcciones
    const addressesPath = path.join(__dirname, '../../src/contracts/addresses.json');
    const addresses = {
        mockUSDT: usdtAddress,
        sanDigital2026: sanAddress,
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        exitThreshold: "40",
        maxPositionsPerUser: "10",
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("✅ Direcciones guardadas en:", addressesPath);

    // 5. Guardar ABIs
    const mockUSDTArtifact = await hre.artifacts.readArtifact("MockERC20");
    const sanDigitalArtifact = await hre.artifacts.readArtifact("SanDigital2026");

    const mockUSDTABIPath = path.join(__dirname, '../../src/contracts/MockUSDT.json');
    const sanDigitalABIPath = path.join(__dirname, '../../src/contracts/SanDigital2026.json');

    fs.writeFileSync(mockUSDTABIPath, JSON.stringify(mockUSDTArtifact.abi, null, 2));
    fs.writeFileSync(sanDigitalABIPath, JSON.stringify(sanDigitalArtifact.abi, null, 2));

    console.log("✅ ABIs guardados\n");

    // 6. Verificar en Etherscan (si está disponible)
    if (process.env.ETHERSCAN_API_KEY && hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
        console.log("🔍 Verificando contratos en Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: usdtAddress,
                constructorArguments: ["Mock USDT", "USDT", 6],
            });
            console.log("✅ MockUSDT verificado");

            await hre.run("verify:verify", {
                address: sanAddress,
                constructorArguments: [usdtAddress],
            });
            console.log("✅ SanDigital2026 verificado");
        } catch (error) {
            console.log("⚠️  Verificación falló (puede ser normal si ya está verificado):", error.message);
        }
    }

    // 7. Transferir ownership a multisig (si está configurado)
    if (process.env.MULTISIG_ADDRESS) {
        console.log("\n🔐 Transfiriendo ownership a multisig...");
        const tx = await sanDigital.transferOwnership(process.env.MULTISIG_ADDRESS);
        await tx.wait();
        console.log("✅ Ownership transferido a:", process.env.MULTISIG_ADDRESS);
    }

    // 8. Resumen
    console.log("=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETADO");
    console.log("=".repeat(60));
    console.log("\n📋 RESUMEN:");
    console.log("  MockUSDT:", usdtAddress);
    console.log("  SanDigital2026:", sanAddress);
    console.log("  Red:", hre.network.name);
    console.log("  Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
    console.log("\n🔧 CONFIGURACIÓN:");
    console.log("  Exit Threshold: 40 USDT");
    console.log("  Max Positions/User: 10");
    console.log("  Aporte: 20 USDT");
    console.log("\n💰 USDT Minteado:");
    console.log("  Cuenta principal: 1000 USDT");
    console.log("\n📝 PRÓXIMOS PASOS:");
    console.log("  1. Importar token USDT en MetaMask:", usdtAddress);
    console.log("  2. Iniciar frontend: npm run dev");
    console.log("  3. Conectar wallet y probar");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
