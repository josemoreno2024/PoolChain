const hre = require("hardhat");

async function main() {
    console.log("🪙 Minting mUSDT on opBNB Testnet...\n");

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log("📝 Minting to address:", signer.address);

    // mUSDT contract address on opBNB Testnet
    const MUSDT_ADDRESS = "0x53F2dEc5b7a37617F43903411960F58166002136";

    // Amount to mint (1000 USDT with 6 decimals)
    const AMOUNT = 1000_000000; // 1000 USDT

    // Get contract instance
    const mUSDT = await hre.ethers.getContractAt("IERC20", MUSDT_ADDRESS);

    // Check current balance
    const balanceBefore = await mUSDT.balanceOf(signer.address);
    console.log("💰 Current balance:", hre.ethers.formatUnits(balanceBefore, 6), "mUSDT");

    // Note: Most test USDT contracts have a public mint function
    // If this contract has a mint function, we can call it
    // Otherwise, we need to use a faucet or the owner needs to send us tokens

    console.log("\n⚠️ Note: This mUSDT contract may not have a public mint function.");
    console.log("If minting fails, you'll need to:");
    console.log("1. Use a faucet if available");
    console.log("2. Contact the contract owner to mint tokens");
    console.log("3. Or deploy your own MockUSDT contract with mint function");

    // Try to call mint if it exists (this will fail if the function doesn't exist)
    try {
        console.log("\n⏳ Attempting to mint", hre.ethers.formatUnits(AMOUNT, 6), "mUSDT...");

        // Try different mint function signatures
        const mintTx = await mUSDT.mint(signer.address, AMOUNT);
        await mintTx.wait();

        const balanceAfter = await mUSDT.balanceOf(signer.address);
        console.log("✅ Minting successful!");
        console.log("💰 New balance:", hre.ethers.formatUnits(balanceAfter, 6), "mUSDT");
        console.log("📈 Minted:", hre.ethers.formatUnits(balanceAfter - balanceBefore, 6), "mUSDT");
    } catch (error) {
        console.log("\n❌ Minting failed:", error.message);
        console.log("\nThis contract doesn't have a public mint function.");
        console.log("Let's deploy our own MockUSDT contract instead.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:");
        console.error(error);
        process.exit(1);
    });
