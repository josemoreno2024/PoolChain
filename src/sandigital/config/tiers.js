// Configuración de todos los tiers del sistema SanDigital
export const TIERS = {
    micro: {
        id: 'micro',
        name: 'Micro',
        icon: '💎',
        entry: 10,
        exit: 20,
        adminFee: 1, // Fijo
        turnPayout: 4.5,
        globalPayout: 4.5,
        color: '#4CAF50',
        gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        description: 'Ideal para comenzar con bajo riesgo',
        features: [
            'Entrada accesible de 10 USDT',
            'Salida garantizada de 20 USDT',
            'Gas sistema $1',
            'Perfecto para probar el sistema'
        ],
        recommended: false
    },
    standard: {
        id: 'standard',
        name: 'Standard',
        icon: '⭐',
        entry: 20,
        exit: 40,
        adminFee: 1, // Fijo
        turnPayout: 9.5,
        globalPayout: 9.5,
        color: '#2196F3',
        gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        description: 'El más popular y equilibrado',
        features: [
            'Entrada estándar de 20 USDT',
            'Salida de 40 USDT (2x)',
            'Gas sistema $1',
            'Balance perfecto riesgo/retorno'
        ],
        recommended: true,
        popular: true
    },
    plus: {
        id: 'plus',
        name: 'Plus',
        icon: '🔥',
        entry: 30,
        exit: 60,
        adminFee: 1, // Fijo
        turnPayout: 14.5,
        globalPayout: 14.5,
        color: '#FF9800',
        gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
        description: 'Para usuarios con más capital',
        features: [
            'Entrada de 30 USDT',
            'Salida de 60 USDT (2x)',
            'Gas sistema $1',
            'Mayor volumen, mejor ratio'
        ],
        recommended: false
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        icon: '👑',
        entry: 40,
        exit: 80,
        adminFee: 1, // Fijo
        turnPayout: 19.5,
        globalPayout: 19.5,
        color: '#9C27B0',
        gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
        description: 'Para inversores serios',
        features: [
            'Entrada de 40 USDT',
            'Salida de 80 USDT (2x)',
            'Gas sistema $1',
            'Volumen alto, comisión baja'
        ],
        recommended: false
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        icon: '💰',
        entry: 50,
        exit: 100,
        adminFee: 1, // Fijo
        turnPayout: 24.5,
        globalPayout: 24.5,
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
        description: 'Máximo volumen y mejor comisión',
        features: [
            'Entrada de 50 USDT',
            'Salida de 100 USDT (2x)',
            'Gas sistema $1',
            'La mejor relación comisión/volumen'
        ],
        recommended: false,
        premium: true
    },
    ultra: {
        id: 'ultra',
        name: 'Ultra',
        icon: '🚀',
        entry: 100,
        exit: 200,
        adminFee: 1, // Fijo
        turnPayout: 49.5,
        globalPayout: 49.5,
        color: '#E91E63',
        gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
        description: 'Máximo volumen con mejor comisión',
        features: [
            'Entrada de 100 USDT',
            'Salida de 200 USDT (2x)',
            'Gas sistema $1',
            'El tier más exclusivo y rentable'
        ],
        recommended: false,
        ultra: true
    }
}

// Helper para obtener tier por ID
export const getTier = (tierId) => TIERS[tierId]

// Helper para obtener todos los tiers como array
export const getAllTiers = () => Object.values(TIERS)

// Helper para obtener tier recomendado
export const getRecommendedTier = () => getAllTiers().find(t => t.recommended)

// Helper para calcular comisión real en %
export const getCommissionPercentage = (tierId) => {
    const tier = getTier(tierId)
    return ((tier.adminFee / tier.entry) * 100).toFixed(1)
}
