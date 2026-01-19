const fs = require('fs');

// Extract SanDigital2026 ABI
const sanDigitalData = JSON.parse(fs.readFileSync('./SanDigital2026.json', 'utf8'));
fs.writeFileSync('./SanDigital2026ABI.json', JSON.stringify(sanDigitalData.abi, null, 2));

// Extract MockUSDT ABI
const mockUSDTData = JSON.parse(fs.readFileSync('./MockUSDT.json', 'utf8'));
fs.writeFileSync('./MockUSDTABI.json', JSON.stringify(mockUSDTData.abi, null, 2));

console.log('✅ ABI files created successfully');
