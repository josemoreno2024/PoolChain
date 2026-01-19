// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
/**
 * @title PoolChain_Hybrid_Auto  
 * @notice Sistema de lotería 100% automático con selección de posiciones
 * @dev Combina lo mejor de ambos mundos:
 *      - Usuarios eligen posiciones específicas (1-100)
 *      - Sorteo completamente automático ejecutado por VRF callback
 *      - Nadie puede manipular el sorteo ni los números ganadores
 *      - NO requiere Chainlink Automation ni verificación en BSCScan
 */
contract PoolChain_Hybrid_Auto is 
    ReentrancyGuard, 
    VRFConsumerBaseV2Plus 
{
    using SafeERC20 for IERC20;

    // ============ Estructuras ============
    
    struct Ticket {
        uint256 position;           // Posición elegida (1-100)
        address owner;              // Dueño del ticket
        uint256 purchaseTime;       // Timestamp de compra
        uint256 roundNumber;        // Número de ronda
    }

    // ============ Constantes ============
    
    uint256 public constant TICKET_PRICE = 2_000000; // 2 USDT (6 decimals)
    uint256 public constant MAX_PARTICIPANTS = 100;
    uint256 public constant GAS_FEE_PERCENT = 3; // 3% gas fee
    uint256 public constant MAX_TICKETS_PER_PURCHASE = 10; // Máximo por compra
    uint256 public constant MAX_TICKETS_PER_USER_PER_ROUND = 20; // Máximo por usuario por ronda
    uint256 public constant MAX_PURCHASES_PER_BLOCK = 1; // Anti-bot
    
    uint256 public constant GROUP_A_COUNT = 10;
    uint256 public constant GROUP_B_COUNT = 20;
    uint256 public constant GROUP_C_COUNT = 30;
    uint256 public constant GROUP_D_COUNT = 40;
    
    uint256 public constant GROUP_A_PERCENT = 30;
    uint256 public constant GROUP_B_PERCENT = 30;
    uint256 public constant GROUP_C_PERCENT = 20;
    uint256 public constant GROUP_D_PERCENT = 20;

    // ============ Chainlink VRF v2.5 ============
    
    IVRFCoordinatorV2Plus public immutable COORDINATOR;
    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public constant callbackGasLimit = 500000;
    uint16 public constant requestConfirmations = 3;
    uint32 public constant numWords = 1;

    // ============ State Variables ============
    
    IERC20 public immutable usdt;
    address public immutable platformWallet;
    
    uint256 public currentRound = 1;
    uint256 public ticketsSold;
    
    bool public poolFilled;
    bool public vrfRequested;
    bool public winnersSelected;
    uint256 public randomWord;
    
    Ticket[] public allTickets;
    mapping(uint256 => bool) public isPositionTaken; // position => taken
    mapping(address => uint256[]) public userPositions; // user => positions owned
    mapping(address => uint256) public userTicketCount; // user => count in current round
    mapping(address => uint256) public lastPurchaseBlock; // Anti-bot
    
    uint256[] public groupAWinners; // Winning positions
    uint256[] public groupBWinners;
    uint256[] public groupCWinners;
    uint256[] public groupDWinners;
    
    mapping(address => uint256) public claimable;

    // ============ Events ============
    
    event TicketsPurchased(
        address indexed buyer,
        uint256[] positions,
        uint256 quantity,
        uint256 totalCost,
        uint256 indexed round
    );
    
    event PoolFilled(uint256 indexed round, uint256 totalTickets, uint256 timestamp);
    
    event VRFRequested(uint256 indexed round, uint256 requestId);
    
    event VRFReceived(uint256 indexed round, uint256 randomWord);
    
    event WinnersSelected(
        uint256 indexed round,
        uint256[] groupA,
        uint256[] groupB,
        uint256[] groupC,
        uint256[] groupD
    );
    
    event PrizeClaimed(
        address indexed winner,
        uint256 amount,
        uint256 round,
        uint256 timestamp
    );
    
    event RoundReset(uint256 indexed newRound, uint256 timestamp);

    // ============ Constructor ============
    
    constructor(
        address _usdt,
        address _platformWallet,
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_vrfCoordinator != address(0), "Invalid VRF coordinator");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
        COORDINATOR = IVRFCoordinatorV2Plus(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    // ============ Main Functions ============
    
    /**
     * @notice Comprar tickets en posiciones específicas elegidas por el usuario
     * @param positions Array de posiciones a comprar (1-100)
     */
    function buySpecificPositions(uint256[] calldata positions) external nonReentrant {
        require(!poolFilled, "Pool is full");
        require(!vrfRequested, "Draw in progress");
        require(positions.length > 0 && positions.length <= MAX_TICKETS_PER_PURCHASE, 
                "Must buy 1-10 tickets");
        require(ticketsSold + positions.length <= MAX_PARTICIPANTS, "Exceeds max participants");
        
        // Anti-bot: Max 1 purchase per block
        require(block.number > lastPurchaseBlock[msg.sender], "Max purchases per block reached");
        lastPurchaseBlock[msg.sender] = block.number;
        
        // Check user limit per round
        require(userTicketCount[msg.sender] + positions.length <= MAX_TICKETS_PER_USER_PER_ROUND,
                "Exceeds max 20 tickets per user");
        
        // Validate and reserve positions
        for (uint256 i = 0; i < positions.length; i++) {
            uint256 pos = positions[i];
            require(pos >= 1 && pos <= MAX_PARTICIPANTS, "Invalid position");
            require(!isPositionTaken[pos], "Position already taken");
            
            isPositionTaken[pos] = true;
            userPositions[msg.sender].push(pos);
            
            allTickets.push(Ticket({
                position: pos,
                owner: msg.sender,
                purchaseTime: block.timestamp,
                roundNumber: currentRound
            }));
        }
        
        userTicketCount[msg.sender] += positions.length;
        ticketsSold += positions.length;
        
        // Transfer USDT
        uint256 totalCost = TICKET_PRICE * positions.length;
        usdt.safeTransferFrom(msg.sender, address(this), totalCost);
        
        emit TicketsPurchased(msg.sender, positions, positions.length, totalCost, currentRound);
        
        // Si pool se llena, solicitar VRF automáticamente
        if (ticketsSold == MAX_PARTICIPANTS) {
            poolFilled = true;
            emit PoolFilled(currentRound, MAX_PARTICIPANTS, block.timestamp);
            _requestRandomWords();
        }
    }
    

    
    /**
     * @notice Solicitar número aleatorio de Chainlink VRF (automático al llenarse el pool)
     */
    function _requestRandomWords() private {
        require(poolFilled, "Pool not filled");
        require(!vrfRequested, "VRF already requested");
        
        uint256 requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );
        
        vrfRequested = true;
        emit VRFRequested(currentRound, requestId);
    }
    
    /**
     * @notice Callback de Chainlink VRF - EJECUTA SORTEO AUTOMÁTICAMENTE
     * @dev Este callback se ejecuta cuando VRF responde
     *      Ejecuta el sorteo inmediatamente sin necesidad de Chainlink Automation
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
        require(vrfRequested, "VRF not requested");
        require(!winnersSelected, "Winners already selected");
        require(ticketsSold == MAX_PARTICIPANTS, "Invalid ticket count");
        
        randomWord = randomWords[0];
        emit VRFReceived(currentRound, randomWord);
        
        // EJECUTAR SORTEO AUTOMÁTICAMENTE
        _executeDraw();
    }
    

    
    /**
     * @notice Ejecutar sorteo y asignar ganadores
     */
    function _executeDraw() private {
        // Generate shuffled positions using VRF
        uint256[] memory shuffledPositions = _generateShuffledPositions();
        
        // Calculate prizes
        uint256 totalPool = TICKET_PRICE * MAX_PARTICIPANTS;
        uint256 gasFee = (totalPool * GAS_FEE_PERCENT) / 100;
        uint256 netPool = totalPool - gasFee;
        
        uint256 groupAPrize = (netPool * GROUP_A_PERCENT) / 100 / GROUP_A_COUNT;
        uint256 groupBPrize = (netPool * GROUP_B_PERCENT) / 100 / GROUP_B_COUNT;
        uint256 groupCPrize = (netPool * GROUP_C_PERCENT) / 100 / GROUP_C_COUNT;
        uint256 groupDPrize = (netPool * GROUP_D_PERCENT) / 100 / GROUP_D_COUNT;
        
        // Assign winners
        uint256 idx = 0;
        
        // Group A
        for (uint256 i = 0; i < GROUP_A_COUNT; i++) {
            uint256 winningPosition = shuffledPositions[idx];
            groupAWinners.push(winningPosition);
            address winner = _getPositionOwner(winningPosition);
            claimable[winner] += groupAPrize;
            idx++;
        }
        
        // Group B
        for (uint256 i = 0; i < GROUP_B_COUNT; i++) {
            uint256 winningPosition = shuffledPositions[idx];
            groupBWinners.push(winningPosition);
            address winner = _getPositionOwner(winningPosition);
            claimable[winner] += groupBPrize;
            idx++;
        }
        
        // Group C
        for (uint256 i = 0; i < GROUP_C_COUNT; i++) {
            uint256 winningPosition = shuffledPositions[idx];
            groupCWinners.push(winningPosition);
            address winner = _getPositionOwner(winningPosition);
            claimable[winner] += groupCPrize;
            idx++;
        }
        
        // Group D
        for (uint256 i = 0; i < GROUP_D_COUNT; i++) {
            uint256 winningPosition = shuffledPositions[idx];
            groupDWinners.push(winningPosition);
            address winner = _getPositionOwner(winningPosition);
            claimable[winner] += groupDPrize;
            idx++;
        }
        
        // Transfer gas fee to platform
        usdt.safeTransfer(platformWallet, gasFee);
        
        winnersSelected = true;
        emit WinnersSelected(currentRound, groupAWinners, groupBWinners, groupCWinners, groupDWinners);
        
        // Auto-reset para siguiente ronda
        _resetRound();
    }
    
    /**
     * @notice Reclamar premio
     */
    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "No claimable amount");
        
        claimable[msg.sender] = 0;
        usdt.safeTransfer(msg.sender, amount);
        
        emit PrizeClaimed(msg.sender, amount, currentRound - 1, block.timestamp);
    }
    
    /**
     * @notice Resetear ronda (automático después de sorteo)
     */
    function _resetRound() private {
        // Clear state
        delete allTickets;
        delete groupAWinners;
        delete groupBWinners;
        delete groupCWinners;
        delete groupDWinners;
        
        poolFilled = false;
        vrfRequested = false;
        winnersSelected = false;
        randomWord = 0;
        ticketsSold = 0;
        
        currentRound++;
        
        emit RoundReset(currentRound, block.timestamp);
    }

    // ============ Internal Functions ============
    
    function _getPositionOwner(uint256 position) private view returns (address) {
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (allTickets[i].position == position) {
                return allTickets[i].owner;
            }
        }
        revert("Position not found");
    }
    
    function _generateShuffledPositions() private view returns (uint256[] memory) {
        uint256[] memory positions = new uint256[](MAX_PARTICIPANTS);
        
        // Create array [1, 2, 3, ..., 100]
        for (uint256 i = 0; i < MAX_PARTICIPANTS; i++) {
            positions[i] = i + 1;
        }
        
        // Fisher-Yates shuffle using VRF random word
        for (uint256 i = MAX_PARTICIPANTS - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(randomWord, i))) % (i + 1);
            (positions[i], positions[j]) = (positions[j], positions[i]);
        }
        
        return positions;
    }

    // ============ View Functions ============
    
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }
    
    function getUserTicketCount(address user) external view returns (uint256) {
        return userTicketCount[user];
    }
    
    function getAllTickets() external view returns (Ticket[] memory) {
        return allTickets;
    }
    
    function getAvailablePositions() external view returns (uint256[] memory) {
        uint256 availableCount = MAX_PARTICIPANTS - ticketsSold;
        uint256[] memory available = new uint256[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= MAX_PARTICIPANTS; i++) {
            if (!isPositionTaken[i]) {
                available[index] = i;
                index++;
            }
        }
        
        return available;
    }
    
    function getGroupAWinners() external view returns (uint256[] memory) {
        return groupAWinners;
    }
    
    function getGroupBWinners() external view returns (uint256[] memory) {
        return groupBWinners;
    }
    
    function getGroupCWinners() external view returns (uint256[] memory) {
        return groupCWinners;
    }
    
    function getGroupDWinners() external view returns (uint256[] memory) {
        return groupDWinners;
    }
    
    function getClaimable(address user) external view returns (uint256) {
        return claimable[user];
    }
    
    function getCurrentPool() external view returns (uint256) {
        return TICKET_PRICE * ticketsSold;
    }
    
    function isPoolFilled() external view returns (bool) {
        return poolFilled;
    }
    
    function areWinnersSelected() external view returns (bool) {
        return winnersSelected;
    }
    
    function isVRFRequested() external view returns (bool) {
        return vrfRequested;
    }
    
    function getRandomWord() external view returns (uint256) {
        return randomWord;
    }
}
