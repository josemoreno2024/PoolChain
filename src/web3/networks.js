// opBNB Network Configuration for Wagmi
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
        default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
        public: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
    },
    blockExplorers: {
        default: {
            name: 'opBNBScan Testnet',
            url: 'https://testnet.opbnbscan.com'
        },
    },
    testnet: true,
}

export const opBNB = {
    id: 204,
    name: 'opBNB',
    network: 'opbnb',
    nativeCurrency: {
        decimals: 18,
        name: 'BNB',
        symbol: 'BNB',
    },
    rpcUrls: {
        default: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
        public: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
    },
    blockExplorers: {
        default: {
            name: 'opBNBScan',
            url: 'https://opbnbscan.com'
        },
    },
    testnet: false,
}
