require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            metadata: {
                bytecodeHash: "none"
            }
        }
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 97,
            gasPrice: 10000000000, // 10 gwei
        },
        opBNBTestnet: {
            url: "https://opbnb-testnet-rpc.bnbchain.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 5611,
            gasPrice: 1000000000, // 1 gwei
        },
        opBNB: {
            url: "https://opbnb-mainnet-rpc.bnbchain.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 204,
            gasPrice: 1000000000, // 1 gwei
        },
        bscMainnet: {
            url: "https://bsc-dataseed1.binance.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 56,
            gasPrice: 3000000000, // 3 gwei
        }
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY || ""
    }
};
