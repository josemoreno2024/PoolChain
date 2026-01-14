import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import addresses from '../../contracts/addresses.json'
import SanDigitalABI from '../../contracts/SanDigital2026.json'

/**
 * Hook para leer el historial de claims de un usuario desde eventos
 * Sin costo de gas - Lee eventos públicos de la blockchain
 */
export function useClaimHistory(userAddress) {
    const [totalClaimed, setTotalClaimed] = useState('0.00')
    const [claimCount, setClaimCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const publicClient = usePublicClient()

    useEffect(() => {
        if (!userAddress || !publicClient) return

        async function fetchClaimHistory() {
            setIsLoading(true)
            try {
                // Obtener el bloque actual
                const currentBlock = await publicClient.getBlockNumber()

                // Buscar solo en los últimos 5,000 bloques (seguro para free tier)
                const blocksToSearch = 5000n
                const fromBlock = currentBlock > blocksToSearch
                    ? currentBlock - blocksToSearch
                    : 0n

                // Leer eventos Claim filtrados por usuario
                const claimEvents = await publicClient.getLogs({
                    address: addresses.sanDigital2026,
                    event: {
                        type: 'event',
                        name: 'Claim',
                        inputs: [
                            { type: 'address', indexed: true, name: 'user' },
                            { type: 'uint256', indexed: true, name: 'positionId' },
                            { type: 'uint256', indexed: false, name: 'amount' }
                        ]
                    },
                    args: {
                        user: userAddress
                    },
                    fromBlock: fromBlock,
                    toBlock: 'latest'
                })

                // Leer eventos ClaimAll filtrados por usuario
                const claimAllEvents = await publicClient.getLogs({
                    address: addresses.sanDigital2026,
                    event: {
                        type: 'event',
                        name: 'ClaimAll',
                        inputs: [
                            { type: 'address', indexed: true, name: 'user' },
                            { type: 'uint256', indexed: false, name: 'totalAmount' }
                        ]
                    },
                    args: {
                        user: userAddress
                    },
                    fromBlock: fromBlock,
                    toBlock: 'latest'
                })

                // Sumar ambos tipos de eventos
                let total = 0n

                // Sumar claims individuales
                for (const event of claimEvents) {
                    const amount = event.args.amount
                    total += amount
                }

                // Sumar claimAll
                for (const event of claimAllEvents) {
                    const amount = event.args.totalAmount
                    total += amount
                }

                const totalCount = claimEvents.length + claimAllEvents.length
                setClaimCount(totalCount)
                setTotalClaimed(formatUnits(total, 6))
            } catch (error) {
                console.error('Error fetching claim history:', error)
                setTotalClaimed('0.00')
                setClaimCount(0)
            } finally {
                setIsLoading(false)
            }
        }

        fetchClaimHistory()
    }, [userAddress, publicClient])

    return {
        totalClaimed,
        claimCount,
        isLoading
    }
}
