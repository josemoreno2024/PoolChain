import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import addresses from '../../contracts/addresses.json'
import SanDigitalABI from '../../contracts/SanDigital4FundsKeeperABI.json'
import MockUSDTABI from '../../contracts/MockUSDTABI.json'

/**
 * Hook para interactuar con contratos SanDigital multi-tier
 * @param {string} userAddress - Dirección del usuario
 * @param {object} tierConfig - Configuración del tier (opcional, default: standard 20→40)
 * @returns {object} Funciones y datos del contrato
 */
export function useSanDigital(userAddress, tierConfig = null) {
    // Resolver dirección del contrato según el tier
    const getContractAddress = () => {
        if (!tierConfig) {
            // Fallback al contrato original (standard 20→40)
            return addresses.sanDigital2026
        }

        // IMPORTANTE: Usar 4funds para el tier micro (contrato limpio con 4 fondos)
        if (tierConfig.id === 'micro') {
            return addresses["4funds"]
        }

        // Usar dirección del tier desde addresses.json
        const tierAddress = addresses[tierConfig.id]

        if (!tierAddress) {
            console.warn(`⚠️ No se encontró dirección para tier "${tierConfig.id}", usando contrato original`)
            return addresses.sanDigital2026
        }

        return tierAddress
    }

    const contractAddress = getContractAddress()
    // ==========================================
    // READS - Posiciones del usuario
    // ==========================================

    // Obtener IDs de posiciones del usuario
    const { data: userPositionIds, refetch: refetchPositionIds } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'getUserPositions',
        args: [userAddress],
        enabled: !!userAddress,
        watch: true,
    })

    // Balance total de todas las posiciones
    const { data: totalBalance, refetch: refetchTotalBalance } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'getUserTotalBalance',
        args: [userAddress],
        enabled: !!userAddress,
        watch: true,
        pollingInterval: 2000, // Actualizar cada 3 segundos
    })

    // Calcular cantidad de posiciones activas desde el array
    const activePositionsCount = userPositionIds?.length || 0;
    const refetchActiveCount = refetchPositionIds; // Usar el mismo refetch

    // Calcular posiciones cerradas dinámicamente
    const { data: positionsData } = useReadContracts({
        contracts: userPositionIds?.map(posId => ({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'positions',
            args: [posId]
        })) || [],
        enabled: !!userPositionIds && userPositionIds.length > 0,
        watch: true,
    })



    // Contar posiciones cerradas (hasExited = true)
    // result es un array: [id, owner, isActive, hasExited, balance, ...]
    // hasExited está en el índice 3
    const closedPositionsCount = positionsData?.filter(
        result => result.status === 'success' && result.result?.[3] === true
    ).length || 0

    const pendingWithdrawals = 0; // No existe en 4Funds

    // ==========================================
    // READS - Información pública
    // ==========================================

    // 4Funds no tiene turnoIndex, usa cola FIFO (activos[0])
    const turnoIndex = 0; // Siempre es el primero en la cola
    const refetchTurno = () => { }; // No-op

    const { data: activosCount, refetch: refetchActivos } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'getGlobalActivosCount',
        watch: true,
        pollingInterval: 3000, // Actualizar cada 5 segundos
    })

    // Leer total de ciclos completados (métrica histórica)
    const { data: totalCompletedCycles, refetch: refetchCompletedCycles } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'totalCompletedCycles',
        watch: true,
        pollingInterval: 2000, // Reducido a 3 segundos
    })

    // ID de la posición que tiene el turno (Head of FIFO Queue)
    const { data: currentTurnoId } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'activos',
        args: [0n], // Position 1 - In Turn
        enabled: !!activosCount && Number(activosCount) > 0,
    })

    // Position 2 in queue
    const { data: secondPositionId } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'activos',
        args: [1n], // Position 2 - Next Up
        enabled: !!activosCount && Number(activosCount) > 1,
    })

    // Position 3 in queue
    const { data: thirdPositionId } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'activos',
        args: [2n], // Position 3 - Upcoming
        enabled: !!activosCount && Number(activosCount) > 2,
    })

    // ==========================================
    // READS - Admin Metrics
    // ==========================================

    const { data: operationalBalance, refetch: refetchOperationalBalance } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'operationalFund',
        watch: true,
        pollingInterval: 3000,
    })

    const { data: closureFund, refetch: refetchClosureFund } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'closureFund',
        watch: true,
        pollingInterval: 3000,
    })

    const { data: totalDeposited } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'totalDeposited',
        watch: true,
        pollingInterval: 3000,
    })

    const { data: totalWithdrawn } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'totalWithdrawn',
        watch: true,
        pollingInterval: 3000,
    })

    const { data: totalSaldosUsuarios } = useReadContract({
        address: contractAddress,
        abi: SanDigitalABI,
        functionName: 'totalSaldosUsuarios',
        watch: true,
        pollingInterval: 3000,
    })

    // ==========================================
    // READS - USDT
    // ==========================================

    const { data: usdtBalance, refetch: refetchUSDT } = useReadContract({
        address: addresses.mockUSDT,
        abi: MockUSDTABI,
        functionName: 'balanceOf',
        args: [userAddress],
        enabled: !!userAddress, // Solo ejecutar si hay userAddress
        // watch: true,
    })

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: addresses.mockUSDT,
        abi: MockUSDTABI,
        functionName: 'allowance',
        args: [userAddress, contractAddress],
        enabled: !!userAddress,
        // watch: true,
    })

    // ==========================================
    // WRITES
    // ==========================================

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

    // Debug: Log write errors
    if (writeError) {
        console.error('❌ Error en writeContract:', writeError)
    }

    const { isLoading: isConfirming, isSuccess, error: txError } = useWaitForTransactionReceipt({
        hash,
    })

    // Debug: Log transaction errors
    if (txError) {
        console.error('❌ Error en transacción:', txError)
    }

    // Leer allowance actual del usuario
    const { data: currentAllowance } = useReadContract({
        address: addresses.mockUSDT,
        abi: MockUSDTABI,
        functionName: 'allowance',
        args: userAddress ? [userAddress, contractAddress] : undefined,
        query: {
            enabled: !!userAddress,
            refetchInterval: 5000, // Refrescar cada 5 segundos
        }
    })

    // Verificar si tiene allowance suficiente (al menos 10 USDT)
    const REQUIRED_ALLOWANCE = parseUnits('10', 6) // 10 USDT
    const hasAllowance = currentAllowance && currentAllowance >= REQUIRED_ALLOWANCE

    // Aprobar USDT
    const approveUSDT = () => {
        // Aprobación INFINITA (Standard DeFi) - Solo una vez
        const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        writeContract({
            address: addresses.mockUSDT,
            abi: MockUSDTABI,
            functionName: 'approve',
            args: [contractAddress, MAX_UINT256], // Aprobación infinita
            gas: 100000n,
        })
    }

    // Crear nueva posición (join)
    const createPosition = () => {
        writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'join',
            gas: 1000000n, // Subido a 1M para estar 100% seguro
            value: 0n, // Explícito: no enviar ETH
        })
    }

    // Claim de una posición específica
    const claimPosition = (positionId) => {
        writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'claim',
            args: [positionId],
            gas: 300000n, // Límite de gas explícito
        })
    }

    // Claim de todas las posiciones
    const claimAll = () => {
        writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'claimAll',
            gas: 1000000n, // Límite de gas explícito (puede tener múltiples posiciones)
        })
    }

    // Mintear USDT de prueba (faucet)
    const mintTestUSDT = () => {
        writeContract({
            address: addresses.mockUSDT,
            abi: MockUSDTABI,
            functionName: 'mint',
            args: [userAddress, parseUnits('1000', 6)],
            gas: 100000n, // Límite de gas explícito
        })
    }

    // ==========================================
    // HELPER: Obtener info de una posición
    // ==========================================

    const getPositionInfo = (positionId) => {
        return useReadContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'getPositionInfo',
            args: [positionId],
            watch: true,
        })
    }

    const getPositionBalance = (positionId) => {
        return useReadContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'getPositionBalance',
            args: [positionId],
            watch: true,
        })
    }

    // Retirar fondos de administración
    const withdrawAdmin = () => {
        if (!operationalBalance || operationalBalance === 0n) {
            console.error('No hay fondos para retirar')
            return
        }

        writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'withdrawOperational',
            args: [operationalBalance], // Retirar todo el balance
            gas: 100000n,
        })
    }

    // 🚨 Rescatar fondos atrapados (emergencia)
    const claimPending = () => {
        writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'claimPending',
            gas: 100000n,
        })
    }

    return {
        // Data - Usuario
        userPositionIds,
        totalBalance,
        activePositionsCount,

        // Data - Público
        turnoIndex,
        currentTurnoId,
        secondPositionId,
        thirdPositionId,
        activosCount,
        totalCompletedCycles,

        // Data - USDT
        usdtBalance,
        allowance,

        // Data - Admin
        operationalBalance: operationalBalance || 0n,
        closureFund: closureFund || 0n,
        totalDeposited: totalDeposited || 0n,
        totalWithdrawn: totalWithdrawn || 0n,
        totalSaldosUsuarios: totalSaldosUsuarios || 0n,

        // Closed positions count
        closedPositionsCount,
        pendingWithdrawals, // 🚨 Fondos atrapados

        // Actions
        approveUSDT,
        hasAllowance, // Nuevo: indica si ya tiene allowance aprobado
        createPosition,
        claimPosition,
        claimAll,
        mintTestUSDT,
        withdrawAdmin,
        claimPending, // 🚨 Rescatar fondos

        // Status
        isPending,
        isConfirming,
        isSuccess,

        // Refetch
        refetchPositionIds,
        refetchTotalBalance,
        refetchActiveCount,
        refetchTurno,
        refetchActivos,
        refetchUSDT,
        refetchAllowance,

        // Helpers
        getPositionInfo,
        getPositionBalance,

        // Admin functions
        ownerWithdraw: (amount) => writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'ownerWithdraw',
            args: [amount],
            gas: 150000n,
        }, {
            onError: (error) => console.error('❌ Error en ownerWithdraw:', error)
        }),

        pauseContract: () => writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'pause',
            gas: 100000n,
        }, {
            onError: (error) => console.error('❌ Error en pause:', error)
        }),

        unpauseContract: () => writeContract({
            address: contractAddress,
            abi: SanDigitalABI,
            functionName: 'unpause',
            gas: 100000n,
        }, {
            onError: (error) => console.error('❌ Error en unpause:', error)
        }),
    }
}
