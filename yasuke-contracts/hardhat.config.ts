import '@nomiclabs/hardhat-waffle';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-etherscan';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "M8W4UQJ3AE2XYK5R8VIDV9HRX4387M4BBX"
  },  
  bscscan: {
    apiKey:"M8W4UQJ3AE2XYK5R8VIDV9HRX4387M4BBX"
  },
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    }
  },
  networks: {
    polygon: {
      url: "https://matic-testnet-archive-rpc.bwarelabs.com ",
      accounts: ["a0fe146ffa60dce047073a847332a46b263f7daa0147f4d98ee1f9c1dda5d43b"],
    },
    tbsc: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545",
      accounts: ["a0fe146ffa60dce047073a847332a46b263f7daa0147f4d98ee1f9c1dda5d43b"],
    },
    harmony: {
      url: "https://api.s0.b.hmny.io",
      accounts: ["a0fe146ffa60dce047073a847332a46b263f7daa0147f4d98ee1f9c1dda5d43b"],
    },    
    sokol: {
      url: "https://sokol.poa.network",
      accounts: ["a0fe146ffa60dce047073a847332a46b263f7daa0147f4d98ee1f9c1dda5d43b"],      
    }
  },
  mocha: {
    timeout: 120000
  },
};


// M8W4UQJ3AE2XYK5R8VIDV9HRX4387M4BBX

// Store deployed to: 0x961DF5777a70Ce13BEA9b9FEd94F71cCB9E1d4dC
// YASUKE deployed to: 0xAeBCf9f55D996e201e545C9795363b4Be9BDb548