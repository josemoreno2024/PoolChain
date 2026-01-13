// src/config/alchemy.js
// Configuración segura de Alchemy para multi-tier

/**
 * Configuración de Alchemy por tier
 * Las API Keys se obtienen de variables de entorno (.env)
 * NUNCA hardcodear las keys en este archivo
 */

export const ALCHEMY_CONFIG = {
    micro: {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_MICRO,
        tier: 'micro',
        name: 'Micro',
        entry: 10,
        exit: 20
    },
    standard: {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_STANDARD,
        tier: 'standard',
        name: 'Standard',
        entry: 20,
        exit: 40
    },
    plus: {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_PLUS,
        tier: 'plus',
        name: 'Plus',
        entry: 30,
        exit: 60
    },
    premium: {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_PREMIUM,
        tier: 'premium',
        name: 'Premium',
        entry: 40,
        exit: 80
    },
    elite: {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_ELITE,
        tier: 'elite',
        name: 'Elite',
        entry: 50,
        exit: 100
    },
    ultra: {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_ULTRA,
        tier: 'ultra',
        name: 'Ultra',
        entry: 100,
        exit: 200
    }
}

/**
 * Obtener configuración de Alchemy para un tier específico
 * @param {string} tierId - ID del tier (micro, standard, plus, premium, elite, ultra)
 * @returns {object} Configuración de Alchemy para el tier
 */
export const getAlchemyConfig = (tierId) => {
    const config = ALCHEMY_CONFIG[tierId]

    if (!config) {
        throw new Error(`Tier no válido: ${tierId}`)
    }

    if (!config.apiKey) {
        throw new Error(`API Key no configurada para tier: ${tierId}. Verifica tu archivo .env`)
    }

    return config
}

/**
 * Obtener todas las API Keys configuradas
 * @returns {object} Objeto con todas las API keys por tier
 */
export const getAllAlchemyKeys = () => {
    return Object.entries(ALCHEMY_CONFIG).reduce((acc, [tier, config]) => {
        acc[tier] = config.apiKey
        return acc
    }, {})
}

/**
 * Verificar que todas las API Keys estén configuradas
 * @returns {boolean} true si todas las keys están configuradas
 */
export const validateAlchemyKeys = () => {
    const missingKeys = Object.entries(ALCHEMY_CONFIG)
        .filter(([_, config]) => !config.apiKey)
        .map(([tier]) => tier)

    if (missingKeys.length > 0) {
        console.error('❌ API Keys faltantes para tiers:', missingKeys)
        console.error('Verifica tu archivo .env')
        return false
    }

    console.log('✅ Todas las API Keys de Alchemy configuradas correctamente')
    return true
}

/**
 * Obtener URL de RPC para un tier específico
 * @param {string} tierId - ID del tier
 * @param {string} network - Red (sepolia, opbnb-mainnet, etc.)
 * @returns {string} URL completa del RPC
 */
export const getAlchemyRpcUrl = (tierId, network = 'sepolia') => {
    const config = getAlchemyConfig(tierId)

    const networkUrls = {
        'sepolia': `https://eth-sepolia.g.alchemy.com/v2/${config.apiKey}`,
        'opbnb-testnet': `https://opbnb-testnet.g.alchemy.com/v2/${config.apiKey}`,
        'opbnb-mainnet': `https://opbnb-mainnet.g.alchemy.com/v2/${config.apiKey}`
    }

    return networkUrls[network] || networkUrls['sepolia']
}

export default ALCHEMY_CONFIG
