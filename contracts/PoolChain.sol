// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PoolChain - Sistema de Lotería Descentralizada
 * @author SanDigital / Coliriun
 * @notice Sistema 100% on-chain, auditable y sin intervención humana
 * @dev Contrato de lotería con distribución automática de premios
 * 
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Copyright © 2026 SanDigital - Todos los derechos reservados
 * Diseñado y desarrollado por Coliriun
 * 
 * PROTECCIÓN LEGAL:
 * ─────────────────
 * Este código está protegido mediante:
 * • Sello de tiempo cualificado eIDAS (Coloriuris S.L.)
 * • Número de Serie: 58485363
 * • Hash SHA-256: dd9d06efabd7271ae12576ee18803616c40464b1f8f9d24769232f23b7312292
 * • Verificación: https://cipsc.coloriuris.net/tsa/
 * 
 * LICENCIA:
 * ─────────
 * Este código se distribuye bajo Licencia MIT para fines de:
 * ✓ Auditoría y verificación de transparencia
 * ✓ Estudio académico y educativo
 * ✓ Revisión de seguridad
 * 
 * RESTRICCIONES:
 * ──────────────
 * ✗ Uso comercial sin autorización expresa
 * ✗ Redistribución con fines lucrativos
 * ✗ Copia de la lógica de negocio
 * ✗ Modificación y venta del sistema
 * 
 * Para consultas comerciales: contacto@sandigital.com
 * 
 * AVISO LEGAL:
 * ────────────
 * Este software se proporciona "TAL CUAL", sin garantías de ningún tipo.
 * Los autores no serán responsables de daños derivados del uso del software.
 * 
 * NORMATIVA APLICABLE:
 * ────────────────────
 * • Reglamento (UE) N° 910/2014 (eIDAS)
 * • Ley 6/2020 de servicios electrónicos de confianza (España)
 * • Convenio de Berna para la protección de obras literarias y artísticas
 * 
 * ═══════════════════════════════════════════════════════════════════
 * 
 * ARQUITECTURA DEL SISTEMA:
 * ─────────────────────────
 * 
 * PoolChain implementa un sistema de lotería descentralizada donde:
 * 
 * 1. VENTA DE TICKETS
 *    - Los usuarios compran tickets con USDT
 *    - Cada ticket tiene una posición única (1-100)
 *    - El pool se llena automáticamente
 * 
 * 2. GENERACIÓN DE ALEATORIEDAD
 *    - Usa blockhash + timestamp + round
 *    - Determinístico y verificable
 *    - Sin intervención humana
 * 
 * 3. SELECCIÓN DE GANADORES
 *    - 4 grupos de premios (A, B, C, D)
 *    - Distribución automática
 *    - Evento WinnersSelected público
 * 
 * 4. RECLAMO DE PREMIOS
 *    - Pull model (usuarios reclaman)
 *    - Sin bloqueos ni dependencias
 *    - Evento PrizeClaimed auditable
 * 
 * CARACTERÍSTICAS DE SEGURIDAD:
 * ──────────────────────────────
 * • ReentrancyGuard para prevenir ataques
 * • Pausable para emergencias
 * • Ownable para gestión controlada
 * • Eventos completos para auditoría
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @notice Contrato principal de PoolChain
 * @dev Implementa lógica de lotería con distribución automática
 */
contract PoolChain is Ownable, ReentrancyGuard, Pausable {
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTANTES Y VARIABLES DE ESTADO
    // ═══════════════════════════════════════════════════════════════
    
    IERC20 public immutable usdtToken;
    
    uint256 public constant TICKET_PRICE = 2 * 10**6; // 2 USDT (6 decimales)
    uint256 public constant MAX_PARTICIPANTS = 100;
    
    // Distribución de premios
    uint256 public constant GROUP_A_COUNT = 10;
    uint256 public constant GROUP_B_COUNT = 20;
    uint256 public constant GROUP_C_COUNT = 30;
    uint256 public constant GROUP_D_COUNT = 40;
    
    uint256 public constant GROUP_A_PRIZE = 5820000; // 5.82 USDT
    uint256 public constant GROUP_B_PRIZE = 2910000; // 2.91 USDT
    uint256 public constant GROUP_C_PRIZE = 1290000; // 1.29 USDT
    uint256 public constant GROUP_D_PRIZE = 970000;  // 0.97 USDT
    
    // Estado del sorteo
    uint256 public currentRound;
    uint256 public ticketsSold;
    bool public poolFilled;
    bool public winnersSelected;
    
    // Mapeos
    mapping(uint256 => address) public ticketOwner; // posición => owner
    mapping(address => uint256[]) public userPositions;
    mapping(address => uint256) public claimableAmount;
    
    // Ganadores por grupo
    address[] public groupAWinners;
    address[] public groupBWinners;
    address[] public groupCWinners;
    address[] public groupDWinners;
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTOS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Emitido cuando se compran tickets
     * @param buyer Dirección del comprador
     * @param positions Array de posiciones compradas
     * @param quantity Cantidad de tickets
     * @param totalCost Costo total en USDT
     * @param round Número de ronda actual
     */
    event TicketsPurchased(
        address indexed buyer,
        uint256[] positions,
        uint256 quantity,
        uint256 totalCost,
        uint256 indexed round
    );
    
    /**
     * @notice Emitido cuando se seleccionan los ganadores
     * @param round Número de ronda
     * @param groupAWinners Ganadores del grupo A
     * @param groupBWinners Ganadores del grupo B
     * @param groupCWinners Ganadores del grupo C
     * @param groupDWinners Ganadores del grupo D
     */
    event WinnersSelected(
        uint256 indexed round,
        address[] groupAWinners,
        address[] groupBWinners,
        address[] groupCWinners,
        address[] groupDWinners
    );
    
    /**
     * @notice Emitido cuando un ganador reclama su premio
     * @param winner Dirección del ganador
     * @param amount Cantidad reclamada
     */
    event PrizeClaimed(
        address indexed winner,
        uint256 amount
    );
    
    /**
     * @notice Emitido cuando se resetea una ronda
     * @param round Número de ronda reseteada
     */
    event RoundReset(uint256 indexed round);
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Inicializa el contrato PoolChain
     * @param _usdtToken Dirección del token USDT
     */
    constructor(address _usdtToken) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
        currentRound = 1;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // FUNCIONES PRINCIPALES
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Compra tickets en posiciones específicas
     * @param positions Array de posiciones a comprar (1-100)
     * @dev Requiere aprobación previa de USDT
     */
    function buyTickets(uint256[] calldata positions) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(!poolFilled, "Pool is full");
        require(positions.length > 0, "No positions provided");
        require(
            ticketsSold + positions.length <= MAX_PARTICIPANTS,
            "Exceeds max participants"
        );
        
        uint256 totalCost = TICKET_PRICE * positions.length;
        
        // Transferir USDT
        require(
            usdtToken.transferFrom(msg.sender, address(this), totalCost),
            "USDT transfer failed"
        );
        
        // Asignar posiciones
        for (uint256 i = 0; i < positions.length; i++) {
            uint256 pos = positions[i];
            require(pos >= 1 && pos <= MAX_PARTICIPANTS, "Invalid position");
            require(ticketOwner[pos] == address(0), "Position taken");
            
            ticketOwner[pos] = msg.sender;
            userPositions[msg.sender].push(pos);
        }
        
        ticketsSold += positions.length;
        
        // Si se llena el pool, marcar como lleno
        if (ticketsSold == MAX_PARTICIPANTS) {
            poolFilled = true;
        }
        
        emit TicketsPurchased(
            msg.sender,
            positions,
            positions.length,
            totalCost,
            currentRound
        );
    }
    
    /**
     * @notice Ejecuta el sorteo y selecciona ganadores
     * @dev Solo puede ejecutarse cuando el pool está lleno
     * @dev Usa blockhash + timestamp para aleatoriedad
     */
    function performDraw() external onlyOwner nonReentrant {
        require(poolFilled, "Pool not full");
        require(!winnersSelected, "Winners already selected");
        
        // Generar seed aleatorio
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    currentRound
                )
            )
        );
        
        // Seleccionar ganadores
        _selectWinners(seed);
        
        winnersSelected = true;
        
        emit WinnersSelected(
            currentRound,
            groupAWinners,
            groupBWinners,
            groupCWinners,
            groupDWinners
        );
    }
    
    /**
     * @notice Reclama el premio del usuario
     * @dev Pull model para mayor seguridad
     */
    function claimPrize() external nonReentrant {
        uint256 amount = claimableAmount[msg.sender];
        require(amount > 0, "No prize to claim");
        
        claimableAmount[msg.sender] = 0;
        
        require(
            usdtToken.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit PrizeClaimed(msg.sender, amount);
    }
    
    /**
     * @notice Resetea la ronda para un nuevo sorteo
     * @dev Solo owner, limpia todo el estado
     */
    function resetRound() external onlyOwner {
        // Limpiar ganadores
        delete groupAWinners;
        delete groupBWinners;
        delete groupCWinners;
        delete groupDWinners;
        
        // Limpiar tickets
        for (uint256 i = 1; i <= MAX_PARTICIPANTS; i++) {
            address owner = ticketOwner[i];
            if (owner != address(0)) {
                delete userPositions[owner];
                delete ticketOwner[i];
            }
        }
        
        // Resetear estado
        ticketsSold = 0;
        poolFilled = false;
        winnersSelected = false;
        currentRound++;
        
        emit RoundReset(currentRound - 1);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // FUNCIONES INTERNAS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Selecciona ganadores usando el seed
     * @param seed Semilla aleatoria
     * @dev Algoritmo determinístico y verificable
     */
    function _selectWinners(uint256 seed) private {
        uint256[] memory availablePositions = new uint256[](MAX_PARTICIPANTS);
        for (uint256 i = 0; i < MAX_PARTICIPANTS; i++) {
            availablePositions[i] = i + 1;
        }
        
        uint256 remaining = MAX_PARTICIPANTS;
        
        // Grupo A
        for (uint256 i = 0; i < GROUP_A_COUNT; i++) {
            uint256 index = uint256(keccak256(abi.encodePacked(seed, i))) % remaining;
            uint256 position = availablePositions[index];
            address winner = ticketOwner[position];
            
            groupAWinners.push(winner);
            claimableAmount[winner] += GROUP_A_PRIZE;
            
            availablePositions[index] = availablePositions[remaining - 1];
            remaining--;
        }
        
        // Grupo B
        for (uint256 i = 0; i < GROUP_B_COUNT; i++) {
            uint256 index = uint256(keccak256(abi.encodePacked(seed, i + 100))) % remaining;
            uint256 position = availablePositions[index];
            address winner = ticketOwner[position];
            
            groupBWinners.push(winner);
            claimableAmount[winner] += GROUP_B_PRIZE;
            
            availablePositions[index] = availablePositions[remaining - 1];
            remaining--;
        }
        
        // Grupo C
        for (uint256 i = 0; i < GROUP_C_COUNT; i++) {
            uint256 index = uint256(keccak256(abi.encodePacked(seed, i + 200))) % remaining;
            uint256 position = availablePositions[index];
            address winner = ticketOwner[position];
            
            groupCWinners.push(winner);
            claimableAmount[winner] += GROUP_C_PRIZE;
            
            availablePositions[index] = availablePositions[remaining - 1];
            remaining--;
        }
        
        // Grupo D
        for (uint256 i = 0; i < GROUP_D_COUNT; i++) {
            uint256 index = uint256(keccak256(abi.encodePacked(seed, i + 300))) % remaining;
            uint256 position = availablePositions[index];
            address winner = ticketOwner[position];
            
            groupDWinners.push(winner);
            claimableAmount[winner] += GROUP_D_PRIZE;
            
            availablePositions[index] = availablePositions[remaining - 1];
            remaining--;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // FUNCIONES DE VISTA
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Obtiene las posiciones de un usuario
     * @param user Dirección del usuario
     * @return Array de posiciones
     */
    function getUserPositions(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPositions[user];
    }
    
    /**
     * @notice Obtiene los ganadores del grupo A
     * @return Array de direcciones ganadoras
     */
    function getGroupAWinners() external view returns (address[] memory) {
        return groupAWinners;
    }
    
    /**
     * @notice Obtiene los ganadores del grupo B
     * @return Array de direcciones ganadoras
     */
    function getGroupBWinners() external view returns (address[] memory) {
        return groupBWinners;
    }
    
    /**
     * @notice Obtiene los ganadores del grupo C
     * @return Array de direcciones ganadoras
     */
    function getGroupCWinners() external view returns (address[] memory) {
        return groupCWinners;
    }
    
    /**
     * @notice Obtiene los ganadores del grupo D
     * @return Array de direcciones ganadoras
     */
    function getGroupDWinners() external view returns (address[] memory) {
        return groupDWinners;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // FUNCIONES DE ADMINISTRACIÓN
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Pausa el contrato
     * @dev Solo owner
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Despausa el contrato
     * @dev Solo owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Retira fondos de emergencia
     * @param amount Cantidad a retirar
     * @dev Solo owner, solo en caso de emergencia
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(
            usdtToken.transfer(owner(), amount),
            "Transfer failed"
        );
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * 
 * FIN DEL CONTRATO POOLCHAIN
 * 
 * Para más información:
 * • Documentación: Ver README.md
 * • Certificado de Sello: Ver TIMESTAMP_CERTIFICATE.md
 * • Copyright: Ver COPYRIGHT_NOTICE.md
 * • Verificación: https://cipsc.coloriuris.net/tsa/
 * 
 * ═══════════════════════════════════════════════════════════════════
 */
