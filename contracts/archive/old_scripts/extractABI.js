const fs = require('fs');
const path = require('path');

// Leer el artifact del nuevo contrato 4Funds
const artifactPath = path.join(__dirname, 'artifacts/contracts/SanDigital_4Funds.sol/SanDigital_4Funds.json');
const outputPath = path.join(__dirname, '../src/contracts/SanDigital2026ABI.json');

console.log('📖 Leyendo artifact de:', artifactPath);

const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Extraer solo el ABI
const abi = artifact.abi;

console.log(`✅ ABI extraído: ${abi.length} items`);

// Guardar solo el ABI
fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

console.log('💾 ABI guardado en:', outputPath);
console.log('✅ Listo!');
