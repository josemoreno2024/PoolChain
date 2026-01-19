// Vercel Serverless Function - Alchemy Proxy
// Protege las API Keys manteniéndolas en el servidor

const ALCHEMY_KEYS = {
    micro: process.env.ALCHEMY_API_KEY_MICRO,
    standard: process.env.ALCHEMY_API_KEY_STANDARD,
    plus: process.env.ALCHEMY_API_KEY_PLUS,
    premium: process.env.ALCHEMY_API_KEY_PREMIUM,
    elite: process.env.ALCHEMY_API_KEY_ELITE,
    ultra: process.env.ALCHEMY_API_KEY_ULTRA
}

// Métodos permitidos (solo lectura segura)
const ALLOWED_METHODS = [
    'eth_blockNumber',
    'eth_getBalance',
    'eth_call',
    'eth_getTransactionReceipt',
    'eth_getTransactionByHash',
    'eth_getLogs',
    'eth_getCode',
    'eth_getStorageAt'
]

export default async function handler(req, res) {
    // 1. CORS restrictivo
    const allowedOrigins = [
        'https://sandigital.com',
        'https://www.sandigital.com',
        process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
        process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
    ].filter(Boolean)

    const origin = req.headers.origin

    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({
            error: 'Origin not allowed',
            code: 'FORBIDDEN_ORIGIN'
        })
    }

    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        })
    }

    // 2. Validar tier
    const { tier, method, params } = req.body

    if (!tier || !ALCHEMY_KEYS[tier]) {
        return res.status(400).json({
            error: 'Invalid tier',
            code: 'INVALID_TIER'
        })
    }

    // 3. Validar método permitido
    if (!ALLOWED_METHODS.includes(method)) {
        return res.status(403).json({
            error: `Method ${method} not allowed`,
            code: 'METHOD_NOT_ALLOWED',
            allowedMethods: ALLOWED_METHODS
        })
    }

    // 4. Validar que la API key existe
    const apiKey = ALCHEMY_KEYS[tier]
    if (!apiKey) {
        console.error(`Missing API key for tier: ${tier}`)
        return res.status(500).json({
            error: 'Configuration error',
            code: 'MISSING_API_KEY'
        })
    }

    // 5. Hacer request a Alchemy
    try {
        const network = process.env.NETWORK || 'sepolia'
        const url = `https://eth-${network}.g.alchemy.com/v2/${apiKey}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method,
                params: params || []
            })
        })

        const data = await response.json()

        // 6. Log para auditoría (sin exponer keys)
        console.log(`[${new Date().toISOString()}] [${tier}] ${method} - Status: ${response.status}`)

        // 7. Verificar errores de Alchemy
        if (data.error) {
            console.error(`Alchemy error for ${tier}:`, data.error)
        }

        return res.status(200).json(data)
    } catch (error) {
        console.error('Alchemy proxy error:', error)
        return res.status(500).json({
            error: 'Internal server error',
            code: 'PROXY_ERROR'
        })
    }
}
