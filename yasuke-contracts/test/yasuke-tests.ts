import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { assert } from 'chai';

describe('YASUKE', function () {
    let yasuke: Contract;
    let store: Contract;

    const blockTime = 3;
    let auctionId = 9;
    const snp = '250';
    const tokenIds: number[] = new Array(5).fill(0).map((x) => Math.floor(Math.random() * 10000) + 1);
    const uri = 'http://xendbit.com/{0}';
    let accounts: any[] = [];

    before(async () => {
        const Storage = await ethers.getContractFactory('Storage');
        store = await Storage.deploy();
        await store.deployed();
        console.log('Store deployed to:', store.address);

        const PhysicalArts = await ethers.getContractFactory("PhysicalArts");
        const physicalStore = await PhysicalArts.deploy();
        await physicalStore.deployed();
        console.log("Physical Store deployed to:", physicalStore.address);

        const Yasuke = await ethers.getContractFactory('Yasuke');
        yasuke = await Yasuke.deploy(store.address, physicalStore.address);
        await yasuke.deployed();
        console.log('YASUKE deployed to:', yasuke.address);

        accounts = await ethers.getSigners();
    });

    it('should initialize', async () => {
        assert.notEqual(yasuke.address, '0');
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
            const minBid = ethers.utils.parseEther('100');
            const sellNowPrice = ethers.utils.parseEther(snp);
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
            assert.equal(+sellNowPrice, +snp);
            assert.equal(highestBidder, '0x0000000000000000000000000000000000000000');
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
                value: ethers.utils.parseEther(toSend + ''),
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
                value: ethers.utils.parseEther(toSend + ''),
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
                value: ethers.utils.parseEther(toSend + ''),
            };
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
        assert.equal(+sellNowPrice, +snp);
        assert.equal(highestBidder, accounts[7].address);
        assert.equal(+highestBid, 108.0);
        assert.equal(cancelled, false);
        assert.equal(+minBid, 100.0);
    });

    it('should withdraw from owner amount', async () => {
        let balance = await ethers.provider.getBalance(accounts[2].address);
        const balanceBefore = Math.round(+ethers.utils.formatEther(balance));

        let y2k = await yasuke.connect(accounts[2]);
        await y2k.withdraw(tokenIds[0], auctionId);
        balance = await ethers.provider.getBalance(accounts[2].address);
        const balanceAfter = Math.round(+ethers.utils.formatEther(balance));
        assert.equal(balanceAfter < balanceBefore + 108.0 && balanceAfter > balanceBefore, true);

        let info = await y2k.getTokenInfo(tokenIds[0]);
        assert.equal(info.owner, accounts[7].address);
    });

    it('should fail to withdraw from owner a second time', async () => {
        let y2k = await yasuke.connect(accounts[2]);
        try {
            await y2k.withdraw(tokenIds[0], auctionId);
        } catch (e) {
            assert.notEqual(e, undefined);
        }
    });

    it('should have withdrawn highest bidder token', async () => {
        let y2k = await yasuke.connect(accounts[7]);
        let info = await yasuke.getTokenInfo(tokenIds[0]);
        assert.equal(info[1], accounts[7].address);
        info = await yasuke.getAuctionInfo(tokenIds[0], auctionId);
        const started = info[13];
        const finished = info[14];
        assert.isFalse(started);
        assert.isTrue(finished);
    });

    it('should start another auction from bought token', async () => {
        const startBlock = 1;
        const endBlock = 200;
        let y2k = await yasuke.connect(accounts[7]);
        const minBid = ethers.utils.parseEther('100');
        const sellNowPrice = ethers.utils.parseEther(snp);
        auctionId = 99;

        let info = await y2k.getTokenInfo(tokenIds[0]);
        assert.equal(info.owner, accounts[7].address);

        await y2k.startAuction(tokenIds[0], auctionId, startBlock, endBlock, startBlock, sellNowPrice, minBid);

        // place multiple bids
        let toSend = 100.5;
        for (let i = 3; i <= 9; i++) {
            if (i != 7) {
                // owner is 7
                toSend += 1.5;
                let y2k = await yasuke.connect(accounts[i]);
                let overrides = {
                    value: ethers.utils.parseEther(toSend + ''),
                };
                await y2k.placeBid(tokenIds[0], auctionId, overrides);
            }
        }

        // end bid
        await yasuke.endBid(tokenIds[0], auctionId);

        // call withdraw (by anybody really)
        let balance = await ethers.provider.getBalance(accounts[7].address);
        const balanceBefore = Math.round(+ethers.utils.formatEther(balance));

        await y2k.withdraw(tokenIds[0], auctionId);
        balance = await ethers.provider.getBalance(accounts[7].address);
        const balanceAfter = Math.round(+ethers.utils.formatEther(balance));
        assert.equal(balanceAfter < balanceBefore + 108.0 && balanceAfter > balanceBefore, true);

        info = await y2k.getTokenInfo(tokenIds[0]);
        assert.equal(info.owner, accounts[9].address);
    });

    it('should place a bid to match buy now', async () => {
        const owner = accounts[5].address;
        let y2k = await yasuke.connect(accounts[5]);

        const tokenId = 888;
        const auctionId = 999;
        await y2k.issueToken(tokenId, owner, uri, 'SIMI', 'SYM');
        const startBlock = 1;
        const endBlock = 200;

        const minBid = ethers.utils.parseEther('100');
        const sellNowPrice = ethers.utils.parseEther(snp);

        await y2k.startAuction(tokenId, auctionId, startBlock, endBlock, startBlock, sellNowPrice, minBid);

        let toSend = 250;
        let overrides = {
            value: ethers.utils.parseEther(toSend + ''),
        };

        let balance = await ethers.provider.getBalance(accounts[5].address);
        const balanceBefore = Math.round(+ethers.utils.formatEther(balance));

        y2k = await yasuke.connect(accounts[3]);
        await y2k.placeBid(tokenId, auctionId, overrides);

        balance = await ethers.provider.getBalance(accounts[5].address);
        const balanceAfter = Math.round(+ethers.utils.formatEther(balance));
        assert.equal(balanceAfter < balanceBefore + 250 && balanceAfter > balanceBefore, true);

        let info = await y2k.getTokenInfo(tokenId);
        assert.equal(info.owner, accounts[3].address);

        info = await yasuke.getAuctionInfo(tokenId, auctionId);
        const tid = info[0].toNumber();
        const b_owner = info[2];
        const b_startBlock = info[3].toNumber();
        const b_endBlock = info[4].toNumber();
        const b_sellNowPrice = ethers.utils.formatEther(info[6]);
        const started = info[13];
        const finished = info[14];
        const sellNowTriggered = info[15];

        assert.equal(tid, tokenId);
        assert.equal(b_owner, accounts[3].address);
        assert.equal(b_startBlock, 1);
        assert.notEqual(b_endBlock, 200);
        assert.equal(+b_sellNowPrice, +snp);
        assert.isTrue(sellNowTriggered);
        assert.isFalse(started);
        assert.isTrue(finished);
    });

    // it('Should sell now', async () => {
    //     try {
    //         const owner = accounts[2].address
    //         const tokenId = 5
    //         const name = `Token Number 5`
    //         const symbol = `TOKEN5`
    //         await yasuke.issueToken(tokenId, owner, uri, name, symbol)
    //         const y2k = await yasuke.connect(accounts[2])
    //         await y2k.sellNow(tokenId, 5, true)
    //         const info = await yasuke.getTokenInfo(tokenId)
    //         assert.isTrue(info.onSale)
    //     } catch (err) {
    //         console.log(err)
    //         assert(false)
    //     }
    // })

    // it('Should buy after sale with token', async () => {
    //     try {
    //         const tokenId = 5
    //         // give me some tokens
    //         await legalTender.mint(accounts[3].address, 100000)
    //         // allow the contract to spend on my behalf
    //         // const l3K = await legalTender.connect(accounts[3]);
    //         // await l3K.approve(yasuke.address, 5);
    //         // buy
    //         const y2k = await yasuke.connect(accounts[3])
    //         await y2k.buyNow(tokenId)
    //         const info = await yasuke.getTokenInfo(tokenId)
    //         console.log('Info: 2', info)
    //         assert.isFalse(info.onSale)
    //     } catch (err) {
    //         console.log(err)
    //         assert(false)
    //     }
    // })

    // it('Should sell and buy with BNB', async () => {
    //     try {
    //         const tokenId = 5
    //         let y2k = await yasuke.connect(accounts[3])
    //         await y2k.sellNow(tokenId, 5, false)
    //         let info = await yasuke.getTokenInfo(tokenId)
    //         assert.isTrue(info.onSale)

    //         // buy
    //         let toSend = 100.1
    //         let overrides = {
    //             value: ethers.utils.parseEther('5'),
    //         }
    //         y2k = await yasuke.connect(accounts[4])
    //         await y2k.buyNow(tokenId, overrides)
    //         info = await yasuke.getTokenInfo(tokenId)
    //         assert.isFalse(info.onSale)
    //     } catch (err) {
    //         console.log(err)
    //         assert(false)
    //     }
    // })
});
