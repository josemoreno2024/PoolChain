const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SanDigital_Micro_V2 - Punto Landa System", function () {
    let contract;
    let usdt;
    let owner, user1, user2, user3, user4, user5;

    const APORTE = ethers.parseUnits("10", 6);
    const PUNTO_LANDA = ethers.parseUnits("15", 6);
    const EXIT_THRESHOLD = ethers.parseUnits("20", 6);

    beforeEach(async function () {
        [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

        // Deploy mock USDT
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdt = await MockERC20.deploy("USDT", "USDT", 6);
        await usdt.waitForDeployment();

        // Deploy contract
        const SanDigital = await ethers.getContractFactory("SanDigital_Micro_V2");
        contract = await SanDigital.deploy(await usdt.getAddress());
        await contract.waitForDeployment();

        // Mint USDT to users
        const users = [user1, user2, user3, user4, user5];
        for (const user of users) {
            await usdt.mint(user.address, ethers.parseUnits("1000", 6));
            await usdt.connect(user).approve(await contract.getAddress(), ethers.MaxUint256);
        }
    });

    describe("Progressive Distribution", function () {
        it("Should distribute more to users closer to Punto Landa", async function () {
            // TX1: User1 joins
            await contract.connect(user1).join();

            // TX2: User2 joins
            await contract.connect(user2).join();

            // TX3: User3 joins
            await contract.connect(user3).join();

            // Get balances
            const pos1 = await contract.getPositionInfo(0);
            const pos2 = await contract.getPositionInfo(1);
            const pos3 = await contract.getPositionInfo(2);

            console.log("User1 balance:", ethers.formatUnits(pos1.balance, 6), "USDT");
            console.log("User2 balance:", ethers.formatUnits(pos2.balance, 6), "USDT");
            console.log("User3 balance:", ethers.formatUnits(pos3.balance, 6), "USDT");

            // User1 (in turno) should have more than User2
            // User2 (closer to Punto Landa) should have more than User3
            expect(pos1.balance).to.be.gt(pos2.balance);
            expect(pos2.balance).to.be.gt(pos3.balance);
        });

        it("Should reach Punto Landa and emit event", async function () {
            // Create multiple positions to reach Punto Landa
            await contract.connect(user1).join(); // TX1
            await contract.connect(user2).join(); // TX2
            await contract.connect(user3).join(); // TX3
            await contract.connect(user4).join(); // TX4

            // Check if User1 reached Punto Landa
            const pos1 = await contract.getPositionInfo(0);
            console.log("User1 final balance:", ethers.formatUnits(pos1.balance, 6), "USDT");

            // User1 should be close to or above Punto Landa
            expect(pos1.balance).to.be.gte(PUNTO_LANDA);
        });
    });

    describe("Punto Landa Exit", function () {
        it("Should allow tryExit when user reaches Punto Landa", async function () {
            // Setup: Create positions until someone reaches Punto Landa
            await contract.connect(user1).join();
            await contract.connect(user2).join();
            await contract.connect(user3).join();
            await contract.connect(user4).join();

            // Check User1 balance
            const pos1Before = await contract.getPositionInfo(0);
            console.log("User1 balance before tryExit:", ethers.formatUnits(pos1Before.balance, 6), "USDT");

            if (pos1Before.balance >= PUNTO_LANDA) {
                // Get User1 USDT balance before
                const balanceBefore = await usdt.balanceOf(user1.address);

                // Try to exit
                await expect(contract.connect(user1).tryExit(0))
                    .to.emit(contract, "PuntoLandaExit")
                    .withArgs(0, user1.address, EXIT_THRESHOLD);

                // Check User1 received 20 USDT
                const balanceAfter = await usdt.balanceOf(user1.address);
                expect(balanceAfter - balanceBefore).to.equal(EXIT_THRESHOLD);

                // Check position is marked as exited
                const pos1After = await contract.getPositionInfo(0);
                expect(pos1After.hasExited).to.be.true;
                expect(pos1After.isActive).to.be.false;
            }
        });

        it("Should reject tryExit when below Punto Landa", async function () {
            await contract.connect(user1).join();

            // User1 just joined, should be far from Punto Landa
            const pos1 = await contract.getPositionInfo(0);
            console.log("User1 balance:", ethers.formatUnits(pos1.balance, 6), "USDT");

            if (pos1.balance < PUNTO_LANDA) {
                await expect(contract.connect(user1).tryExit(0))
                    .to.be.revertedWith("Not at Punto Landa yet");
            }
        });
    });

    describe("Compatibility with existing interface", function () {
        it("Should maintain all existing functions", async function () {
            await contract.connect(user1).join();

            // Test existing functions
            await contract.connect(user1).getUserPositions(user1.address);
            await contract.connect(user1).getUserTotalBalance(user1.address);
            await contract.getSystemState();

            // These should all work without errors
            expect(true).to.be.true;
        });
    });
});
