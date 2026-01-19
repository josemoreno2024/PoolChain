import { http, createConfig, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Definir BSC Testnet chain
export const bscTestnet = {
    id: 97,
    name: 'BNB Smart Chain Testnet',
    network: 'bsc-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'BNB',
        symbol: 'tBNB',
    },
    rpcUrls: {
        default: {
            http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        },
        public: {
            http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        },
    },
    blockExplorers: {
        default: {
            name: 'BSCScan Testnet',
            url: 'https://testnet.bscscan.com',
        },
    },
    testnet: true,
}

// Definir opBNB Testnet chain
export const opBNBTestnet = {
    id: 5611,
    name: 'opBNB Testnet',
    network: 'opbnb-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'BNB',
        symbol: 'tBNB',
    },
    rpcUrls: {
        default: {
            http: ['https://opbnb-testnet-rpc.bnbchain.org'],
        },
        public: {
            http: ['https://opbnb-testnet-rpc.bnbchain.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'opBNBScan Testnet',
            url: 'https://testnet.opbnbscan.com',
        },
    },
    testnet: true,
}

// Definir opBNB Mainnet chain
export const opBNB = {
    id: 204,
    name: 'opBNB Mainnet',
    network: 'opbnb-mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'BNB',
        symbol: 'BNB',
    },
    rpcUrls: {
        default: {
            http: ['https://opbnb-mainnet-rpc.bnbchain.org'],
        },
        public: {
            http: ['https://opbnb-mainnet-rpc.bnbchain.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'opBNBScan',
            url: 'https://opbnbscan.com',
        },
    },
    testnet: false,
}

// Storage personalizado que NO guarda nada (evita auto-reconexión errática)
const noopStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
}

// Clave API de Alchemy proporcionada por el usuario
const alchemyKey = 'di9OyaKVjkEvKTA_AsdB7'

export const config = createConfig({
    chains: [sepolia, bscTestnet, opBNBTestnet, opBNB],
    connectors: [
        injected(),
    ],
    transports: {
        [sepolia.id]: fallback([
            // 1. Alchemy (Batch enabled) - Prioridad Alta
            http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`, {
                batch: true
            }),
            // 2. Fallbacks Públicos - Si Alchemy falla o se agota
            http('https://rpc.sepolia.org'),
            http('https://ethereum-sepolia-rpc.publicnode.com'),
            http('https://sepolia.drpc.org'),
        ]),
        [bscTestnet.id]: fallback([
            http('https://data-seed-prebsc-1-s1.binance.org:8545'),
            http('https://data-seed-prebsc-2-s1.binance.org:8545'),
            http('https://bsc-testnet.publicnode.com'),
        ]),
        [opBNBTestnet.id]: fallback([
            http('https://opbnb-testnet-rpc.bnbchain.org'),
            http('https://opbnb-testnet.nodereal.io/v1/e9a36765eb8a40b9bd12e680a1fd2bc5'),
        ]),
        [opBNB.id]: fallback([
            http('https://opbnb-mainnet-rpc.bnbchain.org'),
            http('https://opbnb-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3'),
            http('https://opbnb.publicnode.com'),
        ]),
    },
    ssr: false,
    storage: noopStorage,
})
