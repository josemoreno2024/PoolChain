const { ethers } = require("hardhat");

async function main() {
    console.log("✅ Approving SanDigital 4Funds Contract...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Wallet:", deployer.address);

    // Contract addresses
    const mockUSDTAddress = "0x53F2dEc5b7a37617F43903411960F58166002136";
    const mainContractAddress = "0x3e7c089CE9c092b8DdB31F7a1b82B5606EE6Bdbb";

    // Get MockUSDT contract
    const MockUSDT = await ethers.getContractAt("MockUSDT", mockUSDTAddress);

    // Approve 1000 USDT (more than enough for testing)
    const approveAmount = ethers.parseUnits("1000", 6); // 1000 USDT with 6 decimals

    console.log("💰 Approving", ethers.formatUnits(approveAmount, 6), "mUSDT...");

    const tx = await MockUSDT.approve(mainContractAddress, approveAmount);
    console.log("📤 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas Used:", receipt.gasUsed.toString());

    // Verify allowance
    const allowance = await MockUSDT.allowance(deployer.address, mainContractAddress);
    console.log("\n✅ New Allowance:", ethers.formatUnits(allowance, 6), "mUSDT");

    console.log("\n🎯 Next Step:");
    console.log("   Run: npx hardhat run scripts/testJoin.js --network opBNB");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
