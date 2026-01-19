// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SanDigital_Ultra - Tier Ultra (100→200 USDT)
 * @notice Sistema de ahorro colectivo (NO es inversión)
 *
 * CARACTERÍSTICAS:
 *  ✅ EXIT_THRESHOLD: 200 USDT
 *  ✅ Posiciones ilimitadas por usuario
 *  ✅ Distribución directa optimizada
 *  ✅ Transparencia total del sistema
 *
 * Modelo económico:
 *  - Aporte: 100 USDT por posición
 *  - 49.5 USDT → usuario en turno
 *  - 49.5 USDT → global (todos los activos)
 *  - 1 USDT → administración (1%)
 *  - Salida automática al alcanzar 200 USDT
 */
contract SanDigital_Ultra is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // =========================
    // Estructuras
    // =========================

    struct Position {
        uint256 positionId;      // ID único de la posición
        address owner;           // Dueño de la posición
        bool isActive;          // Está activa
        bool hasExited;         // Ya completó (>=40)
        uint256 saldoTurno;     // Saldo de turno
        uint256 shares;         // Shares para calcular global (siempre 1)
        uint256 rewardDebt;     // Deuda de recompensa
        uint256 indexInActivos; // Índice en array activos
        uint256 timestamp;      // Cuándo se creó
    }

    // =========================
    // Variables de estado
    // =========================

    IERC20 public immutable token;
    
    Position[] public positions;                        // Todas las posiciones
    mapping(address => uint256[]) public userPositions; // Posiciones por usuario
    uint256[] public activos;                          // IDs de posiciones activas
    
    uint256 public turnoIndex;                         // Índice en activos[]
    uint256 public totalSaldosUsuarios;                // Suma de todos los saldos
    uint256 public operationalBalance;                 // Fondos de admin
    uint256 public globalReserve;                      // 9 USDT guardados cuando solo hay 1 activo

    // Pending withdrawals (protección si transfer falla)
    mapping(address => uint256) public pendingWithdrawals;

    // Optimización de gas
    uint256 public accGlobalPerShare;                  // Acumulador global (scaled by 1e12)
    uint256 public totalShares;                        // Total de shares activas

    // Transparencia
    uint256 public totalDeposited;                     // Total depositado histórico
    uint256 public totalWithdrawn;                     // Total retirado histórico
    uint256 public totalCompletedCycles;               // Ciclos completados

    // =========================
    // Constantes
    // =========================

    uint256 public constant MAX_ACTIVOS = 100;              // Límite total de posiciones activas
    // Sin límite de posiciones por usuario - pueden crear las que quieran
    uint256 public constant APORTE          = 100_000000;  // 100 * 10^6
    uint256 public constant TURN_PAYOUT     = 49_500000;  // 49.5 * 10^6
    uint256 public constant GLOBAL_PAYOUT   = 49_500000;  // 49.5 * 10^6
    uint256 public constant ADMIN_FEE       =  1_000000;  // 1 * 10^6
    uint256 public constant EXIT_THRESHOLD = 200_000000;  // 200 USDT
    uint256 public constant MIN_CLAIM = 1_000000;         // 1 USDT

    // =========================
    // Eventos
    // =========================

    event PositionCreated(uint256 indexed positionId, address indexed user, uint256 timestamp);
    event PositionExited(uint256 indexed positionId, address indexed user, uint256 finalBalance);
    event Claim(address indexed user, uint256 indexed positionId, uint256 amount);
    event ClaimAll(address indexed user, uint256 totalAmount);
    event PendingClaimed(address indexed user, uint256 amount);
    event PartialClaim(address indexed user, uint256 processed, uint256 total);
    event OwnerWithdrawal(address indexed owner, uint256 amount);
    event Transparency(uint256 totalIn, uint256 totalOut, uint256 activeUsers, uint256 timestamp);

    // =========================
    // Constructor
    // =========================

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    // =========================
    // Funciones principales
    // =========================

    /**
     * @notice Unirse al sistema creando una nueva posición
     * @dev Usuario puede tener posiciones ilimitadas
     */
    function join() external nonReentrant whenNotPaused returns (uint256) {
        // Validar límite global del sistema
        require(activos.length < MAX_ACTIVOS, "Max capacity reached");
        
        // Sin límite por usuario - pueden crear las posiciones que quieran

        // Transferir USDT (safeTransferFrom ya valida todo)
        token.safeTransferFrom(msg.sender, address(this), APORTE);

        // Actualizar métricas de transparencia
        totalDeposited += APORTE;

        // Crear nueva posición
        uint256 newPositionId = positions.length;
        
        Position memory newPosition = Position({
            positionId: newPositionId,
            owner: msg.sender,
            isActive: true,
            hasExited: false,
            saldoTurno: 0,
            shares: 1,                      // 1 share por posición
            rewardDebt: 0,                  // Se actualiza después de la distribución
            indexInActivos: activos.length,
            timestamp: block.timestamp
        });

        positions.push(newPosition);
        userPositions[msg.sender].push(newPositionId);
        activos.push(newPositionId);

        // Admin fee
        operationalBalance += ADMIN_FEE;

        // LÓGICA DE DISTRIBUCIÓN UNIVERSAL (SELF-DISTRIBUTION)
        // Requerimiento: El usuario que entra TAMBIÉN recibe parte de su propio Global.
        // Ejemplo: Si hay 1 usuario y entra el 2do, los 9 USDT se dividen entre 2.
        
        // 1. Guardamos el acumulador ACTUAL (antes de subir) como la deuda.
        // Esto permite que el usuario gane la diferencia que se generará en el paso 3.
        // 1. Guardamos el acumulador NORMALIZADO (div 1e12) como deuda.
        // Match 1e12 divisor in _getPendingGlobal
        positions[newPositionId].rewardDebt = (newPosition.shares * accGlobalPerShare) / 1e12;

        // 2. Incrementamos shares ANTES de distribuir
        // Así el nuevo usuario cuenta para la división.
        totalShares += 1;

        // 3. Procesamos la distribución
        // El accGlobalPerShare subirá. 
        // Pending = (1 * accNuevo) - accViejo = GANANCIA INMEDIATA.
        _procesarEntradaOptimizada(newPositionId);

        emit PositionCreated(newPositionId, msg.sender, block.timestamp);
        emit Transparency(totalDeposited, totalWithdrawn, activos.length, block.timestamp);

        return newPositionId;
    }

    /**
     * @notice Reclamar saldo de una posición específica
     */
    function claim(uint256 positionId) external nonReentrant {
        Position storage p = positions[positionId];
        require(p.owner == msg.sender, "Not owner");
        require(p.isActive || p.hasExited, "Invalid state"); // ✅ Permitir claim si hasExited

        uint256 totalBalance;

        if (p.hasExited) {
            // Posición completada: cobrar saldo final guardado
            totalBalance = p.saldoTurno;
            require(totalBalance >= MIN_CLAIM, "Already claimed");
            
            // Cerrar definitivamente
            p.saldoTurno = 0;
            p.isActive = false;
        } else {
            // Posición activa: verificar si debe salir
            if (_verificarSalida(positionId)) {
                // Se marcó como completada, ahora cobrar
                totalBalance = p.saldoTurno;
                require(totalBalance >= MIN_CLAIM, "Below minimum");
                p.saldoTurno = 0;
                p.isActive = false;
            } else {
                // Pago parcial normal
                uint256 globalPending = _getPendingGlobal(positionId);
                totalBalance = p.saldoTurno + globalPending;
                require(totalBalance >= MIN_CLAIM, "Below minimum");
                
                p.saldoTurno = 0;
                p.rewardDebt = (p.shares * accGlobalPerShare) / 1e12;
                
                if (totalSaldosUsuarios >= totalBalance) {
                    totalSaldosUsuarios -= totalBalance;
                } else {
                    totalSaldosUsuarios = 0;
                }
                totalWithdrawn += totalBalance;
            }
        }

        // Pagar con protección
        _safePay(msg.sender, totalBalance);
        emit Claim(msg.sender, positionId, totalBalance);
    }

    /**
     * @notice Reclamar saldo de todas las posiciones activas del usuario
     * @dev Limitado a 50 iteraciones para prevenir DoS por gas
     */
    function claimAll() external nonReentrant {
        uint256[] memory userPosIds = userPositions[msg.sender];
        require(userPosIds.length > 0, "No positions");

        uint256 totalToClaim = 0;
        uint256 maxIterations = 50; // Límite de seguridad anti-DoS
        uint256 processed = 0;

        for (uint256 i = 0; i < userPosIds.length && processed < maxIterations; i++) {
            uint256 posId = userPosIds[i];
            Position storage p = positions[posId];

            if (p.hasExited) {
                // Posición completada: cobrar saldo final
                if (p.saldoTurno >= MIN_CLAIM) {
                    totalToClaim += p.saldoTurno;
                    p.saldoTurno = 0;
                    p.isActive = false;
                }
            } else if (p.isActive) {
                // Posición activa: verificar salida o pago parcial
                // 1. Intentar salida
                if (_verificarSalida(posId)) {
                    // Se marcó como completada, cobrar ahora
                    if (p.saldoTurno >= MIN_CLAIM) {
                        totalToClaim += p.saldoTurno;
                        p.saldoTurno = 0;
                        p.isActive = false;
                    }
                    processed++;
                    continue;
                }

                // 2. Si no salió, acumular para pago parcial
                uint256 globalPending = _getPendingGlobal(posId);
                uint256 posBalance = p.saldoTurno + globalPending;

                if (posBalance >= MIN_CLAIM) {
                    totalToClaim += posBalance;
                    p.saldoTurno = 0;
                    p.rewardDebt = (p.shares * accGlobalPerShare) / 1e12;
                }
            }
            processed++;
        }

        if (totalToClaim > 0) {
            // Actualizar métricas bulk
            if (totalSaldosUsuarios >= totalToClaim) {
                totalSaldosUsuarios -= totalToClaim;
            } else {
                totalSaldosUsuarios = 0;
            }
            totalWithdrawn += totalToClaim;

            token.safeTransfer(msg.sender, totalToClaim);
            emit ClaimAll(msg.sender, totalToClaim);
        }

        // Emitir evento si quedaron posiciones sin procesar
        if (processed < userPosIds.length) {
            emit PartialClaim(msg.sender, processed, userPosIds.length);
        }
    }

    /**
     * @notice Reclamar fondos que quedaron pendientes por fallo en transferencia
     * @dev Rescata USDT que quedó atrapado en pendingWithdrawals
     */
    function claimPending() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending funds");

        // Efecto: Resetear antes de transferir (Protección contra Reentrancy)
        pendingWithdrawals[msg.sender] = 0;
        
        // Interacción: Transferencia real
        token.safeTransfer(msg.sender, amount);
        
        emit PendingClaimed(msg.sender, amount);
    }

    /**
     * @notice Reclamar saldo de un rango de posiciones (prevención de DoS)
     * @param startIndex Índice inicial (inclusivo)
     * @param endIndex Índice final (exclusivo)
     */
    function claimRange(uint256 startIndex, uint256 endIndex) external nonReentrant {
        uint256[] memory userPosIds = userPositions[msg.sender];
        require(userPosIds.length > 0, "No positions");
        require(endIndex <= userPosIds.length, "Invalid end index");
        require(startIndex < endIndex, "Invalid range");
        require(endIndex - startIndex <= 50, "Range too large (max 50)");

        uint256 totalToClaim = 0;

        for (uint256 i = startIndex; i < endIndex; i++) {
            uint256 posId = userPosIds[i];
            Position storage p = positions[posId];

            if (p.hasExited) {
                // Posición completada: cobrar saldo final
                if (p.saldoTurno >= MIN_CLAIM) {
                    totalToClaim += p.saldoTurno;
                    p.saldoTurno = 0;
                    p.isActive = false;
                }
            } else if (p.isActive) {
                // Posición activa: verificar salida o pago parcial
                if (_verificarSalida(posId)) {
                    if (p.saldoTurno >= MIN_CLAIM) {
                        totalToClaim += p.saldoTurno;
                        p.saldoTurno = 0;
                        p.isActive = false;
                    }
                    continue;
                }

                uint256 globalPending = _getPendingGlobal(posId);
                uint256 posBalance = p.saldoTurno + globalPending;

                if (posBalance >= MIN_CLAIM) {
                    totalToClaim += posBalance;
                    p.saldoTurno = 0;
                    p.rewardDebt = (p.shares * accGlobalPerShare) / 1e12;
                }
            }
        }

        if (totalToClaim > 0) {
            if (totalSaldosUsuarios >= totalToClaim) {
                totalSaldosUsuarios -= totalToClaim;
            } else {
                totalSaldosUsuarios = 0;
            }
            totalWithdrawn += totalToClaim;

            token.safeTransfer(msg.sender, totalToClaim);
            emit ClaimAll(msg.sender, totalToClaim);
        }
    }

    // =========================
    // Funciones internas OPTIMIZADAS
    // =========================

    /**
     * @dev Procesar entrada con DISTRIBUCIÓN DIRECTA (sin acumulador global)
     * Modelo: 10 USDT → Turno, 9 USDT → dividido entre otros activos
     * NOTA: Este modelo elimina el bug de posiciones cerradas que siguen acumulando
     */
    function _procesarEntradaOptimizada(uint256 newPositionId) internal {
        uint256 count = activos.length;
        
        // ============================================
        // PASO 1: Pago al turno (activos[0]) - 10 USDT
        // ============================================
        if (count > 0) {
            uint256 turnoId = activos[0]; // Siempre index 0 (Head of Queue)
            Position storage turnoPos = positions[turnoId];
            
            // Limitar el pago de turno para no exceder EXIT_THRESHOLD
            uint256 needed = EXIT_THRESHOLD > turnoPos.saldoTurno 
                ? EXIT_THRESHOLD - turnoPos.saldoTurno 
                : 0;
            
            uint256 turnoPayout = needed > TURN_PAYOUT ? TURN_PAYOUT : needed;
            
            // Pagar al turno
            if (turnoPayout > 0) {
                turnoPos.saldoTurno += turnoPayout;
                totalSaldosUsuarios += turnoPayout;
            }
            
            // Verificar si el turno alcanzó el threshold y debe salir
            _verificarSalida(turnoId);
        }

        // ============================================
        // PASO 2: Distribución Global DIRECTA - 9 USDT
        // Dividido entre activos[1..n] (excluyendo turno)
        // INCLUYE: globalReserve si existe (acumulado de TX anteriores)
        // ============================================
        uint256 currentCount = activos.length; // Puede haber cambiado si el turno salió
        
        if (currentCount > 1) {
            // Hay otros activos además del turno actual
            uint256 globalRecipients = currentCount - 1; // Excluir turno (activos[0])
            
            // Total a distribuir: 9 USDT nuevos + lo que estaba en reserva
            uint256 totalGlobal = GLOBAL_PAYOUT + globalReserve;
            globalReserve = 0; // Vaciar reserva después de usarla
            
            uint256 perPosition = totalGlobal / globalRecipients;
            uint256 remainder = totalGlobal % globalRecipients; // Manejar residuo
            
            // Distribuir directamente a cada posición activa (excepto turno)
            for (uint256 i = 1; i < currentCount; i++) {
                uint256 posId = activos[i];
                Position storage p = positions[posId];
                
                // Solo distribuir si la posición está activa y NO ha salido
                if (p.isActive && !p.hasExited) {
                    uint256 amount = perPosition;
                    // Dar el residuo al último para no perder USDT
                    if (i == currentCount - 1) {
                        amount += remainder;
                    }
                    p.saldoTurno += amount;
                    totalSaldosUsuarios += amount;
                    
                    // Verificar si esta posición alcanzó el threshold
                    _verificarSalida(posId);
                }
            }
        } else {
            // Solo hay 1 activo (o ninguno), guardar los 9 USDT en reserva
            globalReserve += GLOBAL_PAYOUT;
        }
    }

    /**
     * @dev Verificar si una posición alcanzó el threshold y debe salir
     */
    /**
     * @dev Verificar si una posición alcanzó el threshold y debe salir.
     *      SI sale, realiza el pago y limpieza completos.
     * @return exited True si la posición salió (y se pagó).
     */
    function _verificarSalida(uint256 positionId) internal returns (bool) {
        Position storage p = positions[positionId];
        
        if (!p.isActive || p.hasExited) return false;

        uint256 globalPending = _getPendingGlobal(positionId);
        uint256 totalBalance = p.saldoTurno + globalPending;

        if (totalBalance >= EXIT_THRESHOLD) {
            // ===========================================
            // MARK AS COMPLETED - NO AUTO-PAY
            // ===========================================

            // 1. Freeze Accounting & Save Balance
            p.rewardDebt = (p.shares * accGlobalPerShare) / 1e12;
            p.saldoTurno = totalBalance;  // ✅ GUARDAR balance para claim manual
            p.hasExited = true;           // Marcar como completado
            // p.isActive sigue true hasta que haga claim

            // 2. Remove from Global Distribution
            // CRÍTICO: Descontar shares para que NO siga acumulando
            totalShares -= p.shares;

            // 3. Metrics Update
            totalCompletedCycles++;
            // ❌ NO incrementar totalWithdrawn aquí
            // Solo se incrementa cuando el usuario hace claim() real
            // Esto evita doble contabilidad

            // 4. Remove from Active Distribution
            _removerDeActivos(p.indexInActivos);

            // 5. NO PAGAR AQUÍ - Usuario debe hacer claim manual
            emit PositionExited(positionId, p.owner, totalBalance);

            return true;
        }
        
        return false;
    }

    /**
     * @dev Pago seguro con fallback a pending withdrawals
     */
    function _safePay(address recipient, uint256 amount) internal {
        require(amount > 0, "Zero amount");
        require(address(this).balance >= amount || token.balanceOf(address(this)) >= amount, "Insufficient balance");
        
        try token.transfer(recipient, amount) returns (bool success) {
            if (!success) {
                pendingWithdrawals[recipient] += amount;
            }
        } catch {
            pendingWithdrawals[recipient] += amount;
        }
    }

    /**
     * @dev Remover posición del array de activos
     */
    function _removerDeActivos(uint256 index) internal {
        require(activos.length > 0, "No active positions"); 
        require(index < activos.length, "Invalid index");

        // ARRAY SHIFT para preservar ORDEN (FIFO)
        // Movemos todos los elementos una posición hacia la izquierda desde el índice eliminado
        for (uint256 i = index; i < activos.length - 1; i++) {
            activos[i] = activos[i + 1];
            positions[activos[i]].indexInActivos = i; // Actualizar índice en struct
        }

        activos.pop();
        
        // NOTA: totalShares ya se decrementó en _verificarSalida()
        // No decrementar aquí para evitar doble contabilidad

        // Reset turnoIndex logic (aunque ya no lo usamos para rotar, lo mantenemos en 0)
        turnoIndex = 0;
    }

    /**
     * @dev Calcular saldo global pending de una posición
     * NOTA: Con el nuevo modelo de distribución directa, YA NO hay pending global.
     * Todo se suma directamente a saldoTurno. Esta función se mantiene por compatibilidad.
     */
    function _getPendingGlobal(uint256 positionId) internal view returns (uint256) {
        // Con distribución directa, todo está en saldoTurno, no hay pending
        return 0;
    }

    // =========================
    // View functions
    // =========================

    function getPositionInfo(uint256 positionId) external view returns (
        uint256 id,
        address owner,
        bool isActive,
        bool hasExited,
        uint256 saldoTurno,
        uint256 saldoGlobal,
        uint256 timestamp
    ) {
        Position storage p = positions[positionId];
        uint256 globalPending = _getPendingGlobal(positionId);
        
        return (
            p.positionId,
            p.owner,
            p.isActive,
            p.hasExited,
            p.saldoTurno,
            globalPending,
            p.timestamp
        );
    }

    function getPositionBalance(uint256 positionId) public view returns (uint256) {
        Position storage p = positions[positionId];
        uint256 globalPending = _getPendingGlobal(positionId);
        return p.saldoTurno + globalPending;
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getUserActivePositionsCount(address user) public view returns (uint256) {
        uint256[] memory userPosIds = userPositions[user];
        uint256 count = 0;
        
        for (uint256 i = 0; i < userPosIds.length; i++) {
            Position storage p = positions[userPosIds[i]];
            // Solo contar si está activa Y no ha completado
            if (p.isActive && !p.hasExited) {
                count++;
            }
        }
        
        return count;
    }

    function getUserTotalBalance(address user) external view returns (uint256) {
        uint256[] memory userPosIds = userPositions[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < userPosIds.length; i++) {
            uint256 posId = userPosIds[i];
            Position storage p = positions[posId];
            // Sumar TODAS las posiciones (activas Y completadas con saldo)
            if (p.isActive || (p.hasExited && p.saldoTurno > 0)) {
                total += getPositionBalance(posId);
            }
        }
        
        return total;
    }

    /**
     * @notice Obtener cantidad GLOBAL de posiciones activas en el sistema
     * @return Número total de posiciones activas (todas las wallets)
     */
    function getGlobalActivosCount() external view returns (uint256) {
        return activos.length;
    }

    /**
     * @notice Obtener cantidad de posiciones cerradas del usuario
     * @param user Dirección del usuario
     * @return Número de posiciones que han completado el ciclo (hasExited = true)
     */
    function getUserClosedPositionsCount(address user) external view returns (uint256) {
        uint256[] memory userPosIds = userPositions[user];
        uint256 count = 0;
        
        for (uint256 i = 0; i < userPosIds.length; i++) {
            Position storage p = positions[userPosIds[i]];
            if (p.hasExited) {
                count++;
            }
        }
        
        return count;
    }

    /**
     * @notice Obtener salud del sistema (transparencia)
     */
    function getSystemHealth() external view returns (
        uint256 totalIn,
        uint256 totalOut,
        uint256 activeCount,
        uint256 completedCount,
        uint256 ratio
    ) {
        uint256 ratioCalc = totalDeposited > 0 ? (totalWithdrawn * 100) / totalDeposited : 0;
        
        return (
            totalDeposited,
            totalWithdrawn,
            activos.length,
            totalCompletedCycles,
            ratioCalc
        );
    }

    function getSaldoTotal() external view returns (uint256) {
        return totalSaldosUsuarios;
    }

    function getAdminBalance() external view returns (uint256) {
        return operationalBalance;
    }

    function getAvailableSlots() external view returns (uint256) {
        return activos.length < MAX_ACTIVOS ? MAX_ACTIVOS - activos.length : 0;
    }

    // =========================
    // Funciones de admin
    // =========================

    function ownerWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= operationalBalance, "Insufficient balance");
        operationalBalance -= amount;
        token.safeTransfer(owner(), amount);
        emit OwnerWithdrawal(owner(), amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
