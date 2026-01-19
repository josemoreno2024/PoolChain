import { parseAbiItem } from 'viem';

/**
 * Calcula el total de premios reclamados históricamente por un usuario
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @param {string} userAddress - Dirección del usuario
 * @param {bigint} fromBlock - Bloque inicial
 * @returns {Promise<string>} Total acumulado en USDT
 */
export async function fetchUserTotalEarnings(publicClient, poolChainAddress, userAddress, fromBlock = 0n) {
    try {
        if (!userAddress) return '0.00';

        console.log('Fetching earnings for:', userAddress, 'from block:', fromBlock.toString());

        // Leer eventos PrizeClaimed del usuario
        // Evento: PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round)
        const claimEvents = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed round)'),
            args: {
                winner: userAddress
            },
            fromBlock,
            toBlock: 'latest'
        });

        console.log('Found claim events:', claimEvents.length);

        // Sumar todos los montos reclamados
        let totalWei = 0n;
        for (const event of claimEvents) {
            console.log('Event amount:', event.args.amount.toString());
            totalWei += event.args.amount;
        }

        // Convertir de wei (6 decimales para USDT) a USDT
        const totalUSDT = Number(totalWei) / 1_000_000;
        console.log('Total USDT:', totalUSDT);
        return totalUSDT.toFixed(2);
    } catch (error) {
        console.error('Error fetching user total earnings:', error);
        return '0.00';
    }
}

/**
 * Cache para ganancias totales
 */
const EARNINGS_CACHE_TTL = 2 * 60 * 1000; // 2 minutos

function getEarningsCacheKey(networkKey, userAddress) {
    return `poolchain_earnings_${networkKey}_${userAddress}`;
}

export function getCachedEarnings(networkKey, userAddress) {
    try {
        const cached = localStorage.getItem(getEarningsCacheKey(networkKey, userAddress));
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp > EARNINGS_CACHE_TTL) {
            localStorage.removeItem(getEarningsCacheKey(networkKey, userAddress));
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
}

export function setCachedEarnings(networkKey, userAddress, data) {
    try {
        localStorage.setItem(getEarningsCacheKey(networkKey, userAddress), JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error caching earnings:', error);
    }
}
