// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PoolChain_Micro_Mock
 * @notice Mock version for testing WITHOUT Chainlink VRF
 * @dev Uses pseudo-random for testing - DO NOT USE IN PRODUCTION
 */
contract PoolChain_Micro_Mock is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant TICKET_PRICE = 2_000000; // 2 USDT (6 decimals)
    uint256 public constant MAX_PARTICIPANTS = 100;
    uint256 public constant GAS_FEE_PERCENT = 3; // 3% gas fee (covers VRF cost) 
    
    uint256 public constant GROUP_A_COUNT = 10;
    uint256 public constant GROUP_B_COUNT = 20;
    uint256 public constant GROUP_C_COUNT = 30;
    uint256 public constant GROUP_D_COUNT = 40;
    
    uint256 public constant GROUP_A_PERCENT = 30;
    uint256 public constant GROUP_B_PERCENT = 30;
    uint256 public constant GROUP_C_PERCENT = 20;
    uint256 public constant GROUP_D_PERCENT = 20;

    // ============ State Variables ============
    
    IERC20 public immutable usdt;
    address public platformWallet;
    
    uint256 public currentRound;
    address[] public participants;
    mapping(address => bool) public hasParticipated;
    mapping(address => uint256) public claimable;
    
    bool public poolFilled;
    bool public winnersSelected;
    
    address[] public groupA;
    address[] public groupB;
    address[] public groupC;
    address[] public groupD;

    // ============ Events ============
    
    event TicketPurchased(address indexed user, uint256 round, uint256 position, uint256 timestamp);
    event PoolFilled(uint256 round, uint256 totalParticipants, uint256 timestamp);
    event WinnersSelected(
        uint256 round,
        address[] groupA,
        address[] groupB,
        address[] groupC,
        address[] groupD,
        uint256 timestamp
    );
    event PrizeClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RoundReset(uint256 newRound, uint256 timestamp);

    // ============ Constructor ============
    
    constructor(
        address _usdt,
        address _platformWallet
    ) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
        currentRound = 1;
    }

    // ============ Main Functions ============
    
    function buyTicket() external nonReentrant {
        require(!poolFilled, "Pool is full");
        require(participants.length < MAX_PARTICIPANTS, "Max participants reached");
        require(!hasParticipated[msg.sender], "Already participated");
        
        usdt.safeTransferFrom(msg.sender, address(this), TICKET_PRICE);
        
        participants.push(msg.sender);
        hasParticipated[msg.sender] = true;
        
        emit TicketPurchased(msg.sender, currentRound, participants.length, block.timestamp);
        
        if (participants.length == MAX_PARTICIPANTS) {
            poolFilled = true;
            emit PoolFilled(currentRound, MAX_PARTICIPANTS, block.timestamp);
        }
    }
    
    /**
     * @notice Execute draw with pseudo-random (TESTING ONLY)
     */
    function executeDraw() external onlyOwner {
        require(poolFilled, "Pool not filled");
        require(!winnersSelected, "Winners already selected");
        
        // Generate pseudo-random seed (NOT SECURE - FOR TESTING ONLY)
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            participants.length,
            msg.sender
        )));
        
        _selectWinners(randomSeed);
        _distributePrizes();
    }
    
    function _selectWinners(uint256 randomSeed) internal {
        address[] memory availableParticipants = new address[](MAX_PARTICIPANTS);
        for (uint i = 0; i < MAX_PARTICIPANTS; i++) {
            availableParticipants[i] = participants[i];
        }
        
        uint256 remainingCount = MAX_PARTICIPANTS;
        
        // Select Group A
        for (uint i = 0; i < GROUP_A_COUNT; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encode(randomSeed, "A", i))) % remainingCount;
            groupA.push(availableParticipants[randomIndex]);
            availableParticipants[randomIndex] = availableParticipants[remainingCount - 1];
            remainingCount--;
        }
        
        // Select Group B
        for (uint i = 0; i < GROUP_B_COUNT; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encode(randomSeed, "B", i))) % remainingCount;
            groupB.push(availableParticipants[randomIndex]);
            availableParticipants[randomIndex] = availableParticipants[remainingCount - 1];
            remainingCount--;
        }
        
        // Select Group C
        for (uint i = 0; i < GROUP_C_COUNT; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encode(randomSeed, "C", i))) % remainingCount;
            groupC.push(availableParticipants[randomIndex]);
            availableParticipants[randomIndex] = availableParticipants[remainingCount - 1];
            remainingCount--;
        }
        
        // Remaining go to Group D
        for (uint i = 0; i < remainingCount; i++) {
            groupD.push(availableParticipants[i]);
        }
        
        winnersSelected = true;
        emit WinnersSelected(currentRound, groupA, groupB, groupC, groupD, block.timestamp);
    }
    
    function _distributePrizes() internal {
        uint256 totalPool = MAX_PARTICIPANTS * TICKET_PRICE;
        uint256 gasFee = (totalPool * GAS_FEE_PERCENT) / 100;
        uint256 netFund = totalPool - gasFee;
        
        usdt.safeTransfer(platformWallet, gasFee);
        
        uint256 groupATotal = (netFund * GROUP_A_PERCENT) / 100;
        uint256 groupBTotal = (netFund * GROUP_B_PERCENT) / 100;
        uint256 groupCTotal = (netFund * GROUP_C_PERCENT) / 100;
        uint256 groupDTotal = (netFund * GROUP_D_PERCENT) / 100;
        
        uint256 prizeA = groupATotal / GROUP_A_COUNT;
        uint256 prizeB = groupBTotal / GROUP_B_COUNT;
        uint256 prizeC = groupCTotal / GROUP_C_COUNT;
        uint256 prizeD = groupDTotal / GROUP_D_COUNT;
        
        for (uint i = 0; i < GROUP_A_COUNT; i++) {
            claimable[groupA[i]] = prizeA;
        }
        for (uint i = 0; i < GROUP_B_COUNT; i++) {
            claimable[groupB[i]] = prizeB;
        }
        for (uint i = 0; i < GROUP_C_COUNT; i++) {
            claimable[groupC[i]] = prizeC;
        }
        for (uint i = 0; i < GROUP_D_COUNT; i++) {
            claimable[groupD[i]] = prizeD;
        }
    }
    
    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");
        
        claimable[msg.sender] = 0;
        usdt.safeTransfer(msg.sender, amount);
        
        emit PrizeClaimed(msg.sender, amount, block.timestamp);
    }
    
    function resetRound() external onlyOwner {
        require(winnersSelected, "Winners not selected yet");
        
        for (uint i = 0; i < participants.length; i++) {
            hasParticipated[participants[i]] = false;
        }
        delete participants;
        delete groupA;
        delete groupB;
        delete groupC;
        delete groupD;
        
        poolFilled = false;
        winnersSelected = false;
        currentRound++;
        
        emit RoundReset(currentRound, block.timestamp);
    }

    // ============ View Functions ============
    
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }
    
    function getGroupAWinners() external view returns (address[] memory) {
        return groupA;
    }
    
    function getGroupBWinners() external view returns (address[] memory) {
        return groupB;
    }
    
    function getGroupCWinners() external view returns (address[] memory) {
        return groupC;
    }
    
    function getGroupDWinners() external view returns (address[] memory) {
        return groupD;
    }
    
    function getClaimable(address user) external view returns (uint256) {
        return claimable[user];
    }
    
    function getCurrentPool() external view returns (uint256) {
        return participants.length * TICKET_PRICE;
    }
    
    function isPoolFilled() external view returns (bool) {
        return poolFilled;
    }
    
    function areWinnersSelected() external view returns (bool) {
        return winnersSelected;
    }
    
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
    }
}
