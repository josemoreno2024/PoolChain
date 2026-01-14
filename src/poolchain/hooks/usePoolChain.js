import { useReadContract, useWriteContract, useAccount, useWatchContractEvent } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';
import PoolChainABI from '../contracts/PoolChain_Micro_PositionSelect.json';
import MockUSDTABI from '../contracts/MockUSDT.json';
import addresses from '../contracts/addresses.json';

const USDT_DECIMALS = 6;

export function usePoolChain() {
    const { address: userAddress } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState(null);

    // Contract addresses
    const poolChainAddress = addresses.opBNBTestnet?.PoolChain_Micro_PositionSelect;
    const usdtAddress = addresses.opBNBTestnet?.MockUSDT;

    // ========== READ FUNCTIONS ==========

    // USDT Balance
    const { data: usdtBalance, refetch: refetchUSDTBalance } = useReadContract({
        address: usdtAddress,
        abi: MockUSDTABI.abi,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
        query: {
            refetchInterval: 2000, // Poll every 2 seconds
        }
    });

    // USDT Allowance
    const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
        address: usdtAddress,
        abi: MockUSDTABI.abi,
        functionName: 'allowance',
        args: userAddress ? [userAddress, poolChainAddress] : undefined,
        query: {
            refetchInterval: 2000, // Poll every 2 seconds
        }
    });

    // Pool Status
    const { data: participantCount, refetch: refetchParticipantCount } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getTicketCount',
        watch: true
    });

    const { data: currentPool, refetch: refetchCurrentPool } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getCurrentPool',
        watch: true
    });

    const { data: poolFilled, refetch: refetchPoolFilled } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'isPoolFilled',
        watch: true
    });

    const { data: winnersSelected, refetch: refetchWinnersSelected } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'areWinnersSelected',
        watch: true
    });

    // User participation - MultiTicket contract has getUserTicketCount
    const { data: userTicketCount, refetch: refetchUserTicketCount } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getUserTicketCount',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // Claimable amount
    const { data: claimableAmount, refetch: refetchClaimableAmount } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getClaimable',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // Winners by group
    const { data: groupAWinners } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getGroupAWinners',
        watch: true
    });

    const { data: groupBWinners } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getGroupBWinners',
        watch: true
    });

    const { data: groupCWinners } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getGroupCWinners',
        watch: true
    });

    const { data: groupDWinners } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getGroupDWinners',
        watch: true
    });

    // Current round
    const { data: currentRound } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'currentRound',
        watch: true
    });

    // User's ticket IDs
    const { data: userTicketIds, refetch: refetchUserTicketIds } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getUserTickets',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // All tickets in the pool (to get positions)
    const { data: allTickets, refetch: refetchAllTickets } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getAllTickets',
        watch: true
    });

    // Available positions
    const { data: availablePositions, refetch: refetchAvailablePositions } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getAvailablePositions',
        watch: true
    });

    // ========== WRITE FUNCTIONS ==========

    const { writeContractAsync } = useWriteContract();

    // Approve USDT
    const approveUSDT = async (amount = '1000') => {
        if (!usdtAddress || !poolChainAddress) {
            throw new Error('Contract addresses not found');
        }

        try {
            setIsLoading(true);
            const amountWei = parseUnits(amount, USDT_DECIMALS);

            const hash = await writeContractAsync({
                address: usdtAddress,
                abi: MockUSDTABI.abi,
                functionName: 'approve',
                args: [poolChainAddress, amountWei]
            });

            setTxHash(hash);
            await refetchAllowance();
            return hash;
        } catch (error) {
            console.error('Error approving USDT:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Buy Ticket
    const buyTicket = async (quantity = 1) => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: PoolChainABI.abi,
                functionName: 'buyTicket',
                args: [quantity]
            });

            setTxHash(hash);
            await refetchUSDTBalance();
            return hash;
        } catch (error) {
            console.error('Error buying ticket:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Buy Tickets at Specific Positions
    const buySpecificPositions = async (positions) => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            // Debug: Check what we received
            console.log('📥 Received positions:', positions);
            console.log('📥 Type:', typeof positions);
            console.log('📥 Is Array:', Array.isArray(positions));

            // Ensure it's a valid array
            let positionsArray = Array.isArray(positions) ? positions : [positions];

            // Convert to BigInt for contract (viem expects BigInt for uint256[])
            const positionsBigInt = positionsArray.map(pos => BigInt(pos));

            console.log('✅ Sending to contract:', positionsBigInt);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: PoolChainABI.abi,
                functionName: 'buySpecificPositions',
                args: [positionsBigInt]
            });

            setTxHash(hash);
            await refetchUSDTBalance();
            return hash;
        } catch (error) {
            console.error('Error buying positions:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Execute Draw (Admin only)
    const executeDraw = async () => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: PoolChainABI.abi,
                functionName: 'executeDraw'
            });

            setTxHash(hash);
            return hash;
        } catch (error) {
            console.error('Error executing draw:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Claim Prize
    const claimPrize = async () => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: PoolChainABI.abi,
                functionName: 'claim'
            });

            setTxHash(hash);
            await refetchUSDTBalance();
            return hash;
        } catch (error) {
            console.error('Error claiming prize:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Mint Test USDT (Faucet)
    const mintTestUSDT = async () => {
        if (!usdtAddress) {
            throw new Error('USDT contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: usdtAddress,
                abi: MockUSDTABI.abi,
                functionName: 'mint',
                args: [userAddress, parseUnits('1000', USDT_DECIMALS)]
            });

            setTxHash(hash);
            await refetchUSDTBalance();
            return hash;
        } catch (error) {
            console.error('Error minting test USDT:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ========== HELPER FUNCTIONS ==========

    const formatUSDT = (value) => {
        if (!value) return '0.00';
        return parseFloat(formatUnits(value, USDT_DECIMALS)).toFixed(2);
    };

    const isApproved = (ticketPriceUSDT = 2) => {
        if (!usdtAllowance) return false;
        const ticketPrice = parseUnits(ticketPriceUSDT.toString(), USDT_DECIMALS);
        return BigInt(usdtAllowance) >= ticketPrice;
    };

    const isUserInGroup = (group) => {
        if (!userAddress || !group) return false;
        return group.some(addr => addr.toLowerCase() === userAddress.toLowerCase());
    };

    return {
        // Balances
        usdtBalance: formatUSDT(usdtBalance),
        usdtAllowance: formatUSDT(usdtAllowance),

        // Pool status
        participantCount: participantCount ? Number(participantCount) : 0,
        currentPool: formatUSDT(currentPool),
        poolFilled: poolFilled || false,
        winnersSelected: winnersSelected || false,
        currentRound: currentRound ? Number(currentRound) : 1,

        // User status
        hasParticipated: userTicketCount ? Number(userTicketCount) > 0 : false,
        userTicketCount: userTicketCount ? Number(userTicketCount) : 0,
        userTicketIds: userTicketIds || [],
        userPositions: userTicketIds || [], // Alias for compatibility
        allTickets: allTickets || [],
        availablePositions: availablePositions || [],
        claimableAmount: formatUSDT(claimableAmount),
        isApproved,

        // Winners
        groupAWinners: groupAWinners || [],
        groupBWinners: groupBWinners || [],
        groupCWinners: groupCWinners || [],
        groupDWinners: groupDWinners || [],

        // User in groups
        isInGroupA: isUserInGroup(groupAWinners),
        isInGroupB: isUserInGroup(groupBWinners),
        isInGroupC: isUserInGroup(groupCWinners),
        isInGroupD: isUserInGroup(groupDWinners),

        // Actions
        approveUSDT,
        buySpecificPositions,
        executeDraw,
        claimPrize,
        mintTestUSDT,

        // Refresh function - call after transactions
        refreshAllData: async () => {
            await Promise.all([
                refetchUSDTBalance(),
                refetchAllowance(),
                refetchParticipantCount(),
                refetchCurrentPool(),
                refetchPoolFilled(),
                refetchWinnersSelected(),
                refetchUserTicketCount(),
                refetchUserTicketIds(),
                refetchAllTickets(),
                refetchAvailablePositions(),
                refetchClaimableAmount()
            ]);
        },

        // Loading state
        isLoading,
        txHash,

        // Contract addresses
        poolChainAddress,
        usdtAddress
    };
}
