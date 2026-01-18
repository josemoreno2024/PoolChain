import { useReadContract, useWriteContract, useAccount, useWatchContractEvent, usePublicClient, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import PoolChainABI from '../contracts/PoolChainABI.json';
import PoolChainFinalABI from '../contracts/PoolChain_Final.json';
import MockUSDTABI from '../contracts/MockUSDT.json';
import addresses from '../contracts/addresses.json';

const USDT_DECIMALS = 6;

export function usePoolChain() {
    const { address: userAddress } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState(null);

    // Detect network and get addresses
    const getNetworkKey = () => {
        if (chainId === 97) return 'bscTestnet';
        if (chainId === 5611) return 'opBNBTestnet';
        return 'bscTestnet'; // Default fallback
    };

    const networkKey = getNetworkKey();
    const poolChainAddress = addresses[networkKey]?.PoolChain_Final;
    const usdtAddress = addresses[networkKey]?.MockUSDT;

    // Select correct ABI based on network
    const getPoolChainABI = () => {
        if (chainId === 5611) return PoolChainFinalABI.abi; // opBNB Testnet - Final contract
        return PoolChainABI; // BSC Testnet - VRF contract (fallback)
    };

    const poolChainABI = getPoolChainABI();

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

    // Pool Status - Read ticketsSold directly (public variable)
    const { data: participantCount, refetch: refetchParticipantCount } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'ticketsSold',
        watch: true
    });

    // getCurrentPool doesn't exist in Simple contract, calculate manually
    const currentPool = participantCount ? Number(participantCount) * 2 * 10 ** 6 : 0;

    const { data: poolFilled, refetch: refetchPoolFilled } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'poolFilled',
        watch: true
    });

    const { data: winnersSelected, refetch: refetchWinnersSelected } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'winnersSelected',
        watch: true
    });

    // User participation - userTicketCount is a public mapping
    const { data: userTicketCount, refetch: refetchUserTicketCount } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'userTicketCount',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // User positions - Get array of position numbers owned by user
    const { data: rawUserPositions, refetch: refetchUserPositions } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getUserPositions',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // Convert BigInt positions to numbers
    const userPositions = rawUserPositions ? rawUserPositions.map(pos => Number(pos)) : [];

    // Claimable amount
    const { data: claimableAmount, refetch: refetchClaimableAmount } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getClaimable',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // Winners by group
    const { data: groupAWinners } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getGroupAWinners',
        watch: true
    });

    const { data: groupBWinners } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getGroupBWinners',
        watch: true
    });

    const { data: groupCWinners } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getGroupCWinners',
        watch: true
    });

    const { data: groupDWinners } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getGroupDWinners',
        watch: true
    });

    // Current round
    const { data: currentRound } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'currentRound',
        watch: true
    });

    // User's ticket IDs
    const { data: userTicketIds, refetch: refetchUserTicketIds } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getUserTickets',
        args: userAddress ? [userAddress] : undefined,
        watch: true
    });

    // For PoolChain_Simple, we need to check each position individually
    // Store occupied positions in state
    const [occupiedPositions, setOccupiedPositions] = useState(new Set());

    // Check positions 1-100 to see which are occupied
    useEffect(() => {
        const checkPositions = async () => {
            if (!poolChainAddress || !publicClient || chainId !== 5611) return; // Only for opBNB

            const occupied = new Set();
            const batchSize = 20; // Check 20 at a time

            for (let i = 1; i <= 100; i += batchSize) {
                const promises = [];
                for (let j = i; j < Math.min(i + batchSize, 101); j++) {
                    promises.push(
                        publicClient.readContract({
                            address: poolChainAddress,
                            abi: poolChainABI,
                            functionName: 'positionToAddress',
                            args: [BigInt(j)]
                        })
                    );
                }

                const results = await Promise.all(promises);
                results.forEach((address, idx) => {
                    if (address !== '0x0000000000000000000000000000000000000000') {
                        occupied.add(i + idx);
                    }
                });
            }

            setOccupiedPositions(occupied);
        };

        checkPositions();

        // Refresh every 5 seconds
        const interval = setInterval(checkPositions, 5000);
        return () => clearInterval(interval);
    }, [poolChainAddress, publicClient, chainId, poolChainABI, participantCount]);

    // For BSC Testnet with VRF contract, use getAllTickets if available
    const { data: allTickets } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'getAllTickets',
        watch: true,
        query: {
            enabled: chainId === 97 // Only for BSC Testnet
        }
    });

    // Calculate available positions based on network
    const availablePositions = chainId === 5611
        ? Array.from({ length: 100 }, (_, i) => i + 1).filter(pos => !occupiedPositions.has(pos))
        : []; // For BSC, would use getAvailablePositions if it exists


    // ========== EVENT LISTENERS ==========
    // Listen for draw events in real-time

    // Event: PoolFilled - When pool reaches 100 tickets
    useWatchContractEvent({
        address: poolChainAddress,
        abi: poolChainABI,
        eventName: 'PoolFilled',
        enabled: !!poolChainAddress,
        onLogs(logs) {
            console.log('🎰 POOL FILLED EVENT:', logs);
            const round = logs[0]?.args?.round;
            if (round) {
                localStorage.setItem('poolFilledRound', round.toString());
            }
        }
    });

    // Event: DrawExecuted - When random seed is generated
    useWatchContractEvent({
        address: poolChainAddress,
        abi: poolChainABI,
        eventName: 'DrawExecuted',
        enabled: !!poolChainAddress,
        onLogs(logs) {
            console.log('🎲 DRAW EXECUTED EVENT:', logs);
            const round = logs[0]?.args?.round;
            if (round) {
                localStorage.setItem('drawExecutedRound', round.toString());
            }
        }
    });

    // Event: WinnersSelected - When winners are determined
    useWatchContractEvent({
        address: poolChainAddress,
        abi: poolChainABI,
        eventName: 'WinnersSelected',
        enabled: !!poolChainAddress,
        onLogs(logs) {
            console.log('🏆 WINNERS SELECTED EVENT:', logs);
            const round = logs[0]?.args?.round;
            if (round) {
                const roundStr = round.toString();
                localStorage.setItem('lastDrawRound', roundStr);
                localStorage.setItem(`winnersSelected_${roundStr}`, 'true');

                // Trigger celebration in UI
                window.dispatchEvent(new CustomEvent('poolchain:winnersSelected', {
                    detail: { round: roundStr }
                }));
            }
        }
    });

    // Event: PrizeClaimed - When user claims prize
    useWatchContractEvent({
        address: poolChainAddress,
        abi: poolChainABI,
        eventName: 'PrizeClaimed',
        enabled: !!poolChainAddress && !!userAddress,
        onLogs(logs) {
            console.log('💰 PRIZE CLAIMED EVENT:', logs);
            // Refresh balances after claim
            refetchUSDTBalance();
            refetchClaimableAmount();
        }
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
                abi: poolChainABI,
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

            // Ensure it's a valid array (defensive programming)
            let positionsArray = Array.isArray(positions) ? positions : [positions];

            // Convert to BigInt for contract (viem expects BigInt for uint256[])
            const positionsBigInt = positionsArray.map(pos => BigInt(pos));

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: poolChainABI,
                functionName: 'buySpecificPositions',
                args: [positionsBigInt]
            });

            setTxHash(hash);

            // ✅ CRITICAL: Wait for transaction receipt to verify it actually succeeded
            console.log('⏳ Waiting for transaction confirmation...');
            const receipt = await publicClient.waitForTransactionReceipt({
                hash,
                confirmations: 1
            });

            console.log('📝 Transaction receipt:', receipt);

            // Check if transaction was successful
            if (receipt.status !== 'success') {
                throw new Error('Transaction failed on blockchain. Please check your wallet and try again.');
            }

            console.log('✅ Transaction confirmed successfully!');
            await refetchUSDTBalance();
            return hash;
        } catch (error) {
            console.error('Error buying positions:', error);
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
                abi: poolChainABI,
                functionName: 'claimPrize'
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

    // Perform Draw (Execute lottery)
    const performDraw = async () => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: poolChainABI,
                functionName: 'performDraw'
            });

            setTxHash(hash);
            console.log('⏳ Waiting for draw execution...');

            // Wait for transaction
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Verificar si la transacción fue exitosa
            if (receipt.status !== 'success') {
                console.error('❌ Transaction reverted on-chain:', receipt);
                throw new Error('La transacción falló en el contrato. Posibles causas: blockhash expiró, pool no lleno, o sorteo ya ejecutado.');
            }

            console.log('✅ Draw executed successfully!', receipt);

            // Los datos se actualizan automáticamente por los eventos del contrato
            // No necesitamos refetch manual aquí

            return hash;
        } catch (error) {
            console.error('Error executing draw:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Reset Round (Start new round)
    const resetRound = async () => {
        if (!poolChainAddress) {
            throw new Error('PoolChain contract not found');
        }

        try {
            setIsLoading(true);

            const hash = await writeContractAsync({
                address: poolChainAddress,
                abi: poolChainABI,
                functionName: 'resetRound'
            });

            setTxHash(hash);
            console.log('⏳ Waiting for round reset...');

            // Wait for transaction
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Verificar si la transacción fue exitosa
            if (receipt.status !== 'success') {
                console.error('❌ Transaction reverted on-chain:', receipt);
                throw new Error('La transacción de reset falló.');
            }

            console.log('✅ Round reset successfully!', receipt);

            return hash;
        } catch (error) {
            console.error('Error resetting round:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Mint Test USDT (Faucet)
    const mintTestUSDT = async () => {
        console.log('🔍 mintTestUSDT called');
        console.log('🔍 usdtAddress:', usdtAddress);
        console.log('🔍 userAddress:', userAddress);

        if (!usdtAddress) {
            console.error('❌ USDT contract not found');
            throw new Error('USDT contract not found');
        }

        try {
            setIsLoading(true);
            console.log('🔍 About to call writeContractAsync...');

            const hash = await writeContractAsync({
                address: usdtAddress,
                abi: MockUSDTABI.abi,
                functionName: 'faucet',
                args: []
            });

            console.log('✅ Transaction hash:', hash);
            setTxHash(hash);
            await refetchUSDTBalance();
            return hash;
        } catch (error) {
            console.error('❌ Error minting test USDT:', error);
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
        if (!userPositions || !group || group.length === 0) return false;
        // group contiene posiciones (números), userPositions también
        return group.some(position => userPositions.includes(Number(position)));
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
        userPositions: userPositions, // Array of position numbers (converted from BigInt)
        allTickets: allTickets || [],
        availablePositions: availablePositions || [],
        occupiedPositions: Array.from(occupiedPositions), // Convert Set to Array
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
        claimPrize,
        performDraw,
        resetRound,
        mintTestUSDT,


        // Refresh function - call after transactions
        refreshAllData: async () => {
            await Promise.all([
                refetchUSDTBalance(),
                refetchAllowance(),
                refetchParticipantCount(),
                // refetchCurrentPool() - removed, currentPool is now calculated
                refetchPoolFilled(),
                refetchWinnersSelected(),
                refetchUserTicketCount(),
                refetchUserPositions(),
                // refetchAllTickets() - removed, not used in Simple contract
                // refetchAvailablePositions() - removed, calculated from occupiedPositions
                refetchClaimableAmount()
            ]);
        },

        // Loading state
        isLoading,
        txHash,

        // Contract addresses
        poolChainAddress,
        usdtAddress,
        networkKey
    };
}
