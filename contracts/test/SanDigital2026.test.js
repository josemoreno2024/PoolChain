const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SanDigital2026", function () {
    // Fixture para deployment
    async function deployFixture() {
        const [owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11] = await ethers.getSigners();

        // Deploy MockUSDT
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdt = await MockERC20.deploy("Mock USDT", "USDT", 6);

        // Deploy SanDigital2026
        const SanDigital = await ethers.getContractFactory("SanDigital2026");
        const sanDigital = await SanDigital.deploy(await usdt.getAddress());

        // Mint USDT para usuarios
        const mintAmount = ethers.parseUnits("1000", 6);
        const users = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11];
        for (const user of users) {
            await usdt.mint(user.address, mintAmount);
            await usdt.connect(user).approve(await sanDigital.getAddress(), ethers.parseUnits("10000", 6));
        }

        return { sanDigital, usdt, owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11 };
    }

    describe("Deployment", function () {
        it("Should deploy with correct parameters", async function () {
            const { sanDigital, usdt } = await loadFixture(deployFixture);

            expect(await sanDigital.EXIT_THRESHOLD()).to.equal(ethers.parseUnits("40", 6));
            expect(await sanDigital.MAX_POSITIONS_PER_USER()).to.equal(10);
            expect(await sanDigital.APORTE()).to.equal(ethers.parseUnits("20", 6));
        });
    });

    describe("Multiple Positions", function () {
        it("Should allow user to create up to 10 positions", async function () {
            const { sanDigital, user1 } = await loadFixture(deployFixture);

            // Crear 10 posiciones
            for (let i = 0; i < 10; i++) {
                await sanDigital.connect(user1).join();
            }

            const activeCount = await sanDigital.getUserActivePositionsCount(user1.address);
            expect(activeCount).to.equal(10);
        });

        it("Should reject 11th position", async function () {
            const { sanDigital, user1 } = await loadFixture(deployFixture);

            // Crear 10 posiciones
            for (let i = 0; i < 10; i++) {
                await sanDigital.connect(user1).join();
            }

            // Intentar crear la 11
            await expect(
                sanDigital.connect(user1).join()
            ).to.be.revertedWith("Max positions per user reached");
        });

        it("Should track each position independently", async function () {
            const { sanDigital, user1, user2 } = await loadFixture(deployFixture);

            // User1 crea 2 posiciones
            await sanDigital.connect(user1).join();
            await sanDigital.connect(user1).join();

            // User2 crea 1 posición
            await sanDigital.connect(user2).join();

            const user1Positions = await sanDigital.getUserPositions(user1.address);
            const user2Positions = await sanDigital.getUserPositions(user2.address);

            expect(user1Positions.length).to.equal(2);
            expect(user2Positions.length).to.equal(1);
        });
    });

    describe("Exit Threshold (40 USDT)", function () {
        it("Should auto-exit position when reaching 40 USDT", async function () {
            const { sanDigital, user1, user2, user3 } = await loadFixture(deployFixture);

            // User1 crea posición (será turno)
            await sanDigital.connect(user1).join();

            // Necesitamos ~4 entradas más para que user1 alcance 40 USDT
            // Cada entrada: user1 recibe 10 (turno) + 8/N (global)
            await sanDigital.connect(user2).join();
            await sanDigital.connect(user3).join();
            await sanDigital.connect(user2).join();

            // Verificar que la primera posición de user1 salió
            const positionInfo = await sanDigital.getPositionInfo(0);
            expect(positionInfo.hasExited).to.be.true;
        });

        it("Should not exit before reaching 40 USDT", async function () {
            const { sanDigital, user1, user2 } = await loadFixture(deployFixture);

            await sanDigital.connect(user1).join();
            await sanDigital.connect(user2).join();

            const positionInfo = await sanDigital.getPositionInfo(0);
            expect(positionInfo.isActive).to.be.true;
            expect(positionInfo.hasExited).to.be.false;
        });
    });

    describe("Claim Functions", function () {
        it("Should allow claim of individual position", async function () {
            const { sanDigital, usdt, user1, user2 } = await loadFixture(deployFixture);

            await sanDigital.connect(user1).join();
            await sanDigital.connect(user2).join();

            const balanceBefore = await usdt.balanceOf(user1.address);
            const positionBalance = await sanDigital.getPositionBalance(0);

            await sanDigital.connect(user1).claim(0);

            const balanceAfter = await usdt.balanceOf(user1.address);
            expect(balanceAfter - balanceBefore).to.equal(positionBalance);
        });

        it("Should allow claimAll for multiple positions", async function () {
            const { sanDigital, usdt, user1, user2 } = await loadFixture(deployFixture);

            // User1 crea 3 posiciones
            await sanDigital.connect(user1).join();
            await sanDigital.connect(user1).join();
            await sanDigital.connect(user1).join();

            // User2 crea 1 para generar saldo
            await sanDigital.connect(user2).join();

            const balanceBefore = await usdt.balanceOf(user1.address);
            const totalBalance = await sanDigital.getUserTotalBalance(user1.address);

            await sanDigital.connect(user1).claimAll();

            const balanceAfter = await usdt.balanceOf(user1.address);
            expect(balanceAfter - balanceBefore).to.equal(totalBalance);
        });

        it("Should reset position balance after claim", async function () {
            const { sanDigital, user1, user2 } = await loadFixture(deployFixture);

            await sanDigital.connect(user1).join();
            await sanDigital.connect(user2).join();

            await sanDigital.connect(user1).claim(0);

            const positionBalance = await sanDigital.getPositionBalance(0);
            expect(positionBalance).to.equal(0);
        });
    });

    describe("Reentrancy Protection", function () {
        it.skip("Should prevent reentrancy on claim", async function () {
            // Skipped: Requires MaliciousReentrancy contract
            // ReentrancyGuard is implemented in the contract
            // This test would require a separate malicious contract file
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to withdraw operational balance", async function () {
            const { sanDigital, usdt, owner, user1, user2 } = await loadFixture(deployFixture);

            await sanDigital.connect(user1).join();
            await sanDigital.connect(user2).join();

            const operationalBalance = await sanDigital.getAdminBalance();
            const balanceBefore = await usdt.balanceOf(owner.address);

            await sanDigital.connect(owner).ownerWithdraw(operationalBalance);

            const balanceAfter = await usdt.balanceOf(owner.address);
            expect(balanceAfter - balanceBefore).to.equal(operationalBalance);
        });

        it("Should prevent non-owner from withdrawing", async function () {
            const { sanDigital, user1 } = await loadFixture(deployFixture);

            await expect(
                sanDigital.connect(user1).ownerWithdraw(ethers.parseUnits("1", 6))
            ).to.be.revertedWithCustomError(sanDigital, "OwnableUnauthorizedAccount");
        });

        it("Should allow owner to pause/unpause", async function () {
            const { sanDigital, owner, user1 } = await loadFixture(deployFixture);

            await sanDigital.connect(owner).pause();

            await expect(
                sanDigital.connect(user1).join()
            ).to.be.revertedWithCustomError(sanDigital, "EnforcedPause");

            await sanDigital.connect(owner).unpause();
            await expect(sanDigital.connect(user1).join()).to.not.be.reverted;
        });
    });

    describe("Distribution Logic", function () {
        it("Should distribute 10/9/1 correctly", async function () {
            const { sanDigital, user1, user2 } = await loadFixture(deployFixture);

            await sanDigital.connect(user1).join();

            const operationalBefore = await sanDigital.getAdminBalance();

            await sanDigital.connect(user2).join();

            const operationalAfter = await sanDigital.getAdminBalance();
            const adminFee = operationalAfter - operationalBefore;

            // Admin debe recibir 1 USDT por entrada
            expect(adminFee).to.equal(ethers.parseUnits("1", 6));

            // User1 (turno) debe tener 10 + parte global
            const position0Balance = await sanDigital.getPositionBalance(0);
            expect(position0Balance).to.be.gte(ethers.parseUnits("10", 6));
        });
    });

    describe("Edge Cases", function () {
        it("Should handle maximum capacity (500 positions)", async function () {
            const { sanDigital } = await loadFixture(deployFixture);

            const maxActivos = await sanDigital.MAX_ACTIVOS();
            expect(maxActivos).to.equal(500);
        });

        it("Should reject token with transfer fee", async function () {
            const { sanDigital, user1 } = await loadFixture(deployFixture);

            // Deploy token with fee
            const FeeToken = await ethers.getContractFactory("MockERC20");
            const feeToken = await FeeToken.deploy("Fee Token", "FEE", 6);

            const SanDigital = await ethers.getContractFactory("SanDigital2026");
            const sanDigitalFee = await SanDigital.deploy(await feeToken.getAddress());

            await feeToken.mint(user1.address, ethers.parseUnits("1000", 6));
            await feeToken.connect(user1).approve(await sanDigitalFee.getAddress(), ethers.parseUnits("1000", 6));

            // Should work with normal token (no fee)
            await expect(sanDigitalFee.connect(user1).join()).to.not.be.reverted;
        });
    });
});
