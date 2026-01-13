const hre = require("hardhat");

async function main() {
    console.log("✅ Step 1: Approving mUSDT for PoolChain\n");

    const [signer] = await hre.ethers.getSigners();

    const POOLCHAIN_ADDRESS = "0xFA6605Ef085418334D1Bd31448a5Cb32fca03C8D0";
    const MUSDT_ADDRESS = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD";

    // Get mUSDT contract
    const mUSDT = await hre.ethers.getContractAt(
        ["function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function balanceOf(address account) view returns (uint256)"],
        MUSDT_ADDRESS
    );

    // Check balance
    const balance = await mUSDT.balanceOf(signer.address);
    console.log("💰 Your mUSDT balance:", hre.ethers.formatUnits(balance, 6), "mUSDT");

    // Approve 100 USDT (enough for 50 tickets)
    const approveAmount = hre.ethers.parseUnits("100", 6);
    console.log("\n⏳ Approving", hre.ethers.formatUnits(approveAmount, 6), "mUSDT...");

    const tx = await mUSDT.approve(POOLCHAIN_ADDRESS, approveAmount);
    console.log("📝 Transaction sent:", tx.hash);

    await tx.wait();
    console.log("✅ Approval confirmed!");

    // Check allowance
    const allowance = await mUSDT.allowance(signer.address, POOLCHAIN_ADDRESS);
    console.log("✅ Allowance:", hre.ethers.formatUnits(allowance, 6), "mUSDT");

    console.log("\n✅ Step 1 completed! Now run step 2 to buy a ticket.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:");
        console.error(error);
        process.exit(1);
    });
