import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { assert } from "chai";

describe('YASUKE', function () {
    let yasuke: Contract;
    let store: Contract;

    const blockTime = 3;
    let auctionId = 9;
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
                await y2k.startAuction(x, auctionId, startBlock, endBlock, startBlock, sellNowPrice, minBid);
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
            const info = await yasuke.getAuctionInfo(tokenIds[i], auctionId);
            const tid = info[0].toNumber();
            const aid = info[1].toNumber();
            const owner = info[2];
            const startBlock = info[3].toNumber();
            const endBlock = info[4].toNumber();
            const currentBlock = info[5].toNumber();
            const sellNowPrice = ethers.utils.formatEther(info[6]);
            const highestBidder = info[7];
            const highestBid = ethers.utils.formatEther(info[8]);
            const cancelled = info[9];
            const minBid = ethers.utils.formatEther(info[10]);

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
                await y2k.placeBid(tokenIds[i], auctionId, overrides);
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
                await yasuke.placeBid(tokenIds[i], auctionId, overrides);
            } catch (e) {
                assert.notEqual(e, undefined);
            }
        }
    });

    it('should place multiple bids on a token', async () => {
        let toSend = 100.5;
        for (let i = 3; i < 8; i++) {
            toSend += 1.5;
            let y2k = await yasuke.connect(accounts[i]);
            let overrides = {
                value: ethers.utils.parseEther(toSend + "")
            }
            try {
                await y2k.placeBid(tokenIds[0], auctionId, overrides);
            } catch (e) {
                console.log(e);
                assert(false);
            }
        }
    });

    it('should force-end the auction', async () => {
        try {
            await yasuke.endBid(tokenIds[0], auctionId);
        } catch (e) {
            console.log(e);
            assert(false);
        }
    });

    it('should not force-end an already ended auction', async () => {
        try {
            await yasuke.endBid(tokenIds[0], auctionId);
        } catch (e) {
            assert.notEqual(e, undefined);
        }
    });

    it('should get completed auction info', async () => {
        const info = await yasuke.getAuctionInfo(tokenIds[0], auctionId);
        const tid = info[0].toNumber();
        const aid = info[1].toNumber();
        const owner = info[2];
        const startBlock = info[3].toNumber();
        const endBlock = info[4].toNumber();
        const currentBlock = info[5].toNumber();
        const sellNowPrice = ethers.utils.formatEther(info[6]);
        const highestBidder = info[7];
        const highestBid = ethers.utils.formatEther(info[8]);
        const cancelled = info[9];
        const minBid = ethers.utils.formatEther(info[10]);

        assert.equal(tid, tokenIds[0]);
        assert.equal(owner, accounts[2].address);
        assert.equal(startBlock, 1);
        assert.notEqual(endBlock, 200);
        assert.equal(+sellNowPrice, 1000);
        assert.equal(highestBidder, accounts[7].address);
        assert.equal(+highestBid, 108.0);
        assert.equal(cancelled, false);
        assert.equal(+minBid, 100.0);
    });

    it('should withdraw owner amount', async () => {
        let balance = await ethers.provider.getBalance(accounts[2].address);
        const balanceBefore = Math.round(+ethers.utils.formatEther(balance));

        let y2k = await yasuke.connect(accounts[2]);
        try {
            await y2k.withdraw(tokenIds[0], auctionId);
            balance = await ethers.provider.getBalance(accounts[2].address);
            const balanceAfter = Math.round(+ethers.utils.formatEther(balance));
            assert.equal(balanceAfter <= (balanceBefore + 108.0) && balanceAfter >= balanceBefore, true);
        } catch (e) {
            console.log(e);
            assert(false);
        }
    });

    it('should fail to withdraw from owner a second time', async () => {
        let y2k = await yasuke.connect(accounts[2]);
        try {
            await y2k.withdraw(tokenIds[0], auctionId);
        } catch (e) {
            assert.notEqual(e, undefined);
        }
    });

    it('should withdraw highest bidder token', async () => {
        let y2k = await yasuke.connect(accounts[7]);
        try {
            let info = await yasuke.getTokenInfo(tokenIds[0]);
            assert.equal(info[1], accounts[2].address);            
            await y2k.withdraw(tokenIds[0], auctionId);
            info = await yasuke.getTokenInfo(tokenIds[0]);
            assert.equal(info[1], accounts[7].address);
        } catch (e) {
            console.log(e);
            assert(false);
        }
    });

    it('should withdraw other bidders', async () => {
        for (let i = 3; i < 7; i++) {
            try {
                let balance = await ethers.provider.getBalance(accounts[i].address);
                const balanceBefore = Math.round(+ethers.utils.formatEther(balance));
                let y2k = await yasuke.connect(accounts[i]);
                await y2k.withdraw(tokenIds[0], auctionId);
                balance = await ethers.provider.getBalance(accounts[i].address);
                const balanceAfter = Math.round(+ethers.utils.formatEther(balance));
                assert.isAbove(balanceAfter, balanceBefore);
            } catch (e) {
                console.log(e);
                assert(false);
            }
        }
    });

    it('should fail to withdraw other bidders after withdraw', async () => {
        for (let i = 3; i < 7; i++) {
            try {
                let y2k = await yasuke.connect(accounts[i]);
                await y2k.withdraw(tokenIds[0], auctionId);
            } catch (e) {
                assert.notEqual(e, undefined);
            }
        }
    });

    it('should start another auction from bought token', async () => {
        const startBlock = 1;
        const endBlock = 200;
        let y2k = await yasuke.connect(accounts[7]);
        const minBid = ethers.utils.parseEther("100");
        const sellNowPrice = ethers.utils.parseEther("1000");
        auctionId = 99;
        try {
            await y2k.startAuction(tokenIds[0], auctionId, startBlock, endBlock, startBlock, sellNowPrice, minBid);
        } catch (e) {
            console.log(e);
            assert(false);
        }
        const bn: number = await ethers.provider.getBlockNumber();
        assert.isNumber(bn);
    });
})