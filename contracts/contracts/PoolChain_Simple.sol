// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PoolChain Simple - Sin VRF
 * @notice Sistema de lotería con aleatoriedad de blockchain
 * @dev Usa block.prevrandao para aleatoriedad (suficiente para pruebas)
 */
contract PoolChain_Simple is ReentrancyGuard {
    
    IERC20 public immutable usdt;
    address public immutable platformWallet;
    
    uint256 public constant TICKET_PRICE = 2 * 10**6; // 2 USDT (6 decimals)
    uint256 public constant MAX_PARTICIPANTS = 100;
    uint256 public constant GAS_FEE_PERCENT = 3;
    uint256 public constant MAX_TICKETS_PER_USER = 20;
    uint256 public constant MAX_TICKETS_PER_PURCHASE = 10;
    
    // Game state
    uint256 public currentRound = 1;
    uint256 public ticketsSold = 0;
    bool public poolFilled = false;
    bool public winnersSelected = false;
    uint256 public randomSeed = 0;
    
    mapping(uint256 => address) public positionToAddress;
    mapping(address => uint256[]) public userPositions;
    mapping(address => uint256) public userTicketCount;
    
    uint256[] public groupAWinners;
    uint256[] public groupBWinners;
    uint256[] public groupCWinners;
    uint256[] public groupDWinners;
    
    mapping(address => uint256) public claimable;

    // Events
    event TicketsPurchased(address indexed buyer, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round);
    event PoolFilled(uint256 indexed round, uint256 totalTickets, uint256 timestamp);
    event DrawExecuted(uint256 indexed round, uint256 randomSeed);
    event WinnersSelected(uint256 indexed round);
    event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round);

    constructor(address _usdt, address _platformWallet) {
        require(_usdt != address(0), "Invalid USDT");
        require(_platformWallet != address(0), "Invalid wallet");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
    }

    function buySpecificPositions(uint256[] calldata positions) external nonReentrant {
        require(positions.length > 0 && positions.length <= MAX_TICKETS_PER_PURCHASE, "1-10 positions");
        require(!poolFilled, "Pool full");
        require(userTicketCount[msg.sender] + positions.length <= MAX_TICKETS_PER_USER, "Max 20 tickets");

        for (uint256 i = 0; i < positions.length; i++) {
            uint256 pos = positions[i];
            require(pos >= 1 && pos <= MAX_PARTICIPANTS, "Invalid position");
            require(positionToAddress[pos] == address(0), "Position taken");
            
            positionToAddress[pos] = msg.sender;
            userPositions[msg.sender].push(pos);
        }

        userTicketCount[msg.sender] += positions.length;
        ticketsSold += positions.length;

        uint256 totalCost = TICKET_PRICE * positions.length;
        require(usdt.transferFrom(msg.sender, address(this), totalCost), "Transfer failed");

        emit TicketsPurchased(msg.sender, positions, positions.length, totalCost, currentRound);

        // Auto-execute draw when pool fills
        if (ticketsSold >= MAX_PARTICIPANTS) {
            poolFilled = true;
            emit PoolFilled(currentRound, ticketsSold, block.timestamp);
            _executeDraw();
        }
    }

    function _executeDraw() private {
        require(poolFilled, "Pool not full");
        require(!winnersSelected, "Already drawn");
        
        // Generate random seed from multiple sources
        randomSeed = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            block.timestamp,
            block.number,
            msg.sender,
            ticketsSold,
            address(this).balance
        )));
        
        emit DrawExecuted(currentRound, randomSeed);
        
        // Shuffle positions
        uint256[] memory shuffled = new uint256[](MAX_PARTICIPANTS);
        for (uint256 i = 0; i < MAX_PARTICIPANTS; i++) {
            shuffled[i] = i + 1;
        }
        
        for (uint256 i = MAX_PARTICIPANTS - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(randomSeed, i))) % (i + 1);
            (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
        }
        
        // Assign winners
        for (uint256 i = 0; i < 10; i++) {
            groupAWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 291) / 100; // 5.82 USDT
            }
        }
        
        for (uint256 i = 10; i < 30; i++) {
            groupBWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 1455) / 1000; // 2.91 USDT
            }
        }
        
        for (uint256 i = 30; i < 60; i++) {
            groupCWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 645) / 1000; // 1.29 USDT
            }
        }
        
        for (uint256 i = 60; i < 100; i++) {
            groupDWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 485) / 1000; // 0.97 USDT
            }
        }

        // Transfer platform fee
        uint256 totalPool = TICKET_PRICE * MAX_PARTICIPANTS;
        uint256 gasFee = (totalPool * GAS_FEE_PERCENT) / 100;
        require(usdt.transfer(platformWallet, gasFee), "Fee transfer failed");

        winnersSelected = true;
        emit WinnersSelected(currentRound);
        
        _resetRound();
    }

    function claimPrize() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");
        
        claimable[msg.sender] = 0;
        require(usdt.transfer(msg.sender, amount), "Claim failed");
        
        emit PrizeClaimed(msg.sender, amount, currentRound - 1);
    }

    function _resetRound() private {
        currentRound++;
        ticketsSold = 0;
        poolFilled = false;
        winnersSelected = false;
        randomSeed = 0;

        delete groupAWinners;
        delete groupBWinners;
        delete groupCWinners;
        delete groupDWinners;
    }

    // View functions
    function getGroupAWinners() external view returns (uint256[] memory) { return groupAWinners; }
    function getGroupBWinners() external view returns (uint256[] memory) { return groupBWinners; }
    function getGroupCWinners() external view returns (uint256[] memory) { return groupCWinners; }
    function getGroupDWinners() external view returns (uint256[] memory) { return groupDWinners; }
    function getUserPositions(address user) external view returns (uint256[] memory) { return userPositions[user]; }
}
