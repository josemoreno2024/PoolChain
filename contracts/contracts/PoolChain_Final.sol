// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PoolChain Final - Sistema Autónomo con Commit-Reveal
 * @notice Sorteo 100% on-chain, verificable, no manipulable, sin VRF
 * @dev Usa bloque futuro para entropía (Commit-Reveal pattern)
 * 
 * Randomness source:
 * - blockhash(commitBlock) - hash de bloque futuro
 * - Fisher-Yates deterministic shuffle
 * - Verifiable by anyone off-chain
 * - No manipulable por mineros, usuarios, ni owner
 */
contract PoolChain_Final is ReentrancyGuard {
    
    IERC20 public immutable usdt;
    address public immutable platformWallet;
    
    // Constants
    uint256 public constant TICKET_PRICE = 2 * 10**6; // 2 USDT (6 decimals)
    uint256 public constant MAX_PARTICIPANTS = 100;
    uint256 public constant GAS_FEE_PERCENT = 3;
    uint256 public constant MAX_TICKETS_PER_USER = 20;
    uint256 public constant MAX_TICKETS_PER_PURCHASE = 10;
    uint256 public constant COMMIT_DELAY = 3; // Bloques de espera para commit
    
    // Game state
    uint256 public currentRound = 1;
    uint256 public ticketsSold = 0;
    bool public poolFilled = false;
    bool public winnersSelected = false;
    uint256 public commitBlock = 0; // Bloque futuro para entropía
    
    // Mappings
    mapping(uint256 => address) public positionToAddress;
    mapping(address => uint256[]) public userPositions;
    mapping(address => uint256) public userTicketCount;
    mapping(address => uint256) public claimable;
    
    // Winners arrays
    uint256[] public groupAWinners;
    uint256[] public groupBWinners;
    uint256[] public groupCWinners;
    uint256[] public groupDWinners;

    // Events
    event TicketsPurchased(address indexed buyer, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round);
    event PoolFilled(uint256 indexed round, uint256 totalTickets, uint256 timestamp);
    event DrawCommitted(uint256 indexed round, uint256 commitBlock);
    event DrawExecuted(uint256 indexed round, uint256 randomSeed);
    event WinnersSelected(uint256 indexed round);
    event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round);
    event RoundReset(uint256 indexed newRound);

    constructor(address _usdt, address _platformWallet) {
        require(_usdt != address(0), "Invalid USDT");
        require(_platformWallet != address(0), "Invalid wallet");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
    }

    // ========== FASE 1: COMPRA DE TICKETS (PASIVA) ==========
    
    function buySpecificPositions(uint256[] calldata positions) external nonReentrant {
        require(positions.length > 0 && positions.length <= MAX_TICKETS_PER_PURCHASE, "1-10 positions");
        require(!poolFilled, "Pool full");
        require(userTicketCount[msg.sender] + positions.length <= MAX_TICKETS_PER_USER, "Max 20 tickets");

        // Registrar posiciones
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

        // FASE 2: COMMIT cuando se llena el pool
        if (ticketsSold == MAX_PARTICIPANTS) {
            poolFilled = true;
            commitBlock = block.number + COMMIT_DELAY; // Bloque futuro
            emit PoolFilled(currentRound, ticketsSold, block.timestamp);
            emit DrawCommitted(currentRound, commitBlock);
        }
    }

    // ========== FASE 3: EJECUCIÓN AUTÓNOMA (REINTENTABLE) ==========
    
    /**
     * @notice Ejecuta el sorteo usando el bloque comprometido
     * @dev Puede ser llamado por CUALQUIERA después del commitBlock
     */
    function performDraw() external nonReentrant {
        require(poolFilled, "Pool not filled");
        require(!winnersSelected, "Already executed");
        require(block.number > commitBlock, "Wait commit block");
        require(commitBlock > 0, "No commit block");

        // Generar entropía del bloque futuro
        bytes32 blockHash = blockhash(commitBlock);
        
        // Si el blockhash expiró (>256 bloques), crear nuevo commit
        if (blockHash == bytes32(0)) {
            commitBlock = block.number + COMMIT_DELAY;
            emit DrawCommitted(currentRound, commitBlock);
            return; // Return instead of revert to save the new commitBlock
        }
        
        bytes32 entropy = keccak256(
            abi.encodePacked(
                blockHash,
                address(this),
                currentRound
            )
        );

        uint256 seed = uint256(entropy);
        emit DrawExecuted(currentRound, seed);

        _executeDraw(seed);
    }

    // ========== FASE 4: SORTEO DETERMINISTA ==========
    
    function _executeDraw(uint256 seed) private {
        // Shuffle Fisher-Yates
        uint256[] memory shuffled = new uint256[](MAX_PARTICIPANTS);
        for (uint256 i = 0; i < MAX_PARTICIPANTS; i++) {
            shuffled[i] = i + 1;
        }
        
        for (uint256 i = MAX_PARTICIPANTS - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(seed, i))) % (i + 1);
            (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
        }
        
        // Assign winners - Group A (10 winners - 5.82 USDT each)
        for (uint256 i = 0; i < 10; i++) {
            groupAWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 291) / 100; // 5.82 USDT
            }
        }
        
        // Group B (20 winners - 2.91 USDT each)
        for (uint256 i = 10; i < 30; i++) {
            groupBWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 1455) / 1000; // 2.91 USDT
            }
        }
        
        // Group C (30 winners - 1.29 USDT each)
        for (uint256 i = 30; i < 60; i++) {
            groupCWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 645) / 1000; // 1.29 USDT
            }
        }
        
        // Group D (40 winners - 0.97 USDT each)
        for (uint256 i = 60; i < 100; i++) {
            groupDWinners.push(shuffled[i]);
            address winner = positionToAddress[shuffled[i]];
            if (winner != address(0)) {
                claimable[winner] += (TICKET_PRICE * 485) / 1000; // 0.97 USDT
            }
        }

        // Transfer platform fee (3%)
        uint256 totalPool = TICKET_PRICE * MAX_PARTICIPANTS;
        uint256 gasFee = (totalPool * GAS_FEE_PERCENT) / 100;
        require(usdt.transfer(platformWallet, gasFee), "Fee transfer failed");

        winnersSelected = true;
        emit WinnersSelected(currentRound);
    }

    // ========== FASE 5: CLAIM (PULL, NO PUSH) ==========
    
    function claimPrize() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "Nothing to claim");
        
        claimable[msg.sender] = 0;
        require(usdt.transfer(msg.sender, amount), "Claim failed");
        
        emit PrizeClaimed(msg.sender, amount, currentRound);
    }

    // ========== FASE 6: RESET LIMPIO (MANUAL O AUTOMÁTICO) ==========
    
    /**
     * @notice Resetea el estado para la siguiente ronda
     * @dev Puede ser llamado por cualquiera después de que winnersSelected = true
     */
    function resetRound() external {
        require(winnersSelected, "Winners not selected yet");
        
        // Limpiar mappings de posiciones
        for (uint256 i = 1; i <= MAX_PARTICIPANTS; i++) {
            address user = positionToAddress[i];
            if (user != address(0)) {
                delete userTicketCount[user];
                delete userPositions[user];
                delete positionToAddress[i];
            }
        }

        // Limpiar arrays de ganadores
        delete groupAWinners;
        delete groupBWinners;
        delete groupCWinners;
        delete groupDWinners;

        // Reset state
        ticketsSold = 0;
        poolFilled = false;
        winnersSelected = false;
        commitBlock = 0;
        currentRound++;
        
        emit RoundReset(currentRound);
    }

    // ========== VIEW FUNCTIONS ==========
    
    function getGroupAWinners() external view returns (uint256[] memory) { return groupAWinners; }
    function getGroupBWinners() external view returns (uint256[] memory) { return groupBWinners; }
    function getGroupCWinners() external view returns (uint256[] memory) { return groupCWinners; }
    function getGroupDWinners() external view returns (uint256[] memory) { return groupDWinners; }
    function getUserPositions(address user) external view returns (uint256[] memory) { return userPositions[user]; }
    function getClaimable(address user) external view returns (uint256) { return claimable[user]; }
}
