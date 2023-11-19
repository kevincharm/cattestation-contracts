import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.23',
        settings: {
            evmVersion: 'paris',
            viaIR: false,
            optimizer: {
                enabled: true,
                runs: 100,
            },
        },
    },
    networks: {
        hardhat: {
            forking: {
                enabled: true,
                url: process.env.ARB_ONE_URL as string,
                blockNumber: 151801295,
            },
            accounts: {
                count: 10,
            },
        },
        arb1: {
            chainId: 0xa4b1,
            url: process.env.ARB_ONE_URL as string,
            accounts: [process.env.MAINNET_PK as string],
        },
        sepolia: {
            chainId: 11155111,
            url: process.env.SEPOLIA_URL as string,
            accounts: [process.env.MAINNET_PK as string],
        },
    },
    abiExporter: {
        path: './exported-abi',
        runOnCompile: true,
        clear: true,
        flat: true,
        spacing: 2,
        only: ['Cattestation'],
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY as string,
            arbitrumOne: process.env.ARBISCAN_API_KEY as string,
            sepolia: process.env.ETHERSCAN_API_KEY as string,
        },
    },
}

export default config
