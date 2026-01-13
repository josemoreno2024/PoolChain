const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Script para financiar las 22 wallets con ETH y USDT
 * 
 * Requisitos:
 * - Wallet principal con ETH en Sepolia
 * - Contrato MockUSDT desplegado
 * 
 * Uso:
 * npx hardhat run scripts/fundWallets.js --network sepolia
 */

async function main() {
    console.log('\n💰 Financiando Wallets de Prueba...\n');

    // Cargar wallets generadas
    const walletsPath = path.join(__dirname, 'wallets.json');
    if (!fs.existsSync(walletsPath)) {
        console.error('❌ Error: No se encontró wallets.json');
        console.log('   Ejecuta primero: npx hardhat run scripts/generateWallets.js');
        process.exit(1);
    }

    const wallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
    console.log(`📁 Cargadas ${wallets.length} wallets\n`);

    // Obtener signer (wallet principal)
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Wallet principal: ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💵 Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Verificar que hay suficiente ETH
    const ethPerWallet = ethers.parseEther('0.01'); // 0.01 ETH por wallet (suficiente para gas)
    const totalEthNeeded = ethPerWallet * BigInt(wallets.length);

    if (balance < totalEthNeeded) {
        console.error(`❌ Error: No hay suficiente ETH`);
        console.log(`   Necesitas: ${ethers.formatEther(totalEthNeeded)} ETH`);
        console.log(`   Tienes: ${ethers.formatEther(balance)} ETH`);
        process.exit(1);
    }

    // Conectar al contrato MockUSDT
    const USDT_ADDRESS = '0xB35b75a2392659701600a6e816C5DB00f09Ed6C7'; // MockUSDT en Sepolia
    const MockUSDT = await ethers.getContractFactory('MockERC20');
    const usdt = MockUSDT.attach(USDT_ADDRESS);

    console.log(`🪙 Contrato USDT: ${USDT_ADDRESS}\n`);

    // Financiar cada wallet
    console.log('🚀 Iniciando financiamiento...\n');

    for (const wallet of wallets) {
        console.log(`\n💼 Wallet ${wallet.id}: ${wallet.address}`);

        try {
            // 1. Enviar ETH para gas
            console.log('   📤 Enviando 0.01 ETH...');
            const ethTx = await deployer.sendTransaction({
                to: wallet.address,
                value: ethPerWallet
            });
            await ethTx.wait();
            console.log('   ✅ ETH enviado');

            // 2. Acuñar USDT
            console.log('   🪙 Acuñando 1000 USDT...');
            const usdtAmount = ethers.parseUnits('1000', 6); // 1000 USDT (6 decimales)
            const mintTx = await usdt.mint(wallet.address, usdtAmount);
            await mintTx.wait();
            console.log('   ✅ USDT acuñado');

            // Verificar balances
            const ethBalance = await ethers.provider.getBalance(wallet.address);
            const usdtBalance = await usdt.balanceOf(wallet.address);

            console.log(`   💰 Balance final:`);
            console.log(`      ETH: ${ethers.formatEther(ethBalance)}`);
            console.log(`      USDT: ${ethers.formatUnits(usdtBalance, 6)}`);

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
    }

    console.log('\n\n✅ FINANCIAMIENTO COMPLETADO!\n');
    console.log('📊 RESUMEN:');
    console.log(`   Wallets financiadas: ${wallets.length}`);
    console.log(`   ETH por wallet: 0.01 ETH`);
    console.log(`   USDT por wallet: 1000 USDT`);

    console.log('\n📌 PRÓXIMO PASO:');
    console.log('   Importa las wallets en MetaMask usando las private keys de wallets.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
