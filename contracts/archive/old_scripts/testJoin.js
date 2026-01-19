const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Making First Join to SanDigital 4Funds...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Wallet:", deployer.address);

    // Contract addresses
    const mockUSDTAddress = "0x53F2dEc5b7a37617F43903411960F58166002136";
    const mainContractAddress = "0x3e7c089CE9c092b8DdB31F7a1b82B5606EE6Bdbb";

    // Get contracts
    const MockUSDT = await ethers.getContractAt("MockUSDT", mockUSDTAddress);
    const MainContract = await ethers.getContractAt("SanDigital_4Funds_Keeper", mainContractAddress);

    // Check balances before
    const usdtBalanceBefore = await MockUSDT.balanceOf(deployer.address);
    console.log("💰 Balance Before:", ethers.formatUnits(usdtBalanceBefore, 6), "mUSDT");

    // Check allowance
    const allowance = await MockUSDT.allowance(deployer.address, mainContractAddress);
    console.log("   Allowance:", ethers.formatUnits(allowance, 6), "mUSDT");

    if (allowance < ethers.parseUnits("10", 6)) {
        console.log("\n❌ ERROR: Need to approve contract first!");
        console.log("   Run: npx hardhat run scripts/approveContract.js --network opBNB");
        return;
    }

    // Join (contract automatically deducts 10 USDT)
    console.log("\n🎯 Joining (contract will deduct 10 mUSDT automatically)...");

    const tx = await MainContract.join();
    console.log("📤 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas Used:", receipt.gasUsed.toString());

    // Check balances after
    const usdtBalanceAfter = await MockUSDT.balanceOf(deployer.address);
    console.log("\n💰 Balance After:", ethers.formatUnits(usdtBalanceAfter, 6), "mUSDT");
    console.log("   Spent:", ethers.formatUnits(usdtBalanceBefore - usdtBalanceAfter, 6), "mUSDT");

    // Get position info
    const userPositions = await MainContract.getUserPositions(deployer.address);
    console.log("\n📊 Your Positions:", userPositions.length);

    if (userPositions.length > 0) {
        const positionId = userPositions[userPositions.length - 1];
        const position = await MainContract.positions(positionId);
        console.log("   Position ID:", positionId.toString());
        console.log("   Balance:", ethers.formatUnits(position.balance, 6), "mUSDT");
        console.log("   Active:", position.isActive);
    }

    // Get system metrics
    const metrics = await MainContract.getAdminMetrics();
    console.log("\n🌍 System State:");
    console.log("   Active Positions:", metrics[0].toString());
    console.log("   Keeper Fund:", ethers.formatUnits(metrics[6], 6), "mUSDT");

    console.log("\n🎉 Success! Your first position is active!");
    console.log("\n🔗 View on opBNBScan:");
    console.log("   https://opbnbscan.com/tx/" + tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
