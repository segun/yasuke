//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './library/models.sol';
import './interfaces/StorageInterface.sol';
import './interfaces/PhysicalArtsInterface.sol';
import './interfaces/YasukeInterface.sol';

// TODO: Calculate Fees
contract Yasuke is YasukeInterface, ReentrancyGuard {
    using SafeMath for uint256;
    address internal minter;

    StorageInterface internal store;
    PhysicalArtsInterface internal physicalStore;

    address internal burnAddress = 0x000000000000000000000000000000000000dEaD;

    constructor(address storeAddress, address physicalStoreAddress) {
        minter = msg.sender;
        store = StorageInterface(storeAddress);
        store.setAdmin(address(this), msg.sender);

        physicalStore = PhysicalArtsInterface(physicalStoreAddress);
        physicalStore.setAdmin(address(this), msg.sender);
    }

    function startAuction(
        uint256 tokenId,
        uint256 auctionId,
        uint256 startBlock,
        uint256 endBlock,
        uint256 currentBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) public override nonReentrant {
        Token t = store.getToken(tokenId);
        require(t.ownerOf(tokenId) == msg.sender, 'WO');
        require(!store.isInAuction(tokenId), 'AIP');
        require(!store.isStarted(tokenId, auctionId), 'AAS');
        Models.AuctionInfo memory ai = Models.AuctionInfo(
            auctionId,
            tokenId,
            msg.sender,
            startBlock,
            endBlock,
            currentBlock,
            sellNowPrice,
            address(0),
            0,
            false,
            minimumBid,
            store.getBidders(tokenId, auctionId),
            store.getBids(tokenId, auctionId),
            true,
            false,
            false
        );
        store.startAuction(ai);
    }

    function sellNow(uint256 tokenId, uint256 sellNowPrice) public {
        physicalStore.sellNow(tokenId, sellNowPrice);
    }

    function bought(uint256 tokenId) public {
        physicalStore.bought(tokenId);
    }

    function issueToken(
        uint256 tokenId,
        address payable owner,
        string memory _uri,
        string memory _name,
        string memory _symbol,
        bool isPhysicalArt
    ) public override nonReentrant {
        Token t = new Token(owner, _uri, _name, _symbol);
        require(t.mint(tokenId), 'MF');
        if(isPhysicalArt) {
            physicalStore.addToken(tokenId, t);
        } else {
            store.addToken(tokenId, t);
            store.setOwner(tokenId, owner);
        }
    }

    function endBid(uint256 tokenId, uint256 auctionId) public nonReentrant {
        require(msg.sender == minter, 'no access');
        shouldBeStarted(tokenId, auctionId);
        store.setEndBlock(tokenId, auctionId, block.number); // forces the auction to end
    }

    function placeBid(uint256 tokenId, uint256 auctionId) public payable override nonReentrant {
        require(tx.origin == msg.sender, 'EOA');
        Token t = store.getToken(tokenId);
        shouldBeStarted(tokenId, auctionId);
        require(msg.value > 0, 'CNB0');
        require(msg.sender != t.ownerOf(tokenId), 'OCB');

        uint256 sellNowPrice = store.getSellNowPrice(tokenId, auctionId);

        uint256 newBid = msg.value;

        if (newBid >= sellNowPrice && sellNowPrice != 0) {
            store.setEndBlock(tokenId, auctionId, block.number); // forces the auction to end

            // refund bidder the difference if any
            uint256 difference = newBid.sub(sellNowPrice);
            if (difference > 0) {
                (bool sent, ) = payable(msg.sender).call{value: difference, gas: 2300}('');
                require(sent, 'BFMB');
            }

            // bid should now be max bid
            newBid = sellNowPrice;
            store.setSellNowTriggered(tokenId, auctionId, true);
        } else {
            require(newBid > store.getHighestBid(tokenId, auctionId), 'BTL');
        }

        // get current highest bidder and highest bid
        address payable highestBidder = payable(store.getHighestBidder(tokenId, auctionId));
        uint256 highestBid = store.getHighestBid(tokenId, auctionId);

        // refund highest bidder their bid
        if (highestBidder != address(0)) {
            // this is the not first bid
            (bool sent, ) = payable(highestBidder).call{value: highestBid, gas: 2300}('');
            require(sent, 'HBRF');
        }

        store.setHighestBidder(tokenId, auctionId, msg.sender);
        store.setHighestBid(tokenId, auctionId, newBid);
        store.addBidder(tokenId, auctionId, msg.sender);
        store.addBid(tokenId, auctionId, newBid);

        emit LogBid(msg.sender, newBid);

        if (newBid >= sellNowPrice && sellNowPrice != 0) {            
            _withdrawal(tokenId, auctionId);
        }
    }

    function _endBid(uint256 tokenId, uint256 auctionId) internal {
        store.setInAuction(tokenId, false); // we can create new auction
        store.setFinished(tokenId, auctionId, true);
        store.setStarted(tokenId, auctionId, false);
        store.setHighestBidder(tokenId, auctionId, address(0));
        store.setHighestBid(tokenId, auctionId, 0);
    }

    function _withdrawal(uint256 tokenId, uint256 auctionId) internal {
        require(tx.origin == msg.sender, 'EOA');
        Token t = store.getToken(tokenId);
        require(store.isStarted(tokenId, auctionId), 'BANS');
        require(store.isInAuction(tokenId), 'ANE');
        bool cancelled = store.isCancelled(tokenId, auctionId);
        address payable owner = payable(t.ownerOf(tokenId));
        address highestBidder = store.getHighestBidder(tokenId, auctionId);
        uint256 withdrawalAmount = store.getHighestBid(tokenId, auctionId);

        if (cancelled) {
            // owner can not withdraw anything
            require(msg.sender != owner, 'AWC');
            _endBid(tokenId, auctionId);
            // refund highest bidder
            (bool sent, ) = payable(highestBidder).call{value: withdrawalAmount, gas: 2300}('');
            require(sent, 'CNCOCNRHB');
        } else {
            // try change ownership
            bool changeOwnershipSuccess = t.changeOwnership(tokenId, owner, highestBidder);
            // if failed...refund highest bidder, end auction
            if (changeOwnershipSuccess == false) {
                // end auction
                _endBid(tokenId, auctionId);
                // refund highest bidder
                (bool sent, ) = payable(highestBidder).call{value: withdrawalAmount, gas: 2300}('');
                require(sent, 'CNCOCNRHB');
            } else {
                // withdraw funds from highest bidder
                _withdrawOwner(tokenId, auctionId, owner);
                store.setOwner(tokenId, highestBidder);
                _endBid(tokenId, auctionId);
                emit LogWithdrawal(msg.sender, tokenId, auctionId);
            }
        }
    }

    function _withdrawOwner(uint256 tokenId, uint256 auctionId, address payable owner) internal {
        require(tx.origin == msg.sender, 'EOA');
        Token t = store.getToken(tokenId);
        uint256 withdrawalAmount = store.getHighestBid(tokenId, auctionId);

        if (withdrawalAmount == 0) {
            return;
        }

        store.setHighestBid(tokenId, auctionId, 0);

        // we have to take fees
        uint256 xfp = store.getXendFeesPercentage();
        uint256 ifp = store.getIssuerFeesPercentage();

        if (t.getIssuer() == owner) {
            // no issuer fees,
            ifp = 0;
        }

        uint256 xendFees = (xfp.mul(withdrawalAmount)).div(100);
        uint256 issuerFees = (ifp.mul(withdrawalAmount)).div(100);

        withdrawalAmount = withdrawalAmount.sub(xendFees).sub(issuerFees);

        bool sent = false;
        if (issuerFees > 0) {
            (sent, ) = payable(t.getIssuer()).call{value: issuerFees, gas: 2300}('');
            require(sent, 'CNSTI');
        }

        if (xendFees > 0) {
            (sent, ) = payable(store.getXendFeesAddress()).call{value: xendFees, gas: 2300}('');
            require(sent, 'CNSTXND');
        }

        (sent, ) = payable(owner).call{value: withdrawalAmount, gas: 2300}('');
        require(sent, 'WF');
    }

    function withdraw(uint256 tokenId, uint256 auctionId) public override nonReentrant {
        _withdrawal(tokenId, auctionId);
    }

    function getTokenInfo(uint256 tokenId) public view override returns (Models.Asset memory) {
        Token t = store.getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        bool isInAuction = store.isInAuction(tokenId);
        bool isInSale = store.isInSale(tokenId);
        uint256 price = store.getNoBiddingPrice(tokenId);
        Models.Asset memory a = Models.Asset(
            tokenId,
            t.ownerOf(tokenId),
            t.getIssuer(),
            address(t),
            t.name(),
            t.symbol(),
            isInAuction,
            isInSale,
            price
        );
        return a;
    }

    function getAuctionInfo(uint256 tokenId, uint256 auctionId) public view override returns (Models.AuctionInfo memory) {
        Models.AuctionInfo memory b = store.getAuction(tokenId, auctionId);
        return b;
    }

    function shouldBeStarted(uint256 tokenId, uint256 auctionId) public view {
        require(block.number >= store.getStartBlock(tokenId, auctionId), 'ANC');
        require(block.number <= store.getEndBlock(tokenId, auctionId), 'AE');
        require(!store.isCancelled(tokenId, auctionId), 'AC');
        require(store.isStarted(tokenId, auctionId), 'ANS');
        require(store.isInAuction(tokenId), 'ANIP');
    }

    function setIssuerFeesPercentage(uint256 perc) public override {
        require(msg.sender == minter, 'access denied');
        store.setIssuerFeesPercentage(perc);
    }

    function setXendFeesAddress(address payable add) public override {
        require(msg.sender == minter, 'access denied');
        store.setXendFeesAddress(add);
    }
}
