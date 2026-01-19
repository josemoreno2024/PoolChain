const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Desplegando en opBNB Mainnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

    // 1. Deploy MockUSDT
    console.log("1️⃣ Desplegando MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    const mockUSDTAddress = await mockUSDT.getAddress();
    console.log("✅ MockUSDT desplegado en:", mockUSDTAddress, "\n");

    // 2. Deploy SanDigital_4Funds_Keeper (primero, sin keeper)
    console.log("2️⃣ Desplegando SanDigital_4Funds_Keeper...");
    const SanDigital4FundsKeeper = await ethers.getContractFactory("SanDigital_4Funds_Keeper");
    // Usar deployer address como keeper temporal
    const main4Funds = await SanDigital4FundsKeeper.deploy(mockUSDTAddress, deployer.address);
    await main4Funds.waitForDeployment();
    const main4FundsAddress = await main4Funds.getAddress();
    console.log("✅ SanDigital_4Funds_Keeper desplegado en:", main4FundsAddress, "\n");

    // 3. Deploy KeeperContract (con main contract address)
    console.log("3️⃣ Desplegando KeeperContract...");
    const KeeperContract = await ethers.getContractFactory("KeeperContract");
    const keeper = await KeeperContract.deploy(main4FundsAddress);
    await keeper.waitForDeployment();
    const keeperAddress = await keeper.getAddress();
    console.log("✅ KeeperContract desplegado en:", keeperAddress, "\n");

    // 4. Configurar main contract con keeper address correcto
    console.log("4️⃣ Configurando keeper en main contract...");
    const tx = await main4Funds.setAuthorizedKeeper(keeperAddress);
    await tx.wait();
    console.log("✅ Keeper autorizado configurado\n");

    // 5. Mint initial USDT for testing
    console.log("5️⃣ Acuñando USDT inicial para testing...");
    const mintTx = await mockUSDT.mintUSDT(deployer.address, 1000); // 1000 USDT
    await mintTx.wait();
    console.log("✅ 1000 USDT acuñados para", deployer.address, "\n");

    // 6. Guardar addresses
    const addresses = {
        opBNB: {
            mockUSDT: mockUSDTAddress,
            keeperContract: keeperAddress,
            mainContract: main4FundsAddress,
            deployer: deployer.address
        }
    };

    fs.writeFileSync(
        './src/contracts/addresses.json',
        JSON.stringify(addresses, null, 2)
    );

    console.log("📄 Addresses guardados en src/contracts/addresses.json\n");

    // 7. Extraer ABIs
    console.log("6️⃣ Extrayendo ABIs...");

    const mockUSDTArtifact = await ethers.getContractFactory("MockUSDT");
    const keeperArtifact = await ethers.getContractFactory("KeeperContract");
    const main4FundsArtifact = await ethers.getContractFactory("SanDigital_4Funds_Keeper");

    fs.writeFileSync(
        './src/contracts/MockUSDTABI.json',
        JSON.stringify(mockUSDTArtifact.interface.formatJson(), null, 2)
    );

    fs.writeFileSync(
        './src/contracts/KeeperContractABI.json',
        JSON.stringify(keeperArtifact.interface.formatJson(), null, 2)
    );

    fs.writeFileSync(
        './src/contracts/SanDigital4FundsKeeperABI.json',
        JSON.stringify(main4FundsArtifact.interface.formatJson(), null, 2)
    );

    console.log("✅ ABIs extraídos\n");

    console.log("🎉 Deployment completado!\n");
    console.log("📋 Resumen:");
    console.log("   MockUSDT:", mockUSDTAddress);
    console.log("   KeeperContract:", keeperAddress);
    console.log("   Main Contract:", main4FundsAddress);
    console.log("\n💡 Próximos pasos:");
    console.log("   1. Verificar contratos en opBNBScan");
    console.log("   2. Configurar frontend con nuevas addresses");
    console.log("   3. Desplegar keeper bot en Railway");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
