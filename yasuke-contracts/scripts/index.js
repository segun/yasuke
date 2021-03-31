// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

var ethJsUtil = require('ethereumjs-util');

async function main() {
  const uri = 'http://xendbit.com/{0}';

  accounts = await ethers.getSigners();

  const deploy_store = false;
  const deploy_yasuke = false;
  const upgrade_yasuke = false;

  let storeAddress = "0xe2F1A18a63C7b95D242Fa2307297637b4D60c542";
  let yasukeAddress = "0x346cd3f4d07FDcC38D0d72448b3E77DcB39D5A90";
  let webProvider = "https://data-seed-prebsc-1-s1.binance.org:8545/";
  let provider = new ethers.providers.JsonRpcProvider(webProvider);
  let yasukeAbi = JSON.parse(fs.readFileSync(path.resolve('./artifacts/contracts/Yasuke.sol/Yasuke.json'), 'utf8')).abi;
  let yasukeContract = new ethers.Contract(yasukeAddress, yasukeAbi, provider);
  let yasuke = await yasukeContract.connect(accounts[0]);

  if (deploy_store) {
    const Storage = await ethers.getContractFactory("Storage");
    store = await Storage.deploy();
    await store.deployed();
    console.log("Store deployed to:", store.address);
    storeAddress = store.address;
  }

  if (upgrade_yasuke) {
    // call upgrade on previous contract
    let index = await provider.getTransactionCount(accounts[0].address)
    console.log(index);
    let newAddress = ethJsUtil.toChecksumAddress(ethJsUtil.bufferToHex(ethJsUtil.generateAddress("0x94Ce615ca10EFb74cED680298CD7bdB0479940bc", index + 1)));
    console.log(`New Address: ${newAddress}`);
    await yasuke.upgrade(newAddress);
    console.log("Upgrade Successful");
  }

  if (deploy_yasuke) {
    const Yasuke = await ethers.getContractFactory("Yasuke");
    yasuke = await Yasuke.deploy(storeAddress);
    //yasuke = await Yasuke.deploy(store.address);
    await yasuke.deployed();
    console.log("YASUKE deployed to:", yasuke.address);
  }

  const x = Math.floor(Math.random() * 10000) + 1;
  const auctionId = Math.floor(Math.random() * 999) + 1;
  const name = `TITAN Token${x}`;
  const symbol = `TTITAN${x}`;

  try {
    await yasuke.issueToken(x, accounts[0].address, uri, name, symbol);
    console.log(`Token ${x} issued`);
    const minBid = ethers.utils.parseEther("100");
    const sellNowPrice = ethers.utils.parseEther("1000");
    const blockTime = 3;
    const block = await provider.getBlock("latest");
    const startBlock = block.number;
    console.log(startBlock);    
    const threeDays = (3 * 24 * 60 * 60) / blockTime;
    const endBlock = startBlock + threeDays;
    console.log(endBlock);
    try {
        await yasuke.startAuction(x, auctionId, startBlock, endBlock, sellNowPrice, minBid);
        console.log('Auction Started Successfully');
    } catch (e) {
        console.log(e);
    }    
    const tInfo = await yasuke.getTokenInfo(x);
    console.log(tInfo);
  } catch (e) {
    console.log(e);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
