import { parseAbiItem } from 'viem';

/**
 * Lee el historial de sorteos desde eventos del blockchain
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @param {bigint} fromBlock - Bloque inicial
 * @returns {Promise<Array>} Array de sorteos históricos
 */
export async function fetchLotteryHistory(publicClient, poolChainAddress, fromBlock = 0n) {
    try {
        // Leer eventos WinnersSelected (marca cuando un sorteo se completó)
        const winnersEvents = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event WinnersSelected(uint256 indexed round)'),
            fromBlock,
            toBlock: 'latest'
        });

        // Transformar eventos en objetos de sorteo
        const lotteries = await Promise.all(winnersEvents.map(async (event) => {
            // Obtener el bloque para sacar el timestamp
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber });

            return {
                round: Number(event.args.round),
                timestamp: Number(block.timestamp),
                blockNumber: Number(event.blockNumber),
                transactionHash: event.transactionHash
            };
        }));

        // Ordenar por ronda (más reciente primero)
        return lotteries.sort((a, b) => b.round - a.round);
    } catch (error) {
        console.error('Error fetching lottery history:', error);
        return [];
    }
}

/**
 * Lee el historial PERSONAL de sorteos del usuario
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @param {string} userAddress - Dirección del usuario
 * @param {bigint} fromBlock - Bloque inicial
 * @returns {Promise<Array>} Array de sorteos donde el usuario participó
 */
export async function fetchUserLotteryHistory(publicClient, poolChainAddress, userAddress, fromBlock = 0n) {
    try {
        console.log('📜 Fetching user lottery history for:', userAddress);

        // 1. Leer eventos TicketsPurchased del usuario
        const purchaseEvents = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event TicketsPurchased(address indexed buyer, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round)'),
            args: {
                buyer: userAddress
            },
            fromBlock,
            toBlock: 'latest'
        });

        console.log(`Found ${purchaseEvents.length} purchase events`);

        if (purchaseEvents.length === 0) {
            return []; // Usuario nunca participó
        }

        // 2. Agrupar por ronda y sumar tickets
        const roundsMap = new Map();

        for (const event of purchaseEvents) {
            const round = Number(event.args.round);
            const quantity = Number(event.args.quantity);
            const totalCost = Number(event.args.totalCost) / 1_000_000; // USDT tiene 6 decimales

            if (!roundsMap.has(round)) {
                roundsMap.set(round, {
                    round,
                    ticketsPurchased: 0,
                    totalCost: 0,
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                });
            }

            const roundData = roundsMap.get(round);
            roundData.ticketsPurchased += quantity;
            roundData.totalCost += totalCost;
        }

        console.log(`User participated in ${roundsMap.size} rounds:`, Array.from(roundsMap.keys()));

        // 3. Leer eventos PrizeClaimed del usuario
        const claimEvents = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round)'),
            args: {
                winner: userAddress
            },
            fromBlock,
            toBlock: 'latest'
        });

        console.log(`Found ${claimEvents.length} claim events`);

        // 4. Mapear premios reclamados por ronda
        const claimedPrizesMap = new Map();
        for (const event of claimEvents) {
            const round = Number(event.args.round);
            const amount = Number(event.args.amount) / 1_000_000; // USDT 6 decimales
            claimedPrizesMap.set(round, amount);
        }

        // 5. Construir historial completo
        const lotteries = await Promise.all(
            Array.from(roundsMap.values()).map(async (roundData) => {
                // Obtener timestamp del bloque
                const block = await publicClient.getBlock({ blockNumber: roundData.blockNumber });

                const prizeClaimed = claimedPrizesMap.get(roundData.round) || 0;

                // Determinar estado
                let status;
                if (prizeClaimed > 0) {
                    status = 'Reclamado';
                } else {
                    // Aquí podrías verificar si tiene premios pendientes
                    // Por ahora, si no reclamó, asumimos "Sin premio" o "Pendiente"
                    status = 'Sin premio';
                }

                return {
                    round: roundData.round,
                    timestamp: Number(block.timestamp),
                    blockNumber: Number(roundData.blockNumber),
                    transactionHash: roundData.transactionHash,
                    ticketsPurchased: roundData.ticketsPurchased,
                    totalCost: roundData.totalCost.toFixed(2),
                    prizeWon: prizeClaimed.toFixed(2),
                    prizeClaimed: prizeClaimed > 0,
                    status
                };
            })
        );

        // Ordenar por ronda (más reciente primero)
        const sorted = lotteries.sort((a, b) => b.round - a.round);

        console.log('User lottery history:', sorted);
        return sorted;

    } catch (error) {
        console.error('Error fetching user lottery history:', error);
        return [];
    }
}

/**
 * Obtiene detalles de un sorteo específico
 * @param {Object} contract - Instancia del contrato con viem
 * @param {number} round - Número de ronda
 * @param {string} userAddress - Dirección del usuario (opcional)
 * @returns {Promise<Object>} Detalles del sorteo
 */
export async function fetchRoundDetails(contract, round, userAddress = null) {
    try {
        // Por ahora retornamos estructura básica
        // En el futuro podemos leer más datos del contrato si los guardamos
        return {
            round,
            groupA: [],
            groupB: [],
            groupC: [],
            groupD: [],
            userParticipated: false,
            userPrize: '0'
        };
    } catch (error) {
        console.error(`Error fetching round ${round} details:`, error);
        return null;
    }
}

/**
 * Cache simple en localStorage con TTL
 */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(networkKey) {
    return `poolchain_history_${networkKey}`;
}

export function getCachedHistory(networkKey) {
    try {
        const cached = localStorage.getItem(getCacheKey(networkKey));
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Verificar si el cache expiró
        if (now - timestamp > CACHE_TTL) {
            localStorage.removeItem(getCacheKey(networkKey));
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
}

export function setCachedHistory(networkKey, data) {
    try {
        localStorage.setItem(getCacheKey(networkKey), JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error caching history:', error);
    }
}

/**
 * Lee la actividad del contrato (sorteos ejecutados, frecuencia, premios reclamados)
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @param {bigint} fromBlock - Bloque inicial
 * @returns {Promise<Object>} Estadísticas del sistema
 */
export async function fetchContractActivity(publicClient, poolChainAddress, fromBlock = 0n) {
    try {
        console.log('📊 Fetching contract activity...');

        // 1. Leer eventos WinnersSelected (sorteos completados)
        const winnersEvents = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event WinnersSelected(uint256 indexed round)'),
            fromBlock,
            toBlock: 'latest'
        });

        console.log(`Found ${winnersEvents.length} completed rounds`);

        if (winnersEvents.length === 0) {
            return {
                totalExecuted: 0,
                firstRoundDate: null,
                lastRoundDate: null,
                avgFrequencySeconds: 0,
                totalClaimedUSDT: '0.00',
                recentRounds: []
            };
        }

        // 2. Obtener timestamps de cada sorteo
        const completedRounds = await Promise.all(
            winnersEvents.map(async (event) => {
                const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
                return {
                    round: Number(event.args.round),
                    timestamp: Number(block.timestamp),
                    blockNumber: Number(event.blockNumber),
                    transactionHash: event.transactionHash
                };
            })
        );

        // 3. Leer eventos PrizeClaimed para calcular total reclamado
        const claimEvents = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round)'),
            fromBlock,
            toBlock: 'latest'
        });

        const totalClaimed = claimEvents.reduce((sum, event) => {
            return sum + Number(event.args.amount);
        }, 0) / 1_000_000; // USDT 6 decimales

        console.log(`Total claimed: ${totalClaimed} USDT`);

        // 4. Calcular estadísticas
        const sortedRounds = completedRounds.sort((a, b) => b.round - a.round);
        const firstRound = sortedRounds[sortedRounds.length - 1];
        const lastRound = sortedRounds[0];

        const avgFrequency = sortedRounds.length > 1
            ? (lastRound.timestamp - firstRound.timestamp) / (sortedRounds.length - 1)
            : 0;

        console.log('Contract activity loaded:', {
            totalExecuted: sortedRounds.length,
            avgFrequency: formatFrequency(avgFrequency)
        });

        return {
            totalExecuted: sortedRounds.length,
            firstRoundDate: firstRound?.timestamp,
            lastRoundDate: lastRound?.timestamp,
            avgFrequencySeconds: avgFrequency,
            totalClaimedUSDT: totalClaimed.toFixed(2),
            recentRounds: sortedRounds.slice(0, 5) // Últimos 5
        };

    } catch (error) {
        console.error('Error fetching contract activity:', error);
        return {
            totalExecuted: 0,
            firstRoundDate: null,
            lastRoundDate: null,
            avgFrequencySeconds: 0,
            totalClaimedUSDT: '0.00',
            recentRounds: []
        };
    }
}

/**
 * Formatea un timestamp a "hace X tiempo"
 * @param {number} timestamp - Timestamp en segundos
 * @returns {string} Tiempo formateado
 */
export function formatTimeAgo(timestamp) {
    if (!timestamp) return 'nunca';

    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'hace menos de 1 min';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;

    return new Date(timestamp * 1000).toLocaleDateString('es-ES');
}

/**
 * Formatea frecuencia en segundos a texto legible
 * @param {number} seconds - Segundos entre sorteos
 * @returns {string} Frecuencia formateada
 */
export function formatFrequency(seconds) {
    if (!seconds || seconds === 0) return 'N/A';

    const days = seconds / 86400;
    const hours = seconds / 3600;

    if (days >= 1) return `~${Math.round(days)} sorteo${days > 1 ? 's' : ''} / día`;
    if (hours >= 1) return `~${Math.round(hours)}h entre sorteos`;

    return `~${Math.round(seconds / 60)} min entre sorteos`;
}
