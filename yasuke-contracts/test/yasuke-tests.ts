import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { assert } from "chai";

describe('YASUKE', function () {
    let yasuke: Contract;
    let store: Contract;
    let proxy: Contract;

    const blockTime = 3;
    const tokenIds: number[] = new Array(5).fill(0).map(x => Math.floor(Math.random() * 10000) + 1);
    const uri = 'http://xendbit.com/{0}';
    let accounts = [];

    before(async () => {
        const Storage = await ethers.getContractFactory("Storage"); 
        store = await Storage.deploy();
        await store.deployed();
        console.log("Store deployed to:", store.address);

        const Yasuke = await ethers.getContractFactory("Yasuke");
        yasuke = await Yasuke.deploy(uri, store.address);
        await yasuke.deployed();
        console.log("YASUKE deployed to:", yasuke.address);

        const Proxy = await ethers.getContractFactory("Proxy");
        proxy = await Proxy.deploy(yasuke.address);
        await proxy.deployed();
        console.log(`Proxy deployed to: ${proxy.address}`);
        
        accounts = await ethers.getSigners();
    });

    it('should initialize', async () => {
        assert.notEqual(yasuke.address, "0");
    });

    it('should mint token', async () => {
        const bn: number = await ethers.provider.getBlockNumber();
        // 1 block is 3 seconds        
        // 3 days = 3 * 24  * 60 * 60 secs
        const startBlock = 1;
        const endBlock = (3 * 24 * 60 * 60) / blockTime;
        tokenIds.forEach(async (x) => {
            await proxy.mint(x, 1, startBlock, endBlock, 0, 100);
        });
        console.log(`Block Number: ${bn}`);
    });

    it('should get token info', async () => {
        for(let i = 0; i < tokenIds.length; i++) {
            const info  = await yasuke.getTokenInfo(tokenIds[i]);
            const tid = info[0];
            const owner = info[1];
            const bidContract = info[2];
            console.log(`Token: ${tokenIds[i]} : ${bidContract}`);
            const url = info[3];
            assert.equal(tid, tokenIds[i]);
            assert.equal(uri, url);
            assert.equal(owner, accounts[0].address);
        }
    });

    it('should get auction info', async () => {
        for(let i = 0; i < tokenIds.length; i++) {
            const info = await yasuke.getAuctionInfo(tokenIds[i]);
            console.log(info);
        }
    });
})