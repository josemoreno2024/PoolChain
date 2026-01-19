// Utility functions for wallet and signature management

/**
 * Abbreviate an Ethereum address
 * @param {string} address - Full Ethereum address
 * @returns {string} - Abbreviated address (0x1234...abcd)
 */
export function abbreviateAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Create signature message for terms acceptance
 * @param {string} address - User's wallet address
 * @param {number} chainId - Current chain ID
 * @returns {string} - Message to be signed
 */
export function createTermsMessage(address, chainId) {
    const timestamp = new Date().toISOString()

    return `SAN Digital 2026 - Aceptación de Condiciones

Confirmo que:
• He leído y entendido las condiciones de participación
• Participo de forma voluntaria
• No espero garantías de tiempo ni resultados
• Entiendo que SAN Digital NO es una inversión

Timestamp: ${timestamp}
Address: ${address}
ChainId: ${chainId}
App Version: v1`
}

/**
 * Save signature to localStorage
 * @param {string} address - User's wallet address
 * @param {string} signature - Signature hash
 * @param {string} message - Original message
 * @param {number} chainId - Chain ID
 */
export function saveSignature(address, signature, message, chainId) {
    const data = {
        address,
        signature,
        message,
        chainId,
        timestamp: new Date().toISOString(),
        appVersion: 'v1'
    }
    localStorage.setItem('san-digital-signature', JSON.stringify(data))
}

/**
 * Get saved signature from localStorage
 * @returns {object|null} - Saved signature data or null
 */
export function getSavedSignature() {
    const data = localStorage.getItem('san-digital-signature')
    if (!data) return null

    try {
        return JSON.parse(data)
    } catch (e) {
        return null
    }
}

/**
 * Clear saved signature
 */
export function clearSignature() {
    localStorage.removeItem('san-digital-signature')
}

/**
 * Validate if saved signature is still valid for current address and chain
 * @param {string} address - Current wallet address
 * @param {number} chainId - Current chain ID
 * @returns {boolean} - True if signature is valid
 */
export function isSignatureValid(address, chainId) {
    const saved = getSavedSignature()
    if (!saved) return false

    // Check if address matches (case-insensitive)
    if (saved.address.toLowerCase() !== address.toLowerCase()) return false

    // Check if chainId matches
    if (saved.chainId !== chainId) return false

    // Check if appVersion matches
    if (saved.appVersion !== 'v1') return false

    return true
}
