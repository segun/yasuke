import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { assert } from "chai";

describe('YASUKE', function () {
    let yasuke: Contract;
    let store: Contract;

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
        yasuke = await Yasuke.deploy(store.address);
        await yasuke.deployed();
        console.log("YASUKE deployed to:", yasuke.address);

        accounts = await ethers.getSigners();
    });

    it('should initialize', async () => {
        assert.notEqual(yasuke.address, "0");
    });

    it('should issue token', async () => {
        const owner = accounts[2].address;
        tokenIds.forEach(async (x) => {
            const name = `Token Number ${x}`;
            const symbol = `TOKEN${x}`;
            try {
                await yasuke.issueToken(x, owner, uri, name, symbol);
            } catch (e) {
                console.log(e);
                assert(false);
            }
        });
        const bn: number = await ethers.provider.getBlockNumber();
        assert.isNumber(bn);
    });

    it(`should start the auction`, async () => {
        // 1 block is 3 seconds        
        // 3 days = 3 * 24  * 60 * 60 secs
        const startBlock = 1;
        //const endBlock = (3 * 24 * 60 * 60) / blockTime;
        const endBlock = 200;
        let y2k = await yasuke.connect(accounts[2]);
        tokenIds.forEach(async (x) => {
            const minBid = ethers.utils.parseEther("100");
            const sellNowPrice = ethers.utils.parseEther("1000");
            try {
                await y2k.startAuction(x, startBlock, endBlock, sellNowPrice, minBid);
            } catch (e) {
                console.log(e);
                assert(false);
            }
        });
        const bn: number = await ethers.provider.getBlockNumber();
        assert.isNumber(bn);        
    });

    it('should get token info', async () => {
        for (let i = 0; i < tokenIds.length; i++) {
            const info = await yasuke.getTokenInfo(tokenIds[i]);
            const tid = info[0].toNumber();
            const owner = info[1];
            const contract = info[2];
            assert.equal(tid, tokenIds[i]);
            assert.equal(owner, accounts[2].address);
        }
        const bn: number = await ethers.provider.getBlockNumber();
        assert.isNumber(bn);
    });

    it('should get auction info', async () => {
        for (let i = 0; i < tokenIds.length; i++) {
            const info = await yasuke.getAuctionInfo(tokenIds[i]);
            const tid = info[0].toNumber();
            const owner = info[1];
            const startBlock = info[2].toNumber();
            const endBlock = info[3].toNumber();
            const sellNowPrice = ethers.utils.formatEther(info[4]);
            const highestBidder = info[5];
            const highestBid = ethers.utils.formatEther(info[6]);
            const cancelled = info[7];
            const minBid = ethers.utils.formatEther(info[8]);

            assert.equal(tid, tokenIds[i]);
            assert.equal(owner, accounts[2].address);
            assert.equal(startBlock, 1);
            assert.equal(endBlock, 200);
            assert.equal(+sellNowPrice, 1000);
            assert.equal(highestBidder, "0x0000000000000000000000000000000000000000");
            assert.equal(+highestBid, 100);
            assert.equal(cancelled, false);
            assert.equal(minBid, highestBid);
        }
        const bn: number = await ethers.provider.getBlockNumber();
        assert.isNumber(bn);
    });

    it('should place bid', async () => {
        let y2k = await yasuke.connect(accounts[1]);
        for (let i = 0; i < tokenIds.length; i++) {
            let toSend = 100.1;
            let overrides = {
                value: ethers.utils.parseEther(toSend + "")
            };
            try {
                await y2k.placeBid(tokenIds[i], overrides);
            } catch (e) {
                console.log(e);
                assert(false);
            }
        }

        const bn: number = await ethers.provider.getBlockNumber();
        assert.isNumber(bn);
    });

    it('should not place bid because owners can not bid', async () => {
        for (let i = 0; i < tokenIds.length; i++) {
            let toSend = 100.02;
            let overrides = {
                value: ethers.utils.parseEther(toSend + "")
            };
            try {
                await yasuke.placeBid(tokenIds[i], overrides);
            } catch (e) {
                assert.notEqual(e, undefined);
            }
        }
    });
})