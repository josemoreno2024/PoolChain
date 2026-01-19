import { parseAbiItem } from 'viem';

// ========== CONSTANTES (Ventana móvil clara) ==========
const ACTIVITY_WINDOW_MINUTES = 10; // Ventana para calcular ritmo reciente
const ESTIMATION_SAMPLE_SIZE = 10;   // Número de tickets para estimar
const MAX_RECENT_ACTIVITIES = 3;     // Máximo de actividades recientes a mostrar
const MAX_EVENTS_LIMIT = 100;        // Límite defensivo para pools con mucha actividad

/**
 * Lee la actividad del pool en tiempo real
 * @param {Object} publicClient - Cliente de viem
 * @param {string} poolChainAddress - Dirección del contrato
 * @param {number} currentRound - Ronda actual
 * @param {bigint} fromBlock - Bloque inicial
 * @returns {Promise<Object>} Actividad del pool
 */
export async function fetchPoolActivity(publicClient, poolChainAddress, currentRound, fromBlock = 0n) {
    try {
        console.log('📊 Fetching pool activity...');

        // 1. Leer TODOS los eventos TicketsPurchased de la ronda actual
        const allPurchases = await publicClient.getLogs({
            address: poolChainAddress,
            event: parseAbiItem('event TicketsPurchased(address indexed buyer, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round)'),
            args: {
                round: BigInt(currentRound)
            },
            fromBlock,
            toBlock: 'latest'
        });

        console.log(`Found ${allPurchases.length} purchase events in round ${currentRound}`);

        if (allPurchases.length === 0) {
            return {
                hasActivity: false,
                ticketsLast10Min: 0,
                lastPurchaseTime: null,
                avgTimePerTicket: null,
                estimatedTimeToFill: null,
                recentActivities: []
            };
        }

        // 2. Obtener timestamps de todos los eventos
        const purchasesWithTime = await Promise.all(
            allPurchases.map(async (event) => {
                const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
                return {
                    buyer: event.args.buyer,
                    quantity: Number(event.args.quantity),
                    timestamp: Number(block.timestamp),
                    blockNumber: Number(event.blockNumber)
                };
            })
        );

        // Ordenar por timestamp (más antiguo primero)
        purchasesWithTime.sort((a, b) => a.timestamp - b.timestamp);

        // Límite defensivo: usar solo los últimos MAX_EVENTS_LIMIT eventos
        const limitedPurchases = purchasesWithTime.length > MAX_EVENTS_LIMIT
            ? purchasesWithTime.slice(-MAX_EVENTS_LIMIT)
            : purchasesWithTime;

        // 3. Calcular ritmo de participación (últimos X minutos)
        const now = Math.floor(Date.now() / 1000);
        const windowStart = now - (ACTIVITY_WINDOW_MINUTES * 60);

        const recentPurchases = limitedPurchases.filter(p => p.timestamp >= windowStart);
        const ticketsLast10Min = recentPurchases.reduce((sum, p) => sum + p.quantity, 0);

        // 4. Última compra
        const lastPurchase = limitedPurchases[limitedPurchases.length - 1];
        const lastPurchaseTime = lastPurchase?.timestamp;

        // 5. Calcular estimación (últimos N tickets)
        let avgTimePerTicket = null;
        if (limitedPurchases.length >= 2) {
            // Usar últimos ESTIMATION_SAMPLE_SIZE tickets o todos si hay menos
            const sampleSize = Math.min(ESTIMATION_SAMPLE_SIZE, limitedPurchases.length);
            const samplePurchases = limitedPurchases.slice(-sampleSize);

            const firstSample = samplePurchases[0];
            const lastSample = samplePurchases[samplePurchases.length - 1];

            const totalTickets = samplePurchases.reduce((sum, p) => sum + p.quantity, 0);
            const timeSpan = lastSample.timestamp - firstSample.timestamp;

            if (totalTickets > 0 && timeSpan > 0) {
                avgTimePerTicket = timeSpan / totalTickets;
            }
        }

        // 6. Actividades recientes (últimas N compras)
        const recentActivities = limitedPurchases
            .slice(-MAX_RECENT_ACTIVITIES)
            .reverse()
            .map(p => ({
                buyer: truncateAddress(p.buyer),
                quantity: p.quantity,
                timeAgo: formatTimeAgo(p.timestamp)
            }));

        console.log('Pool activity loaded:', {
            ticketsLast10Min,
            lastPurchaseTime: formatTimeAgo(lastPurchaseTime),
            avgTimePerTicket: avgTimePerTicket ? `${Math.round(avgTimePerTicket / 60)} min` : 'N/A'
        });

        return {
            hasActivity: true,
            ticketsLast10Min,
            lastPurchaseTime,
            avgTimePerTicket,
            recentActivities,
            totalPurchaseEvents: purchasesWithTime.length // Total original (sin límite)
        };

    } catch (error) {
        console.error('Error fetching pool activity:', error);
        return {
            hasActivity: false,
            ticketsLast10Min: 0,
            lastPurchaseTime: null,
            avgTimePerTicket: null,
            estimatedTimeToFill: null,
            recentActivities: []
        };
    }
}

/**
 * Estima el tiempo para llenar el pool
 * @param {number} avgTimePerTicket - Tiempo promedio por ticket en segundos
 * @param {number} remainingSlots - Cupos restantes
 * @returns {number|null} Tiempo estimado en segundos
 */
export function estimateTimeToFill(avgTimePerTicket, remainingSlots) {
    if (!avgTimePerTicket || avgTimePerTicket <= 0 || !remainingSlots || remainingSlots <= 0) {
        return null;
    }
    return Math.round(avgTimePerTicket * remainingSlots);
}

/**
 * Trunca una dirección de wallet
 * @param {string} address - Dirección completa
 * @returns {string} Dirección truncada
 */
export function truncateAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 5)}…${address.slice(-3)}`;
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
    if (diff < 120) return 'hace 1 min';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 7200) return 'hace 1h';
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    if (diff < 172800) return 'hace 1 día';

    return `hace ${Math.floor(diff / 86400)} días`;
}

/**
 * Formatea duración en segundos a texto legible
 * @param {number} seconds - Duración en segundos
 * @returns {string} Duración formateada
 */
export function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
        return `~${hours}h ${minutes}min`;
    } else if (hours > 0) {
        return `~${hours}h`;
    } else if (minutes > 0) {
        return `~${minutes} min`;
    } else {
        return 'menos de 1 min';
    }
}

/**
 * Formatea ritmo de tickets por tiempo
 * @param {number} avgTimePerTicket - Segundos por ticket
 * @returns {string} Ritmo formateado
 */
export function formatTicketRate(avgTimePerTicket) {
    if (!avgTimePerTicket || avgTimePerTicket <= 0) return 'N/A';

    if (avgTimePerTicket < 60) {
        return `~1 ticket cada ${Math.round(avgTimePerTicket)} seg`;
    } else if (avgTimePerTicket < 3600) {
        return `~1 ticket cada ${Math.round(avgTimePerTicket / 60)} min`;
    } else {
        return `~1 ticket cada ${Math.round(avgTimePerTicket / 3600)}h`;
    }
}

// Exportar constantes para referencia
export { ACTIVITY_WINDOW_MINUTES, ESTIMATION_SAMPLE_SIZE, MAX_RECENT_ACTIVITIES };
