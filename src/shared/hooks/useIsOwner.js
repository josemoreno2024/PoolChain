import { useAccount, useReadContract } from 'wagmi'
import addresses from '../../contracts/addresses.json'
import SanDigitalABI from '../../contracts/SanDigital2026.json'

/**
 * Hook para verificar si la wallet conectada es el owner del contrato
 * @returns {Object} { isOwner: boolean, isLoading: boolean, ownerAddress: string }
 */
export function useIsOwner() {
    const { address } = useAccount()

    const { data: ownerAddress, isLoading } = useReadContract({
        address: addresses.sanDigital2026,
        abi: SanDigitalABI,
        functionName: 'owner',
    })

    const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase()

    return {
        isOwner: !!isOwner,
        isLoading,
        ownerAddress,
    }
}
