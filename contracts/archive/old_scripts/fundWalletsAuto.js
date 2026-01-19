const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Script para financiar wallets con el ETH disponible
 * Calcula automáticamente cuántas wallets puede financiar
 */

async function main() {
    console.log('\n💰 Financiando Wallets con Balance Disponible...\n');

    // Cargar wallets generadas
    const walletsPath = path.join(__dirname, 'wallets.json');
    if (!fs.existsSync(walletsPath)) {
        console.error('❌ Error: No se encontró wallets.json');
        process.exit(1);
    }

    const allWallets = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));

    // Obtener signer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Wallet principal: ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💵 Balance disponible: ${ethers.formatEther(balance)} ETH\n`);

    // Calcular cuántas wallets podemos financiar
    const ethPerWallet = ethers.parseEther('0.01');
    const gasBuffer = ethers.parseEther('0.005'); // Buffer para gas de transacciones
    const availableForWallets = balance - gasBuffer;

    const maxWallets = Number(availableForWallets / ethPerWallet);
    const walletsToFund = Math.min(maxWallets, allWallets.length);

    console.log(`📊 CÁLCULO:`);
    console.log(`   Balance disponible: ${ethers.formatEther(balance)} ETH`);
    console.log(`   ETH por wallet: 0.01 ETH`);
    console.log(`   Buffer para gas: 0.005 ETH`);
    console.log(`   Wallets que puedes financiar: ${walletsToFund} de ${allWallets.length}\n`);

    if (walletsToFund === 0) {
        console.error('❌ No hay suficiente ETH para financiar ninguna wallet');
        console.log('   Consigue más ETH de un faucet de Sepolia');
        process.exit(1);
    }

    const wallets = allWallets.slice(0, walletsToFund);

    // Conectar al contrato MockUSDT
    const USDT_ADDRESS = '0xB35b75a2392659701600a6e816C5DB00f09Ed6C7';
    const MockUSDT = await ethers.getContractFactory('MockERC20');
    const usdt = MockUSDT.attach(USDT_ADDRESS);

    console.log(`🚀 Financiando ${wallets.length} wallets...\n`);

    let funded = 0;
    for (const wallet of wallets) {
        console.log(`\n💼 Wallet ${wallet.id}: ${wallet.address}`);

        try {
            // 1. Enviar ETH
            console.log('   📤 Enviando 0.01 ETH...');
            const ethTx = await deployer.sendTransaction({
                to: wallet.address,
                value: ethPerWallet,
                gasLimit: 21000n
            });
            await ethTx.wait();
            console.log('   ✅ ETH enviado');

            // 2. Acuñar USDT
            console.log('   🪙 Acuñando 1000 USDT...');
            const usdtAmount = ethers.parseUnits('1000', 6);
            const mintTx = await usdt.mint(wallet.address, usdtAmount);
            await mintTx.wait();
            console.log('   ✅ USDT acuñado');

            funded++;

            // Verificar balances
            const ethBalance = await ethers.provider.getBalance(wallet.address);
            const usdtBalance = await usdt.balanceOf(wallet.address);

            console.log(`   💰 Balance final:`);
            console.log(`      ETH: ${ethers.formatEther(ethBalance)}`);
            console.log(`      USDT: ${ethers.formatUnits(usdtBalance, 6)}`);

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            break; // Detener si hay error
        }
    }

    console.log('\n\n✅ FINANCIAMIENTO COMPLETADO!\n');
    console.log('📊 RESUMEN:');
    console.log(`   Wallets financiadas: ${funded} de ${allWallets.length}`);
    console.log(`   ETH por wallet: 0.01 ETH`);
    console.log(`   USDT por wallet: 1000 USDT`);

    if (funded < allWallets.length) {
        console.log(`\n⚠️  PENDIENTES: ${allWallets.length - funded} wallets sin financiar`);
        console.log('   Consigue más ETH y vuelve a ejecutar este script');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
