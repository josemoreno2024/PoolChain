// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PoolChain_Micro_PositionSelect
 * @notice Sistema de sorteo con selección de posiciones específicas
 * @dev Permite a los usuarios elegir exactamente qué posiciones comprar (1-100)
 */
contract PoolChain_Micro_PositionSelect is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Estructuras ============
    
    struct Ticket {
        uint256 position;           // Posición en el pool (1-100)
        address owner;              // Dueño del ticket
        uint256 purchaseTime;       // Timestamp de compra
        uint256 roundNumber;        // Número de ronda
    }

    // ============ Constants ============
    
    uint256 public constant TICKET_PRICE = 2_000000; // 2 USDT (6 decimals)
    uint256 public constant MAX_PARTICIPANTS = 100;
    uint256 public constant GAS_FEE_PERCENT = 3; // 3% gas fee
    uint256 public constant MAX_TICKETS_PER_PURCHASE = 10; // Límite por compra
    uint256 public constant MAX_TICKETS_PER_USER_PER_ROUND = 20; // Límite total por usuario
    
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
    address public immutable platformWallet;
    
    uint256 public currentRound = 1;
    
    bool public poolFilled;
    bool public winnersSelected;
    
    // Mapping: position => Ticket
    mapping(uint256 => Ticket) public positionToTicket;
    
    // Mapping: position => isOccupied
    mapping(uint256 => bool) public isPositionOccupied;
    
    // Arrays de ganadores
    address[] public groupAWinners;
    address[] public groupBWinners;
    address[] public groupCWinners;
    address[] public groupDWinners;
    
    // Mappings
    mapping(address => uint256[]) public userPositions; // Posiciones por usuario
    mapping(uint256 => bool) public isWinningPosition;  // Si una posición ganó
    mapping(uint256 => uint8) public positionWinnerGroup; // Grupo de la posición (1=A, 2=B, 3=C, 4=D)
    mapping(address => uint256) public claimable;      // Premios por reclamar
    
    // Contador de tickets vendidos
    uint256 public ticketsSold;
    
    // Seguridad: Tracking de compras por bloque
    mapping(address => uint256) public lastPurchaseBlock;
    mapping(address => uint256) public purchasesInCurrentBlock;
    uint256 public constant MAX_PURCHASES_PER_BLOCK = 1; // Anti-bot

    // ============ Events ============
    
    event TicketsPurchased(
        address indexed buyer,
        uint256[] positions,
        uint256 quantity,
        uint256 totalCost,
        uint256 round
    );
    
    event PoolFilled(uint256 indexed round, uint256 totalTickets, uint256 timestamp);
    
    event WinnerSelected(
        uint256 indexed position,
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
    
    constructor(address _usdt, address _platformWallet) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        usdt = IERC20(_usdt);
        platformWallet = _platformWallet;
    }

    // ============ Main Functions ============
    
    /**
     * @notice Comprar tickets en posiciones específicas
     * @param positions Array de posiciones a comprar (1-100)
     */
    function buySpecificPositions(uint256[] calldata positions) external nonReentrant whenNotPaused {
        uint256 quantity = positions.length;
        
        // Validaciones básicas
        require(!poolFilled, "Pool is full");
        require(quantity > 0 && quantity <= MAX_TICKETS_PER_PURCHASE, "Must buy 1-10 tickets");
        require(ticketsSold + quantity <= MAX_PARTICIPANTS, "Exceeds max participants");
        
        // Límite total por usuario por ronda
        require(
            userPositions[msg.sender].length + quantity <= MAX_TICKETS_PER_USER_PER_ROUND,
            "Exceeds max tickets per user (20)"
        );
        
        // Anti-bot: Prevenir múltiples compras en el mismo bloque
        if (block.number == lastPurchaseBlock[msg.sender]) {
            require(
                purchasesInCurrentBlock[msg.sender] < MAX_PURCHASES_PER_BLOCK,
                "Max purchases per block reached"
            );
            purchasesInCurrentBlock[msg.sender]++;
        } else {
            lastPurchaseBlock[msg.sender] = block.number;
            purchasesInCurrentBlock[msg.sender] = 1;
        }
        
        // Validar que todas las posiciones sean válidas y estén disponibles
        for (uint256 i = 0; i < quantity; i++) {
            uint256 pos = positions[i];
            require(pos >= 1 && pos <= MAX_PARTICIPANTS, "Invalid position");
            require(!isPositionOccupied[pos], "Position already occupied");
            
            // Verificar que no haya duplicados en el array
            for (uint256 j = i + 1; j < quantity; j++) {
                require(positions[i] != positions[j], "Duplicate positions");
            }
        }
        
        // Calcular costo total
        uint256 totalCost = TICKET_PRICE * quantity;
        
        // Transferir USDT
        usdt.safeTransferFrom(msg.sender, address(this), totalCost);
        
        // Crear tickets en las posiciones especificadas
        for (uint256 i = 0; i < quantity; i++) {
            uint256 pos = positions[i];
            
            positionToTicket[pos] = Ticket({
                position: pos,
                owner: msg.sender,
                purchaseTime: block.timestamp,
                roundNumber: currentRound
            });
            
            isPositionOccupied[pos] = true;
            userPositions[msg.sender].push(pos);
            ticketsSold++;
        }
        
        emit TicketsPurchased(msg.sender, positions, quantity, totalCost, currentRound);
        
        // Verificar si el pool se llenó
        if (ticketsSold == MAX_PARTICIPANTS) {
            poolFilled = true;
            emit PoolFilled(currentRound, MAX_PARTICIPANTS, block.timestamp);
        }
    }
    
    /**
     * @notice Ejecutar sorteo (solo owner, cuando pool lleno)
     */
    function executeDraw() external onlyOwner nonReentrant {
        require(poolFilled, "Pool not filled");
        require(!winnersSelected, "Winners already selected");
        require(ticketsSold == MAX_PARTICIPANTS, "Invalid ticket count");
        
        // Generar posiciones ganadoras aleatorias
        uint256[] memory winningPositions = _generateRandomPositions();
        
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
        
        // Grupo A
        for (uint256 i = 0; i < GROUP_A_COUNT; i++) {
            _assignWinner(winningPositions[idx], 1, groupAPrize);
            idx++;
        }
        
        // Grupo B
        for (uint256 i = 0; i < GROUP_B_COUNT; i++) {
            _assignWinner(winningPositions[idx], 2, groupBPrize);
            idx++;
        }
        
        // Grupo C
        for (uint256 i = 0; i < GROUP_C_COUNT; i++) {
            _assignWinner(winningPositions[idx], 3, groupCPrize);
            idx++;
        }
        
        // Grupo D
        for (uint256 i = 0; i < GROUP_D_COUNT; i++) {
            _assignWinner(winningPositions[idx], 4, groupDPrize);
            idx++;
        }
        
        // Transferir gas fee a platform wallet
        usdt.safeTransfer(platformWallet, gasFee);
        
        winnersSelected = true;
        emit DrawExecuted(currentRound, block.timestamp);
    }
    
    /**
     * @notice Reclamar premio
     */
    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "No claimable amount");
        
        claimable[msg.sender] = 0;
        usdt.safeTransfer(msg.sender, amount);
        
        emit PrizeClaimed(msg.sender, amount, currentRound, block.timestamp);
    }
    
    /**
     * @notice Resetear ronda (solo owner, después de sorteo)
     */
    function resetRound() external onlyOwner {
        require(winnersSelected, "Draw not executed");
        
        // Limpiar posiciones ocupadas
        for (uint256 i = 1; i <= MAX_PARTICIPANTS; i++) {
            if (isPositionOccupied[i]) {
                delete positionToTicket[i];
                isPositionOccupied[i] = false;
            }
        }
        
        // Limpiar arrays
        delete groupAWinners;
        delete groupBWinners;
        delete groupCWinners;
        delete groupDWinners;
        
        // Reset flags
        poolFilled = false;
        winnersSelected = false;
        ticketsSold = 0;
        
        // Incrementar ronda
        currentRound++;
        
        emit RoundReset(currentRound, block.timestamp);
    }

    // ============ Internal Functions ============
    
    function _assignWinner(uint256 position, uint8 group, uint256 prize) private {
        require(isPositionOccupied[position], "Position not occupied");
        
        Ticket memory ticket = positionToTicket[position];
        address winner = ticket.owner;
        
        // Marcar posición como ganadora
        isWinningPosition[position] = true;
        positionWinnerGroup[position] = group;
        
        // Agregar a array de ganadores
        if (group == 1) {
            groupAWinners.push(winner);
        } else if (group == 2) {
            groupBWinners.push(winner);
        } else if (group == 3) {
            groupCWinners.push(winner);
        } else if (group == 4) {
            groupDWinners.push(winner);
        }
        
        // Agregar premio a claimable
        claimable[winner] += prize;
        
        emit WinnerSelected(position, winner, group, prize, currentRound);
    }
    
    function _generateRandomPositions() private view returns (uint256[] memory) {
        uint256[] memory positions = new uint256[](MAX_PARTICIPANTS);
        
        // Crear array [1, 2, 3, ..., 100]
        for (uint256 i = 0; i < MAX_PARTICIPANTS; i++) {
            positions[i] = i + 1;
        }
        
        // Shuffle usando pseudo-random (TESTING ONLY)
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            ticketsSold
        )));
        
        for (uint256 i = MAX_PARTICIPANTS - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(randomSeed, i))) % (i + 1);
            (positions[i], positions[j]) = (positions[j], positions[i]);
        }
        
        return positions;
    }

    // ============ View Functions ============
    
    function getTicketCount() external view returns (uint256) {
        return ticketsSold;
    }
    
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }
    
    function getUserTicketCount(address user) external view returns (uint256) {
        return userPositions[user].length;
    }
    
    function getTicketAtPosition(uint256 position) external view returns (Ticket memory) {
        require(position >= 1 && position <= MAX_PARTICIPANTS, "Invalid position");
        require(isPositionOccupied[position], "Position not occupied");
        return positionToTicket[position];
    }
    
    function getAvailablePositions() external view returns (uint256[] memory) {
        uint256 availableCount = MAX_PARTICIPANTS - ticketsSold;
        uint256[] memory available = new uint256[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= MAX_PARTICIPANTS; i++) {
            if (!isPositionOccupied[i]) {
                available[index] = i;
                index++;
            }
        }
        
        return available;
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
        return TICKET_PRICE * ticketsSold;
    }
    
    function isPoolFilled() external view returns (bool) {
        return poolFilled;
    }
    
    function areWinnersSelected() external view returns (bool) {
        return winnersSelected;
    }

    // ============ Admin Functions ============
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergencia: Retirar fondos (solo si hay error crítico)
     */
    function emergencyWithdraw() external onlyOwner {
        require(!winnersSelected, "Cannot withdraw after draw");
        uint256 balance = usdt.balanceOf(address(this));
        usdt.safeTransfer(owner(), balance);
    }
}
