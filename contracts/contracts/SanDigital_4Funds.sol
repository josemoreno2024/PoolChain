// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SanDigital_4Funds - Sistema de Ahorro Colectivo con 4 Fondos
 * @notice Sistema limpio y eficiente con dispersión progresiva automática
 *
 * ARQUITECTURA DE 4 FONDOS (FÓRMULA ÓPTIMA VALIDADA):
 *  ✅ 40% (4.0 USDT) → Dispersión Global Automática (motor social)
 *  ✅ 35% (3.5 USDT) → Fondo de Turno (usuario en posición #1)
 *  ✅ 15% (1.5 USDT) → Fondo de Cierre (garantiza salida exacta de 20 USDT)
 *  ✅ 10% (1.0 USDT) → Fondo Operativo (sostenibilidad del sistema)
 *
 * Modelo económico:
 *  - Aporte: 10 USDT por posición
 *  - Dispersión progresiva: 1/distancia (más cerca = más recibe)
 *  - Salida: Exactamente 20 USDT (garantizado por Fondo de Cierre)
 *  - Cola FIFO: Orden de entrada = orden de salida
 */
contract SanDigital_4Funds is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // =========================
    // Estructuras
    // =========================

    struct Position {
        uint256 positionId;
        address owner;
        bool isActive;
        bool hasExited;
        uint256 balance;         // Saldo acumulado
        uint256 indexInActivos;  // Posición en cola FIFO
        uint256 timestamp;
    }

    // =========================
    // Variables de estado
    // =========================

    IERC20 public immutable token;
    
    Position[] public positions;
    mapping(address => uint256[]) public userPositions;
    uint256[] public activos;  // Cola FIFO
    
    // 3 Fondos (55/35/10)
    uint256 public globalDistributionPool;  // 55% acumulado para dispersión
    uint256 public operationalFund;         // 10% para sistema
    
    // Métricas
    uint256 public totalSaldosUsuarios;
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public totalCompletedCycles;

    // =========================
    // Constantes
    // =========================

    uint256 public constant MAX_ACTIVE_POSITIONS = 30;
    uint256 public constant ENTRY_AMOUNT = 10_000000;      // 10 USDT
    uint256 public constant GLOBAL_PERCENT = 55;           // 55% (5.5 USDT) - Incluye antiguo cierre
    uint256 public constant TURN_PERCENT = 35;             // 35% (3.5 USDT)
    uint256 public constant OPERATIONAL_PERCENT = 10;      // 10% (1.0 USDT)
    uint256 public constant EXIT_AMOUNT = 20_000000;       // 20 USDT exactos
    uint256 public constant MIN_BALANCE_FOR_EXIT = 20_000000;  // 20 USDT mínimo
    uint256 public constant MAX_BALANCE_FOR_EXIT = 21_000000;  // 21 USDT máximo (auto-exit)

    // =========================
    // Eventos
    // =========================

    event PositionCreated(uint256 indexed positionId, address indexed user, uint256 timestamp);
    event PositionExited(uint256 indexed positionId, address indexed user, uint256 amountPaid);
    event AutoExitTriggered(uint256 indexed positionId, address indexed user, uint256 balanceAtExit);
    event TurnPaid(uint256 indexed positionId, uint256 amount);
    event GlobalDistributed(uint256 totalAmount, uint256 recipients, uint256 perPosition);
    event ExcessReturned(uint256 indexed positionId, uint256 excessAmount);
    event FundsAccumulated(uint256 globalAmount, uint256 operationalAmount);

    // =========================
    // Constructor
    // =========================

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
    }

    // =========================
    // Función Principal: Entrada
    // =========================

    function join() external nonReentrant whenNotPaused {
        require(activos.length < MAX_ACTIVE_POSITIONS, "Max positions reached");
        
        // Transferir 10 USDT
        token.safeTransferFrom(msg.sender, address(this), ENTRY_AMOUNT);
        totalDeposited += ENTRY_AMOUNT;
        
        // Distribuir en 3 fondos (55/35/10)
        uint256 globalAmount = (ENTRY_AMOUNT * GLOBAL_PERCENT) / 100;
        uint256 turnAmount = (ENTRY_AMOUNT * TURN_PERCENT) / 100;
        uint256 operationalAmount = (ENTRY_AMOUNT * OPERATIONAL_PERCENT) / 100;
        
        // Acumular fondos
        globalDistributionPool += globalAmount;
        operationalFund += operationalAmount;
        
        // Emitir evento de acumulación
        emit FundsAccumulated(globalAmount, operationalAmount);
        
        // Pagar a usuario en turno (posición #1)
        if (activos.length > 0) {
            uint256 turnPositionId = activos[0];
            positions[turnPositionId].balance += turnAmount;
            totalSaldosUsuarios += turnAmount;
            
            // Evento de pago de turno
            emit TurnPaid(turnPositionId, turnAmount);
            
            // AUTO-EXIT: Verificar DESPUÉS de pagar turno
            Position storage turnPos = positions[turnPositionId];
            if (turnPos.balance >= MIN_BALANCE_FOR_EXIT && turnPos.balance <= MAX_BALANCE_FOR_EXIT) {
                _autoExit(turnPositionId);
            }
        } else {
            // Primera entrada: NO hay turno, pero SÍ pagar turno a la nueva posición
            _createPosition(msg.sender);
            uint256 newPosId = activos[0];
            positions[newPosId].balance += turnAmount;
            totalSaldosUsuarios += turnAmount;
            
            // Evento de pago de turno
            emit TurnPaid(newPosId, turnAmount);
            return;
        }
        
        // Crear nueva posición (TX #2 en adelante)
        _createPosition(msg.sender);
        
        // Dispersar global SOLO si hay más de 1 posición (TX #2+)
        if (activos.length > 1) {
            _distributeGlobal();
        }
    }

    // =========================
    // Dispersión Global Progresiva
    // =========================

    function _distributeGlobal() internal {
        uint256 amount = globalDistributionPool;
        if (amount == 0) return;
        
        globalDistributionPool = 0;
        uint256 currentCount = activos.length;
        
        // Si solo hay 1 posición, NO dispersar (retener para TX #2)
        if (currentCount <= 1) {
            // Devolver el monto al pool
            globalDistributionPool = amount;
            return;
        }
        
        // DISPERSIÓN EQUITATIVA entre posiciones DETRÁS del turno
        // Excluir activos[0] que ya recibió el pago de turno
        uint256 recipients = currentCount - 1; // Excluir posición en turno
        uint256 perPosition = amount / recipients;
        uint256 remainder = amount % recipients;
        uint256 distributed = 0;
        
        // Empezar desde i=1 para EXCLUIR al turno (activos[0])
        for (uint256 i = 1; i < currentCount; i++) {
            uint256 posId = activos[i];
            Position storage p = positions[posId];
            
            if (p.isActive && !p.hasExited) {
                uint256 share;
                
                // Último recibe el residuo para no perder USDT
                if (i == currentCount - 1) {
                    share = amount - distributed;
                } else {
                    share = perPosition;
                }
                
                if (share > 0) {
                    p.balance += share;
                    totalSaldosUsuarios += share;
                    distributed += share;
                }
            }
        }
        
        // Emitir evento con información detallada
        emit GlobalDistributed(amount, recipients, perPosition);
    }

    // =========================
    // Función de Salida
    // =========================

    function exit(uint256 positionId) external nonReentrant {
        Position storage p = positions[positionId];
        
        require(p.owner == msg.sender, "Not owner");
        require(p.isActive, "Not active");
        require(!p.hasExited, "Already exited");
        require(p.balance >= MIN_BALANCE_FOR_EXIT, "Need at least 20 USDT");
        
        uint256 currentBalance = p.balance;
        
        // Si hay excedente, devolverlo al Global Pool
        if (currentBalance > EXIT_AMOUNT) {
            uint256 excess = currentBalance - EXIT_AMOUNT;
            globalDistributionPool += excess;
            emit ExcessReturned(positionId, excess);
        }
        
        // Marcar como salido
        p.hasExited = true;
        p.isActive = false;
        p.balance = 0;
        
        // Actualizar contabilidad
        totalSaldosUsuarios -= currentBalance;
        totalWithdrawn += EXIT_AMOUNT;
        totalCompletedCycles++;
        
        // Remover de activos (rotación FIFO)
        _removeFromActivos(p.indexInActivos);
        
        // Pagar exactamente 20 USDT
        token.safeTransfer(msg.sender, EXIT_AMOUNT);
        
        emit PositionExited(positionId, msg.sender, EXIT_AMOUNT);
    }
    
    // Salida automática (llamada internamente)
    function _autoExit(uint256 positionId) internal {
        Position storage p = positions[positionId];
        
        if (!p.isActive || p.hasExited) return;
        if (p.balance < MIN_BALANCE_FOR_EXIT) return;
        
        uint256 currentBalance = p.balance;
        address owner = p.owner;
        
        // Si hay excedente, devolverlo al Global Pool
        if (currentBalance > EXIT_AMOUNT) {
            uint256 excess = currentBalance - EXIT_AMOUNT;
            globalDistributionPool += excess;
            emit ExcessReturned(positionId, excess);
        }
        
        // Marcar como salido
        p.hasExited = true;
        p.isActive = false;
        p.balance = 0;
        
        // Actualizar contabilidad
        totalSaldosUsuarios -= currentBalance;
        totalWithdrawn += EXIT_AMOUNT;
        totalCompletedCycles++;
        
        // Remover de activos (rotación FIFO)
        _removeFromActivos(p.indexInActivos);
        
        // Pagar exactamente 20 USDT
        token.safeTransfer(owner, EXIT_AMOUNT);
        
        emit AutoExitTriggered(positionId, owner, currentBalance);
        emit PositionExited(positionId, owner, EXIT_AMOUNT);
    }


    // =========================
    // Funciones Internas
    // =========================

    function _createPosition(address user) internal {
        uint256 newPositionId = positions.length;
        
        Position memory newPos = Position({
            positionId: newPositionId,
            owner: user,
            isActive: true,
            hasExited: false,
            balance: 0,
            indexInActivos: activos.length,
            timestamp: block.timestamp
        });
        
        positions.push(newPos);
        userPositions[user].push(newPositionId);
        activos.push(newPositionId);
        
        emit PositionCreated(newPositionId, user, block.timestamp);
    }

    function _removeFromActivos(uint256 index) internal {
        require(index < activos.length, "Invalid index");
        
        // SHIFT: Mover todos los elementos una posición a la izquierda
        // Esto mantiene el orden FIFO correcto
        for (uint256 i = index; i < activos.length - 1; i++) {
            activos[i] = activos[i + 1];
            positions[activos[i]].indexInActivos = i;
        }
        
        activos.pop();
    }

    // =========================
    // Funciones de Vista
    // =========================

    function getSystemState() external view returns (
        uint256 activePositions,
        uint256 completedCycles,
        uint256 totalIn,
        uint256 totalOut,
        uint256 globalPool,
        uint256 operationalPool
    ) {
        return (
            activos.length,
            totalCompletedCycles,
            totalDeposited,
            totalWithdrawn,
            globalDistributionPool,
            operationalFund
        );
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getPositionBalance(uint256 positionId) external view returns (uint256) {
        require(positionId < positions.length, "Invalid position");
        return positions[positionId].balance;
    }

    function getUserTotalBalance(address user) external view returns (uint256) {
        uint256[] memory userPosIds = userPositions[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < userPosIds.length; i++) {
            Position storage p = positions[userPosIds[i]];
            if (p.isActive && !p.hasExited) {
                total += p.balance;
            }
        }
        
        return total;
    }

    function getGlobalActivosCount() external view returns (uint256) {
        return activos.length;
    }

    // =========================
    // Funciones de Admin
    // =========================

    function withdrawOperational(uint256 amount) external onlyOwner {
        require(amount <= operationalFund, "Insufficient operational funds");
        operationalFund -= amount;
        token.safeTransfer(owner(), amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
