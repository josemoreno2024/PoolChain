import { useReadContract, useWriteContract, useAccount, useWatchContractEvent } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';
import PoolChainABI from '../../contracts/PoolChain_Micro_Mock.json';
import MockUSDTABI from '../../contracts/MockUSDT.json';
import addresses from '../../contracts/addresses.json';

const USDT_DECIMALS = 6;

export function usePoolChain() {
    const { address: userAddress } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState(null);

    // Contract addresses
    const poolChainAddress = addresses.opBNBTestnet?.PoolChain_Micro_Mock;
    const usdtAddress = addresses.opBNBTestnet?.MockUSDT;

    // ========== READ FUNCTIONS ==========

    // USDT Balance
    const { data: usdtBalance, refetch: refetchUSDTBalance } = useReadContract({
        address: usdtAddress,
        abi: MockUSDTABI.abi,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // USDT Allowance
    const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
        address: usdtAddress,
        abi: MockUSDTABI.abi,
        functionName: 'allowance',
        args: userAddress ? [userAddress, poolChainAddress] : undefined,
        watch: true
    });

    // Pool Status
    const { data: participantCount } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getParticipantCount',
        watch: true
    });

    const { data: currentPool } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'getCurrentPool',
        watch: true
    });

    const { data: poolFilled } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'isPoolFilled',
        watch: true
    });

    const { data: winnersSelected } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'areWinnersSelected',
        watch: true
    });

    // User participation
    const { data: hasParticipated } = useReadContract({
        address: poolChainAddress,
        abi: PoolChainABI.abi,
        functionName: 'hasParticipated',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // Claimable amount
    const { data: claimableAmount } = useReadContract({
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
    const buyTicket = async () => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: PoolChainABI.abi,
                functionName: 'buyTicket'
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

    // ========== HELPER FUNCTIONS ==========

    const formatUSDT = (value) => {
        if (!value) return '0.00';
        return parseFloat(formatUnits(value, USDT_DECIMALS)).toFixed(2);
    };

    const isApproved = () => {
        if (!usdtAllowance) return false;
        const ticketPrice = parseUnits('2', USDT_DECIMALS);
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
        hasParticipated: hasParticipated || false,
        claimableAmount: formatUSDT(claimableAmount),
        isApproved: isApproved(),

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
        buyTicket,
        executeDraw,
        claimPrize,

        // Loading state
        isLoading,
        txHash,

        // Contract addresses
        poolChainAddress,
        usdtAddress
    };
}
