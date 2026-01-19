const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing SanDigital 4Funds on opBNB Mainnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Wallet:", deployer.address);

    // Contract addresses
    const mockUSDTAddress = "0x53F2dEc5b7a37617F43903411960F58166002136";
    const mainContractAddress = "0x3e7c089CE9c092b8DdB31F7a1b82B5606EE6Bdbb";

    // Get contracts
    const MockUSDT = await ethers.getContractAt("MockUSDT", mockUSDTAddress);
    const MainContract = await ethers.getContractAt("SanDigital_4Funds_Keeper", mainContractAddress);

    console.log("\n💰 Checking Balances...");

    // Check USDT balance
    const usdtBalance = await MockUSDT.balanceOf(deployer.address);
    console.log("   MockUSDT Balance:", ethers.formatUnits(usdtBalance, 6), "mUSDT");

    // Check allowance
    const allowance = await MockUSDT.allowance(deployer.address, mainContractAddress);
    console.log("   Allowance:", ethers.formatUnits(allowance, 6), "mUSDT");

    // Check BNB balance
    const bnbBalance = await ethers.provider.getBalance(deployer.address);
    console.log("   BNB Balance:", ethers.formatEther(bnbBalance), "BNB");

    console.log("\n📊 Contract State...");

    // Get user positions
    const userPositions = await MainContract.getUserPositions(deployer.address);
    console.log("   Your Positions:", userPositions.length);

    // Get system metrics
    const metrics = await MainContract.getAdminMetrics();
    console.log("   Active Positions (Global):", metrics[0].toString());
    console.log("   Completed Cycles:", metrics[1].toString());
    console.log("   Total Deposited:", ethers.formatUnits(metrics[2], 6), "mUSDT");
    console.log("   Total Withdrawn:", ethers.formatUnits(metrics[3], 6), "mUSDT");
    console.log("   Keeper Fund:", ethers.formatUnits(metrics[6], 6), "mUSDT");

    console.log("\n🎯 Next Steps:");

    if (allowance < ethers.parseUnits("10", 6)) {
        console.log("   1. ❌ Need to approve contract first");
        console.log("   Run: npx hardhat run scripts/approveContract.js --network opBNB");
    } else {
        console.log("   1. ✅ Contract approved");
    }

    if (userPositions.length === 0) {
        console.log("   2. ⏳ Ready to make first join");
        console.log("   Run: npx hardhat run scripts/testJoin.js --network opBNB");
    } else {
        console.log("   2. ✅ You have", userPositions.length, "position(s)");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
