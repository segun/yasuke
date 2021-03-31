import '@nomiclabs/hardhat-waffle';
import 'hardhat-contract-sizer';


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
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20000
      }
    },
    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    }
  },
  networks: {
    tbsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: ["498ea38b2b6408be76d6c45b2939c2f195a16ac4bca7e62772fc549c7a798176"],
    },
    sokol: {
      url: "https://sokol.poa.network",
      accounts: ["498ea38b2b6408be76d6c45b2939c2f195a16ac4bca7e62772fc549c7a798176"],
      // gas: 582876,
      // gasPrice: 10000000000
    }    
  },    
};

