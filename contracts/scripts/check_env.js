require("dotenv").config();

console.log("🔍 Checking .env configuration...\n");
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ Found" : "❌ Not found");
console.log("USDT_ADDRESS:", process.env.USDT_ADDRESS ? "✅ Found" : "❌ Not found");
console.log("\nPRIVATE_KEY value:", process.env.PRIVATE_KEY);
console.log("USDT_ADDRESS value:", process.env.USDT_ADDRESS);
