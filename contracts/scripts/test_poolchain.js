const hre = require("hardhat");

async function main() {
    console.log("🧪 Testing PoolChain_Micro_Mock...\n");

    const [signer] = await hre.ethers.getSigners();
    console.log("👤 Testing with account:", signer.address);

    // Contract addresses
    const POOLCHAIN_ADDRESS = "0xc2DFbbc30E80BACE9bb159605CfF8146E81faDA98";
    const MUSDT_ADDRESS = "0x2F767F0Bb9d715CF5356308e30b79B27D09a96DD";

    // Get contract instances
    const poolchain = await hre.ethers.getContractAt("PoolChain_Micro_Mock", POOLCHAIN_ADDRESS);
    const mUSDT = await hre.ethers.getContractAt("MockUSDT", MUSDT_ADDRESS);

    // Check balances
    console.log("\n📊 Current Status:");
    const usdtBalance = await mUSDT.balanceOf(signer.address);
    const bnbBalance = await hre.ethers.provider.getBalance(signer.address);
    console.log("   mUSDT Balance:", hre.ethers.formatUnits(usdtBalance, 6), "mUSDT");
    console.log("   BNB Balance:", hre.ethers.formatEther(bnbBalance), "BNB");

    // Check pool status
    const participantCount = await poolchain.getParticipantCount();
    const currentPool = await poolchain.getCurrentPool();
    const poolFilled = await poolchain.isPoolFilled();
    const winnersSelected = await poolchain.areWinnersSelected();

    console.log("\n🎰 Pool Status:");
    console.log("   Participants:", participantCount.toString(), "/ 100");
    console.log("   Current Pool:", hre.ethers.formatUnits(currentPool, 6), "USDT");
    console.log("   Pool Filled:", poolFilled);
    console.log("   Winners Selected:", winnersSelected);

    // Step 1: Approve USDT
    console.log("\n📝 Step 1: Approving mUSDT...");
    const approveAmount = 10_000000; // 10 USDT (enough for 5 tickets)
    const approveTx = await mUSDT.approve(POOLCHAIN_ADDRESS, approveAmount);
    await approveTx.wait();
    console.log("✅ Approved", hre.ethers.formatUnits(approveAmount, 6), "mUSDT");

    // Check allowance
    const allowance = await mUSDT.allowance(signer.address, POOLCHAIN_ADDRESS);
    console.log("   Allowance:", hre.ethers.formatUnits(allowance, 6), "mUSDT");

    // Step 2: Buy ticket
    console.log("\n🎫 Step 2: Buying ticket...");
    const buyTx = await poolchain.buyTicket();
    const receipt = await buyTx.wait();
    console.log("✅ Ticket purchased!");
    console.log("   Transaction:", receipt.hash);

    // Check updated status
    const newParticipantCount = await poolchain.getParticipantCount();
    const newCurrentPool = await poolchain.getCurrentPool();
    const newUsdtBalance = await mUSDT.balanceOf(signer.address);

    console.log("\n📊 Updated Status:");
    console.log("   Participants:", newParticipantCount.toString(), "/ 100");
    console.log("   Current Pool:", hre.ethers.formatUnits(newCurrentPool, 6), "USDT");
    console.log("   Your mUSDT Balance:", hre.ethers.formatUnits(newUsdtBalance, 6), "mUSDT");
    console.log("   Spent:", hre.ethers.formatUnits(usdtBalance - newUsdtBalance, 6), "mUSDT");

    // Get participants list
    const participants = await poolchain.getParticipants();
    console.log("\n👥 Participants:");
    participants.forEach((addr, index) => {
        console.log(`   ${index + 1}. ${addr}`);
    });

    console.log("\n✅ Test completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("   - Buy more tickets to fill the pool (need 99 more)");
    console.log("   - Or use multiple wallets to simulate different users");
    console.log("   - When pool is full, call executeDraw()");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:");
        console.error(error);
        process.exit(1);
    });
