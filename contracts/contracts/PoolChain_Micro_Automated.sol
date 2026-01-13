// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

/**
 * @title PoolChain_Micro_Automated
 * @notice Sistema de sorteo 100% automático con Chainlink VRF + Automation
 * @dev Versión mainnet-ready sin owner, totalmente descentralizado
 */
contract PoolChain_Micro_Automated is 
    ReentrancyGuard, 
    VRFConsumerBaseV2,
    AutomationCompatibleInterface 
{
    using SafeERC20 for IERC20;

    // ============ Estructuras ============
    
    struct Ticket {
        uint256 ticketId;
        address owner;
        uint256 purchaseTime;
        uint256 roundNumber;
    }

    // ============ Constantes ============
    
    uint256 public constant TICKET_PRICE = 2_000000; // 2 USDT (6 decimals)
    uint256 public constant MAX_PARTICIPANTS = 100;
    uint256 public constant GAS_FEE_PERCENT = 3; // 3% gas fee
    uint256 public constant MAX_TICKETS_PER_PURCHASE = 10;
    
    uint256 public constant GROUP_A_COUNT = 10;
    uint256 public constant GROUP_B_COUNT = 20;
    uint256 public constant GROUP_C_COUNT = 30;
    uint256 public constant GROUP_D_COUNT = 40;
    
    uint256 public constant GROUP_A_PERCENT = 30;
    uint256 public constant GROUP_B_PERCENT = 30;
    uint256 public constant GROUP_C_PERCENT = 20;
    uint256 public constant GROUP_D_PERCENT = 20;

    // ============ Chainlink VRF ============
    
    VRFCoordinatorV2Interface public immutable COORDINATOR;
    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public constant callbackGasLimit = 500000;
    uint16 public constant requestConfirmations = 3;
    uint32 public constant numWords = 1;

    // ============ State Variables ============
    
    IERC20 public immutable usdt;
    address public immutable platformWallet;
    
    uint256 public currentRound = 1;
    uint256 public nextTicketId = 1;
    
    bool public poolFilled;
    bool public vrfRequested;
    bool public winnersSelected;
    uint256 public randomWord;
    
    Ticket[] public tickets;
    address[] public groupAWinners;
    address[] public groupBWinners;
    address[] public groupCWinners;
    address[] public groupDWinners;
    
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => bool) public isWinningTicket;
    mapping(uint256 => uint8) public ticketWinnerGroup;
    mapping(address => uint256) public claimable;

    // ============ Events ============
    
    event TicketPurchased(
        address indexed buyer,
        uint256 indexed ticketId,
        uint256 indexed round,
        uint256 timestamp
    );
    
    event BulkTicketsPurchased(
        address indexed buyer,
        uint256[] ticketIds,
        uint256 quantity,
        uint256 totalCost,
        uint256 round
    );
    
    event PoolFilled(uint256 indexed round, uint256 totalTickets, uint256 timestamp);
    
    event VRFRequested(uint256 indexed round, uint256 requestId);
    
    event VRFReceived(uint256 indexed round, uint256 randomWord);
    
    event WinnerSelected(
        uint256 indexed ticketId,
        address indexed winner,
        uint8 group,
        uint256 prize,
        uint256 round
    );
    
    event DrawExecuted(uint256 indexed round, uint256 timestamp);
    
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
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_vrfCoordinator != address(0), "Invalid VRF coordinator");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    // ============ Main Functions ============
    
    /**
     * @notice Comprar tickets (1-10 por transacción)
     */
    function buyTicket(uint256 quantity) external nonReentrant {
        require(!poolFilled, "Pool is full");
        require(!vrfRequested, "Draw in progress");
        require(quantity > 0 && quantity <= MAX_TICKETS_PER_PURCHASE, "Must buy 1-10 tickets");
        require(tickets.length + quantity <= MAX_PARTICIPANTS, "Exceeds max participants");
        
        uint256 totalCost = TICKET_PRICE * quantity;
        usdt.safeTransferFrom(msg.sender, address(this), totalCost);
        
        uint256[] memory newTicketIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 ticketId = nextTicketId++;
            
            tickets.push(Ticket({
                ticketId: ticketId,
                owner: msg.sender,
                purchaseTime: block.timestamp,
                roundNumber: currentRound
            }));
            
            userTickets[msg.sender].push(ticketId);
            newTicketIds[i] = ticketId;
            
            emit TicketPurchased(msg.sender, ticketId, currentRound, block.timestamp);
        }
        
        emit BulkTicketsPurchased(msg.sender, newTicketIds, quantity, totalCost, currentRound);
        
        // Si pool se llena, solicitar VRF automáticamente
        if (tickets.length == MAX_PARTICIPANTS) {
            poolFilled = true;
            emit PoolFilled(currentRound, MAX_PARTICIPANTS, block.timestamp);
            _requestRandomWords();
        }
    }
    
    /**
     * @notice Solicitar número aleatorio de Chainlink VRF
     */
    function _requestRandomWords() private {
        require(poolFilled, "Pool not filled");
        require(!vrfRequested, "VRF already requested");
        
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            uint64(subscriptionId),
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        vrfRequested = true;
        emit VRFRequested(currentRound, requestId);
    }
    
    /**
     * @notice Callback de Chainlink VRF (llamado automáticamente)
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        require(vrfRequested, "VRF not requested");
        require(!winnersSelected, "Winners already selected");
        
        randomWord = randomWords[0];
        emit VRFReceived(currentRound, randomWord);
    }
    
    /**
     * @notice Chainlink Automation: Verificar si se debe ejecutar sorteo
     */
    function checkUpkeep(bytes calldata /* checkData */)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (poolFilled && 
                       vrfRequested && 
                       randomWord != 0 && 
                       !winnersSelected);
    }
    
    /**
     * @notice Chainlink Automation: Ejecutar sorteo automáticamente
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        require(poolFilled, "Pool not filled");
        require(vrfRequested, "VRF not requested");
        require(randomWord != 0, "Random word not received");
        require(!winnersSelected, "Winners already selected");
        require(tickets.length == MAX_PARTICIPANTS, "Invalid ticket count");
        
        _executeDraw();
    }
    
    /**
     * @notice Ejecutar sorteo y asignar ganadores
     */
    function _executeDraw() private {
        // Generar índices aleatorios usando VRF
        uint256[] memory randomIndices = _generateRandomIndices();
        
        // Calcular premios
        uint256 totalPool = TICKET_PRICE * MAX_PARTICIPANTS;
        uint256 gasFee = (totalPool * GAS_FEE_PERCENT) / 100;
        uint256 netPool = totalPool - gasFee;
        
        uint256 groupAPrize = (netPool * GROUP_A_PERCENT) / 100 / GROUP_A_COUNT;
        uint256 groupBPrize = (netPool * GROUP_B_PERCENT) / 100 / GROUP_B_COUNT;
        uint256 groupCPrize = (netPool * GROUP_C_PERCENT) / 100 / GROUP_C_COUNT;
        uint256 groupDPrize = (netPool * GROUP_D_PERCENT) / 100 / GROUP_D_COUNT;
        
        // Asignar ganadores
        uint256 idx = 0;
        
        for (uint256 i = 0; i < GROUP_A_COUNT; i++) {
            _assignWinner(randomIndices[idx], 1, groupAPrize);
            idx++;
        }
        
        for (uint256 i = 0; i < GROUP_B_COUNT; i++) {
            _assignWinner(randomIndices[idx], 2, groupBPrize);
            idx++;
        }
        
        for (uint256 i = 0; i < GROUP_C_COUNT; i++) {
            _assignWinner(randomIndices[idx], 3, groupCPrize);
            idx++;
        }
        
        for (uint256 i = 0; i < GROUP_D_COUNT; i++) {
            _assignWinner(randomIndices[idx], 4, groupDPrize);
            idx++;
        }
        
        // Transferir gas fee
        usdt.safeTransfer(platformWallet, gasFee);
        
        winnersSelected = true;
        emit DrawExecuted(currentRound, block.timestamp);
        
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

    // ============ Internal Functions ============
    
    function _assignWinner(uint256 ticketIndex, uint8 group, uint256 prize) private {
        Ticket memory ticket = tickets[ticketIndex];
        address winner = ticket.owner;
        uint256 ticketId = ticket.ticketId;
        
        isWinningTicket[ticketId] = true;
        ticketWinnerGroup[ticketId] = group;
        
        if (group == 1) groupAWinners.push(winner);
        else if (group == 2) groupBWinners.push(winner);
        else if (group == 3) groupCWinners.push(winner);
        else if (group == 4) groupDWinners.push(winner);
        
        claimable[winner] += prize;
        
        emit WinnerSelected(ticketId, winner, group, prize, currentRound);
    }
    
    function _generateRandomIndices() private view returns (uint256[] memory) {
        uint256[] memory indices = new uint256[](MAX_PARTICIPANTS);
        
        for (uint256 i = 0; i < MAX_PARTICIPANTS; i++) {
            indices[i] = i;
        }
        
        // Fisher-Yates shuffle con VRF
        for (uint256 i = MAX_PARTICIPANTS - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(randomWord, i))) % (i + 1);
            (indices[i], indices[j]) = (indices[j], indices[i]);
        }
        
        return indices;
    }
    
    function _resetRound() private {
        delete tickets;
        delete groupAWinners;
        delete groupBWinners;
        delete groupCWinners;
        delete groupDWinners;
        
        poolFilled = false;
        vrfRequested = false;
        winnersSelected = false;
        randomWord = 0;
        
        currentRound++;
        
        emit RoundReset(currentRound, block.timestamp);
    }

    // ============ View Functions ============
    
    function getTicketCount() external view returns (uint256) {
        return tickets.length;
    }
    
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }
    
    function getUserTicketCount(address user) external view returns (uint256) {
        return userTickets[user].length;
    }
    
    function getAllTickets() external view returns (Ticket[] memory) {
        return tickets;
    }
    
    function getGroupAWinners() external view returns (address[] memory) {
        return groupAWinners;
    }
    
    function getGroupBWinners() external view returns (address[] memory) {
        return groupBWinners;
    }
    
    function getGroupCWinners() external view returns (address[] memory) {
        return groupCWinners;
    }
    
    function getGroupDWinners() external view returns (address[] memory) {
        return groupDWinners;
    }
    
    function getClaimable(address user) external view returns (uint256) {
        return claimable[user];
    }
    
    function getCurrentPool() external view returns (uint256) {
        return TICKET_PRICE * tickets.length;
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
}
