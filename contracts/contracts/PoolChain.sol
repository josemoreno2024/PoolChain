// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PoolChain
 * @notice Transparent blockchain lottery where everyone wins something
 * @dev Uses pull pattern for gas efficiency and safety
 */
contract PoolChain is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    IERC20 public immutable usdt;
    
    uint256 public constant TICKET_PRICE = 10_000000; // 10 USDT (6 decimals)
    uint256 public constant MIN_PARTICIPANTS = 50;
    
    // Prize distribution (percentages of prize pool after platform fee)
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
    uint256 public constant FIRST_PRIZE_PERCENT = 15;
    uint256 public constant SECOND_PRIZE_PERCENT = 10;
    uint256 public constant THIRD_PRIZE_PERCENT = 5;
    uint256 public constant BASE_RETURN_PERCENT = 65; // For non-winners
    
    // Lottery state
    uint256 public currentRound;
    uint256 public drawTime;
    uint256 public constant DRAW_DELAY = 1 hours;
    bool public salesClosed;
    bool public drawExecuted;
    
    address[] public participants;
    mapping(address => uint256) public ticketCount; // Tickets per address in current round
    mapping(address => uint256) public claimable; // Amount user can claim
    
    address public platformWallet;
    uint256 public platformFeesAccumulated;
    
    // ============ Events ============
    
    event TicketPurchased(address indexed user, uint256 round, uint256 timestamp);
    event SalesClosed(uint256 round, uint256 drawTime);
    event WinnersSelected(uint256 round, address[] winners, uint256[] prizes);
    event PrizeClaimed(address indexed user, uint256 amount);
    event DrawCancelled(uint256 round, string reason);
    event PlatformFeeWithdrawn(address indexed wallet, uint256 amount);
    
    // ============ Modifiers ============
    
    modifier notOwner() {
        require(msg.sender != owner(), "Owner cannot participate");
        _;
    }
    
    modifier salesOpen() {
        require(!salesClosed, "Sales are closed");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _usdt, address _platformWallet) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
        currentRound = 1;
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Buy a lottery ticket
     */
    function buyTicket() external notOwner salesOpen nonReentrant {
        usdt.safeTransferFrom(msg.sender, address(this), TICKET_PRICE);
        
        participants.push(msg.sender);
        ticketCount[msg.sender]++;
        
        emit TicketPurchased(msg.sender, currentRound, block.timestamp);
    }
    
    /**
     * @notice Close sales and schedule draw
     */
    function closeSales() external onlyOwner {
        require(!salesClosed, "Sales already closed");
        require(participants.length >= MIN_PARTICIPANTS, "Not enough participants");
        
        salesClosed = true;
        drawTime = block.timestamp + DRAW_DELAY;
        
        emit SalesClosed(currentRound, drawTime);
    }
    
    /**
     * @notice Execute draw (simplified without Chainlink VRF for now)
     * @dev In production, this would request randomness from Chainlink VRF
     */
    function executeDraw() external onlyOwner {
        require(salesClosed, "Sales not closed");
        require(block.timestamp >= drawTime, "Too early");
        require(!drawExecuted, "Draw already executed");
        
        drawExecuted = true;
        
        uint256 totalPool = participants.length * TICKET_PRICE;
        uint256 platformFee = totalPool * PLATFORM_FEE_PERCENT / 100;
        uint256 prizePool = totalPool - platformFee;
        
        platformFeesAccumulated += platformFee;
        
        // Simple pseudo-random for testing (REPLACE WITH CHAINLINK VRF)
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            participants.length
        )));
        
        _distributePrizes(prizePool, randomSeed);
    }
    
    /**
     * @notice Distribute prizes to winners and base return to others
     */
    function _distributePrizes(uint256 prizePool, uint256 randomSeed) internal {
        address[] memory winners = new address[](3);
        uint256[] memory prizes = new uint256[](3);
        
        // Select 3 unique winners
        winners[0] = participants[randomSeed % participants.length];
        winners[1] = participants[(randomSeed / 2) % participants.length];
        winners[2] = participants[(randomSeed / 3) % participants.length];
        
        // Calculate prizes
        prizes[0] = prizePool * FIRST_PRIZE_PERCENT / 100;
        prizes[1] = prizePool * SECOND_PRIZE_PERCENT / 100;
        prizes[2] = prizePool * THIRD_PRIZE_PERCENT / 100;
        
        // Assign prizes to winners
        for (uint i = 0; i < 3; i++) {
            claimable[winners[i]] += prizes[i];
        }
        
        // Calculate base return for non-winners
        uint256 baseReturnPool = prizePool * BASE_RETURN_PERCENT / 100;
        uint256 baseReturnPerPerson = baseReturnPool / participants.length;
        
        for (uint i = 0; i < participants.length; i++) {
            address participant = participants[i];
            // Only give base return if not a winner
            bool isWinner = false;
            for (uint j = 0; j < 3; j++) {
                if (participant == winners[j]) {
                    isWinner = true;
                    break;
                }
            }
            if (!isWinner) {
                claimable[participant] += baseReturnPerPerson;
            }
        }
        
        emit WinnersSelected(currentRound, winners, prizes);
    }
    
    /**
     * @notice Claim your prize (pull pattern)
     */
    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");
        
        claimable[msg.sender] = 0;
        usdt.safeTransfer(msg.sender, amount);
        
        emit PrizeClaimed(msg.sender, amount);
    }
    
    /**
     * @notice Cancel draw and enable refunds if minimum not reached
     */
    function cancelDraw() external onlyOwner {
        require(salesClosed, "Sales not closed");
        require(block.timestamp > drawTime + 24 hours, "Wait 24h after draw time");
        require(participants.length < MIN_PARTICIPANTS, "Enough participants");
        
        // Enable full refunds
        for (uint i = 0; i < participants.length; i++) {
            claimable[participants[i]] = TICKET_PRICE;
        }
        
        emit DrawCancelled(currentRound, "Minimum participants not reached");
        
        _resetRound();
    }
    
    /**
     * @notice Start new round
     */
    function startNewRound() external onlyOwner {
        require(drawExecuted, "Previous draw not executed");
        _resetRound();
    }
    
    /**
     * @notice Reset round state
     */
    function _resetRound() internal {
        // Clear participants
        for (uint i = 0; i < participants.length; i++) {
            ticketCount[participants[i]] = 0;
        }
        delete participants;
        
        // Reset state
        salesClosed = false;
        drawExecuted = false;
        currentRound++;
    }
    
    /**
     * @notice Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = platformFeesAccumulated;
        require(amount > 0, "No fees to withdraw");
        
        platformFeesAccumulated = 0;
        usdt.safeTransfer(platformWallet, amount);
        
        emit PlatformFeeWithdrawn(platformWallet, amount);
    }
    
    // ============ View Functions ============
    
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }
    
    function getCurrentPool() external view returns (uint256) {
        return participants.length * TICKET_PRICE;
    }
    
    function getClaimable(address user) external view returns (uint256) {
        return claimable[user];
    }
}
