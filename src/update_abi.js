const fs = require('fs');
const path = require('path');

// Read the full artifact
const artifactPath = path.join(__dirname, '../contracts/artifacts/contracts/PoolChain_Hybrid_Auto.sol/PoolChain_Hybrid_Auto.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Extract only the ABI
const abi = { abi: artifact.abi };

// Write to frontend
const outputPath = path.join(__dirname, 'poolchain/contracts/PoolChainABI.json');
fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

console.log('✅ ABI updated successfully!');
console.log('📝 Output:', outputPath);
console.log('📊 Functions:', artifact.abi.filter(item => item.type === 'function').length);
console.log('📢 Events:', artifact.abi.filter(item => item.type === 'event').length);

// Check if triggerDraw exists
const hasTriggerDraw = artifact.abi.some(item => item.type === 'function' && item.name === 'triggerDraw');
console.log('🎯 triggerDraw function:', hasTriggerDraw ? '✅ Found' : '❌ Not found');
