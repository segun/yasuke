//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import './Storage.sol';
import './library/console.sol';
import './library/models.sol';
import './interfaces/StorageInterface.sol';
import './interfaces/YasukeInterface.sol';

contract Yasuke is YasukeInterface {
    using SafeMath for uint256;
    address internal minter;

    StorageInterface internal store;
    Token internal token;

    constructor(address storeAddress) {
        minter = msg.sender;
        store = StorageInterface(storeAddress);
        store.setAdmin(address(this));
    }

    function upgrade(address newYasuke) public {
        require(msg.sender == minter);
        store.setAdmin(newYasuke);
    }

    function startAuction(
        uint256 tokenId,
        uint256 startBlock,
        uint256 endBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) public override {
        Token t = store.getToken(tokenId);
        require(t.ownerOf(tokenId) == msg.sender, 'WO');  
        Models.AuctionInfo memory ai = Models.AuctionInfo(tokenId, msg.sender, startBlock, endBlock, sellNowPrice, address(0), 0, false, minimumBid);
        store.startAuction(ai);
    }

    function issueToken(
        uint256 tokenId,
        address owner,
        string memory _uri,
        string memory _name,
        string memory _symbol
    ) public override {
        require(msg.sender == minter, 'NAM');
        Token t = new Token(owner, _uri, _name, _symbol);
        require(t.mint(tokenId), 'MF');
        store.addToken(tokenId, t);
        store.setOwner(tokenId, owner);
    }

    function endBid(uint256 tokenId) public {
        require(msg.sender == minter, 'NAM');
    }

    function placeBid(uint256 tokenId)
        public
        payable
        override
    {
        require(store.isStarted(tokenId), 'ANS');
        require(msg.value > 0, 'CNB0');
        require(block.number >= store.getStartBlock(tokenId), 'ANS');
        require(block.number <= store.getEndBlock(tokenId), 'AE');
        require(!store.isCancelled(tokenId), 'AC');
        require(msg.sender != store.getOwner(tokenId), "OCB");        

        uint256 fundsByBidder = store.getFundsByBidder(tokenId, msg.sender);
        uint256 sellNowPrice = store.getSellNowPrice(tokenId);

        uint256 newBid = msg.value.add(fundsByBidder);

        if (newBid >= sellNowPrice && sellNowPrice != 0) {
            store.setEndBlock(tokenId, block.number); // forces the auction to end

            // refund bidder the difference if any
            uint256 difference = newBid.sub(sellNowPrice);
            if (difference > 0) {
                bool sent = msg.sender.send(difference);
                require(sent, 'BFMB');
            }

            // bid should now be max bid
            newBid = sellNowPrice;
        } else {
            require(newBid > store.getHighestBid(tokenId), 'BTL');
        }

        store.setFundsByBidder(tokenId, msg.sender, newBid);
        store.setHighestBidder(tokenId, msg.sender);
        store.setHighestBid(tokenId, newBid);
        store.addBidder(tokenId, msg.sender);
        store.addBid(tokenId, newBid);

        emit LogBid(msg.sender, newBid);
    }

    function withdraw(uint256 tokenId) public override {
        require(block.number > store.getEndBlock(tokenId) || store.isCancelled(tokenId));
        bool cancelled = store.isCancelled(tokenId);
        address owner = store.getOwner(tokenId);
        address highestBidder = store.getHighestBidder(tokenId);
        if (cancelled) {
            // owner can not withdraw anything, everyone should be refunded
            require(msg.sender != owner, 'AWC');
        } else {
            // if the bidding is not cancelled, highest bidder can not withdraw
            // TODO: When highest bidder call withdraw, transfer token from owner to highest bidder
            Token t = store.getToken(tokenId);
            t.transferFrom(owner, msg.sender, tokenId);
        }

        // everyone else that participated, but didn't win should be allowed to withdraw their funds.
        uint256 withdrawalAmount = store.getFundsByBidder(tokenId, msg.sender);
        address payable withdrawalAccount = msg.sender;

        if (withdrawalAccount == owner) {
            // owner should be allowed to withdrawal highestBid only if highestbidder is not address(0)
            require(store.getHighestBidder(tokenId) != address(0));
            withdrawalAmount = store.getHighestBid(tokenId);
        }

        require(withdrawalAmount > 0, 'ZW');
        store.setFundsByBidder(tokenId, withdrawalAccount, store.getFundsByBidder(tokenId, withdrawalAccount).sub(withdrawalAmount));

        bool sent = withdrawalAccount.send(withdrawalAmount);

        require(sent, 'WF');

        emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);
    }

    function cancelAuction(uint256 tokenId)
        public
        override
    {
        require(block.number >= store.getStartBlock(tokenId), 'ANC');
        require(block.number <= store.getEndBlock(tokenId), 'AE');
        require(!store.isCancelled(tokenId), 'AC');
        store.setCancelled(tokenId, true);
        emit LogCanceled();
    }

    function getTokenInfo(uint256 tokenId) public view override returns (Models.Asset memory) {
        Models.Asset memory a = Models.Asset(tokenId, store.getOwner(tokenId), address(store.getToken(tokenId)));
        return a;
    }

    function getAuctionInfo(uint256 tokenId) public view override returns (Models.AuctionInfo memory) {
        Models.AuctionInfo memory b = store.getAuction(tokenId);
        return b;
    }
}
