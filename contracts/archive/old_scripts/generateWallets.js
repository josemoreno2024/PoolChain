const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Script para generar 22 wallets de prueba (Wallet 11-32)
 * 
 * Uso:
 * npx hardhat run scripts/generateWallets.js --network sepolia
 */

async function main() {
    console.log('\n🔑 Generando 22 Wallets de Prueba (11-32)...\n');

    const wallets = [];

    // Generar wallets 11-32
    for (let i = 11; i <= 32; i++) {
        const wallet = ethers.Wallet.createRandom();

        wallets.push({
            id: i,
            address: wallet.address,
            privateKey: wallet.privateKey
        });

        console.log(`✅ Wallet ${i}: ${wallet.address}`);
    }

    // Guardar en archivo JSON
    const outputPath = path.join(__dirname, 'wallets.json');
    fs.writeFileSync(outputPath, JSON.stringify(wallets, null, 2));

    console.log(`\n📁 Wallets guardadas en: ${outputPath}`);
    console.log('\n⚠️  IMPORTANTE: Este archivo contiene claves privadas. NO lo compartas ni lo subas a Git.');

    // Crear archivo .gitignore si no existe
    const gitignorePath = path.join(__dirname, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, 'wallets.json\n*.private.json\n');
        console.log('✅ Creado .gitignore para proteger las claves privadas');
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN:');
    console.log(`   Total de wallets generadas: ${wallets.length}`);
    console.log(`   Rango: Wallet 11 - Wallet 32`);

    // Mostrar addresses para copiar
    console.log('\n📋 ADDRESSES (para importar en MetaMask):');
    wallets.forEach(w => {
        console.log(`Wallet ${w.id}: ${w.address}`);
    });

    console.log('\n✅ Generación completada!');
    console.log('\n📌 PRÓXIMO PASO:');
    console.log('   Ejecuta: npx hardhat run scripts/fundWallets.js --network sepolia');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
