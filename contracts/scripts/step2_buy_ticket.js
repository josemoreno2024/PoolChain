const hre = require("hardhat");

async function main() {
    console.log("🎫 Step 2: Buying ticket\n");

    const [signer] = await hre.ethers.getSigners();

    const POOLCHAIN_ADDRESS = "0x3e7c089CE9c092b8DdB31F7a1b82B5606EE6Bdbb";

    // Get PoolChain contract
    const poolchain = await hre.ethers.getContractAt(
        ["function buyTicket()",
            "function getParticipantCount() view returns (uint256)",
            "function getCurrentPool() view returns (uint256)",
            "function getParticipants() view returns (address[])",
            "function isPoolFilled() view returns (bool)"],
        POOLCHAIN_ADDRESS
    );

    // Check status before
    const countBefore = await poolchain.getParticipantCount();
    const poolBefore = await poolchain.getCurrentPool();
    console.log("📊 Before:");
    console.log("   Participants:", countBefore.toString(), "/ 100");
    console.log("   Pool:", hre.ethers.formatUnits(poolBefore, 6), "USDT");

    // Buy ticket
    console.log("\n⏳ Buying ticket (2 USDT)...");
    const tx = await poolchain.buyTicket();
    console.log("📝 Transaction sent:", tx.hash);

    await tx.wait();
    console.log("✅ Ticket purchased!");

    // Check status after
    const countAfter = await poolchain.getParticipantCount();
    const poolAfter = await poolchain.getCurrentPool();
    const poolFilled = await poolchain.isPoolFilled();

    console.log("\n📊 After:");
    console.log("   Participants:", countAfter.toString(), "/ 100");
    console.log("   Pool:", hre.ethers.formatUnits(poolAfter, 6), "USDT");
    console.log("   Pool Filled:", poolFilled);

    // Get participants
    const participants = await poolchain.getParticipants();
    console.log("\n👥 Participants:");
    participants.forEach((addr, index) => {
        console.log(`   ${index + 1}. ${addr}`);
    });

    console.log("\n✅ Step 2 completed!");
    console.log("\n📝 Next: Need", 100 - Number(countAfter), "more participants to fill the pool");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:");
        console.error(error);
        process.exit(1);
    });
