const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Analyzing Your Transactions on opBNB Mainnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Your Wallet:", deployer.address);

    // Contract addresses
    const mainContractAddress = "0x3e7c089CE9c092b8DdB31F7a1b82B5606EE6Bdbb";
    const MainContract = await ethers.getContractAt("SanDigital_4Funds_Keeper", mainContractAddress);

    console.log("\n" + "=".repeat(80));
    console.log("📊 YOUR POSITIONS");
    console.log("=".repeat(80) + "\n");

    // Get all your positions
    const userPositions = await MainContract.getUserPositions(deployer.address);
    console.log(`Total Positions: ${userPositions.length}\n`);

    let totalBalance = 0n;

    for (let i = 0; i < userPositions.length; i++) {
        const posId = userPositions[i];
        const position = await MainContract.positions(posId);

        console.log(`Position #${i + 1} (ID: ${posId.toString()})`);
        console.log("─".repeat(80));
        console.log(`  Owner: ${position.owner}`);
        console.log(`  Balance: ${ethers.formatUnits(position.balance, 6)} mUSDT`);
        console.log(`  Active: ${position.isActive ? "✅ Yes" : "❌ No"}`);
        console.log(`  Has Exited: ${position.hasExited ? "Yes" : "No"}`);
        console.log(`  Index in Activos: ${position.indexInActivos.toString()}`);
        console.log("");

        totalBalance += position.balance;
    }

    console.log("─".repeat(80));
    console.log(`💰 Total Balance Across All Positions: ${ethers.formatUnits(totalBalance, 6)} mUSDT\n`);

    console.log("=".repeat(80));
    console.log("🌍 GLOBAL SYSTEM STATE");
    console.log("=".repeat(80) + "\n");

    // Get system metrics
    const metrics = await MainContract.getAdminMetrics();

    console.log(`Active Positions (Global): ${metrics[0].toString()}`);
    console.log(`Completed Cycles: ${metrics[1].toString()}`);
    console.log(`Total Deposited: ${ethers.formatUnits(metrics[2], 6)} mUSDT`);
    console.log(`Total Withdrawn: ${ethers.formatUnits(metrics[3], 6)} mUSDT`);
    console.log(`Global Distribution Pool: ${ethers.formatUnits(metrics[4], 6)} mUSDT`);
    console.log(`Operational Fund: ${ethers.formatUnits(metrics[5], 6)} mUSDT`);
    console.log(`Keeper Fund: ${ethers.formatUnits(metrics[6], 6)} mUSDT`);
    console.log(`Total User Balances: ${ethers.formatUnits(metrics[7], 6)} mUSDT`);

    console.log("\n" + "=".repeat(80));
    console.log("📈 FUND DISTRIBUTION ANALYSIS");
    console.log("=".repeat(80) + "\n");

    const totalDeposited = metrics[2];
    const totalUserBalances = metrics[7];
    const keeperFund = metrics[6];
    const operationalFund = metrics[5];
    const globalPool = metrics[4];

    console.log("Expected Distribution per Join (10 mUSDT):");
    console.log("  - Keeper Fund: 0.5 mUSDT (5%)");
    console.log("  - User Position: 9.5 mUSDT (95%)");
    console.log("");
    console.log("From User Position (9.5 mUSDT):");
    console.log("  - Turn Payment: 3.5 mUSDT (35%)");
    console.log("  - Global Distribution: 5.5 mUSDT (55%)");
    console.log("  - Operational Fund: 1.0 mUSDT (10%)");
    console.log("");

    console.log("Actual Distribution:");
    console.log(`  - Total Deposited: ${ethers.formatUnits(totalDeposited, 6)} mUSDT`);
    console.log(`  - Keeper Fund: ${ethers.formatUnits(keeperFund, 6)} mUSDT (${(Number(keeperFund) / Number(totalDeposited) * 100).toFixed(2)}%)`);
    console.log(`  - User Balances: ${ethers.formatUnits(totalUserBalances, 6)} mUSDT`);
    console.log(`  - Operational Fund: ${ethers.formatUnits(operationalFund, 6)} mUSDT`);
    console.log(`  - Global Pool: ${ethers.formatUnits(globalPool, 6)} mUSDT`);

    console.log("\n" + "=".repeat(80));
    console.log("🎯 NEXT STEPS");
    console.log("=".repeat(80) + "\n");

    console.log("1. Review the distribution percentages above");
    console.log("2. Check if they match the expected values");
    console.log("3. Verify each position balance is correct");
    console.log("4. Identify any discrepancies for adjustment");

    console.log("\n💡 To see transaction details on opBNBScan:");
    console.log(`   https://opbnbscan.com/address/${deployer.address}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
