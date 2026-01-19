// Cliente de Alchemy que usa el proxy backend
// Las API Keys NUNCA se exponen al navegador

class AlchemyClient {
    constructor(tier) {
        this.tier = tier

        // URL del proxy (backend)
        this.proxyUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/api/alchemy-proxy'
            : '/api/alchemy-proxy' // Relativo en producción (Vercel)
    }

    /**
     * Hacer request a Alchemy a través del proxy
     * @param {string} method - Método RPC (ej: 'eth_blockNumber')
     * @param {array} params - Parámetros del método
     * @returns {Promise} Resultado del RPC
     */
    async request(method, params = []) {
        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tier: this.tier,
                    method,
                    params
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || `HTTP ${response.status}`)
            }

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error.message || JSON.stringify(data.error))
            }

            return data.result
        } catch (error) {
            console.error(`[AlchemyClient][${this.tier}] Request failed:`, error)
            throw error
        }
    }

    // ==========================================
    // Métodos Helper (Blockchain Queries)
    // ==========================================

    /**
     * Obtener el número del último bloque
     */
    async getBlockNumber() {
        return this.request('eth_blockNumber')
    }

    /**
     * Obtener balance de una dirección
     * @param {string} address - Dirección de la wallet
     */
    async getBalance(address) {
        return this.request('eth_getBalance', [address, 'latest'])
    }

    /**
     * Llamar a un contrato (lectura)
     * @param {object} transaction - Objeto de transacción
     */
    async call(transaction) {
        return this.request('eth_call', [transaction, 'latest'])
    }

    /**
     * Obtener recibo de transacción
     * @param {string} hash - Hash de la transacción
     */
    async getTransactionReceipt(hash) {
        return this.request('eth_getTransactionReceipt', [hash])
    }

    /**
     * Obtener transacción por hash
     * @param {string} hash - Hash de la transacción
     */
    async getTransaction(hash) {
        return this.request('eth_getTransactionByHash', [hash])
    }

    /**
     * Obtener logs (eventos)
     * @param {object} filter - Filtro de logs
     */
    async getLogs(filter) {
        return this.request('eth_getLogs', [filter])
    }

    /**
     * Obtener código de un contrato
     * @param {string} address - Dirección del contrato
     */
    async getCode(address) {
        return this.request('eth_getCode', [address, 'latest'])
    }

    /**
     * Obtener storage de un contrato
     * @param {string} address - Dirección del contrato
     * @param {string} position - Posición del storage
     */
    async getStorageAt(address, position) {
        return this.request('eth_getStorageAt', [address, position, 'latest'])
    }
}

export default AlchemyClient

// ==========================================
// Uso en componentes:
// ==========================================
//
// import AlchemyClient from './alchemyClient'
//
// const client = new AlchemyClient('micro')
// const blockNumber = await client.getBlockNumber()
// const balance = await client.getBalance('0x...')
