require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-tracer");

require("dotenv").config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const METAMASK_WALLET_PVTKEY_DEPLOYER = process.env.METAMASK_WALLET_PVTKEY_DEPLOYER;


module.exports = {
  solidity: {
    compilers: [
      { version: "0.5.5" },
      { version: "0.5.0" } ,
      { version: "0.6.6" },
      { version: "0.8.8" },
      { version: "0.7.6" } ,
      { version: "0.8.0" } ,
      { version: "0.7.5" }
    ],
    overrides: {
      "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol": {
        version: "0.6.5",
        settings: { }
      }
    }
  },
  networks: {
    hardhat: {

      polygonMainnet : {
        url: "https://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN",
        accounts: ['0x8e50f5a4b7b93036892e68b11e78cf7434679fc2f8dc5e50268e1a6209e6fae0'],


      },

      forking: {
        enabled : true ,
        url: "https://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN",
        //blockNumber: 34779176,

      },
      mumbai : {
        url: "https://polygon-mumbai.g.alchemy.com/v2/XDB9x2UJeeMhtalAgave4qQjeZbj3A1v",
        accounts: [METAMASK_WALLET_PVTKEY_DEPLOYER]
      },
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
    outFile: "./gas-report.txt",
    noColors: true,
    coinmarketcap: "3ebaed2b-e2ea-4b2f-8d6b-14247e677634",
    token : "MATIC"
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },


};
