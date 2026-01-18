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
