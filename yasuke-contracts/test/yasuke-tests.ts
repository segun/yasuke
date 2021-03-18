import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { assert } from "chai";

describe('YASUKE', function () {
    let yasuke: Contract;
    const blockTime = 3;
    const tokenIds: number[] = new Array(5).fill(0).map(x => Math.floor(Math.random() * 10000) + 1);
    const uri = 'http://xendbit.com/{0}';
    let accounts = [];

    before(async () => {
        const YASUKE = await ethers.getContractFactory("YASUKE");
        yasuke = await YASUKE.deploy(uri);
        await yasuke.deployed();
        console.log("YASUKE deployed to:", yasuke.address);
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
            await yasuke.mint(x, 1, startBlock, endBlock, 0);
        });
        console.log(`Block Number: ${bn}`);
    });

    it('should get token info', async () => {
        for(let i = 0; i < tokenIds.length; i++) {
            const info  = await yasuke.getTokenInfo(tokenIds[i]);
            const tid = info[0];
            const owner = info[1];
            const bidContract = info[2];
            const url = info[3];
            assert.equal(tid, tokenIds[i]);
            assert.equal(uri, url);
            assert.equal(owner, accounts[0].address);
        }
    });
})