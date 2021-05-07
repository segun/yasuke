//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import './Storage.sol';
import './library/console.sol';
import './library/models.sol';
import './interfaces/StorageInterface.sol';
import './interfaces/YasukeInterface.sol';

// TODO: Calculate Fees
contract Yasuke is YasukeInterface {
    using SafeMath for uint256;
    address internal minter;

    StorageInterface internal store;

    constructor(address storeAddress) {
        minter = msg.sender;
        store = StorageInterface(storeAddress);
        console.log('Calling Set Admin');
        store.setAdmin(address(this), msg.sender);
    }

    function testUpgrade() public view returns (address, address) {
        require(store.echo(), 'UF');
        return (store.getAdmin(), store.getParent());
    }

    function startAuction(
        uint256 tokenId,
        uint256 auctionId,
        uint256 startBlock,
        uint256 endBlock,
        uint256 currentBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) public override {
        Token t = store.getToken(tokenId);
        require(t.ownerOf(tokenId) == msg.sender, 'WO');
        require(!store.isInAuction(tokenId), 'AIP');
        require(!store.isStarted(tokenId, auctionId), 'AAS');
        Models.AuctionInfo memory ai =
            Models.AuctionInfo(
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
                false
            );
        store.startAuction(ai);
    }

    function issueToken(
        uint256 tokenId,
        address payable owner,
        string memory _uri,
        string memory _name,
        string memory _symbol
    ) public override {
        Token t = new Token(owner, _uri, _name, _symbol);
        require(t.mint(tokenId), 'MF');
        store.addToken(tokenId, t);
        store.setOwner(tokenId, owner);
    }

    function endBid(uint256 tokenId, uint256 auctionId) public {
        shouldBeStarted(tokenId, auctionId);
        store.setEndBlock(tokenId, auctionId, block.number); // forces the auction to end
    }

    function placeBid(uint256 tokenId, uint256 auctionId) public payable override {
        Token t = store.getToken(tokenId);
        shouldBeStarted(tokenId, auctionId);
        require(msg.value > 0, 'CNB0');
        require(msg.sender != t.ownerOf(tokenId), 'OCB');

        uint256 fundsByBidder = store.getFundsByBidder(tokenId, auctionId, msg.sender);
        uint256 sellNowPrice = store.getSellNowPrice(tokenId, auctionId);

        uint256 newBid = msg.value.add(fundsByBidder);

        /**
            TODO: The frontend needs to know about this.  
            1. Add a new field to AuctionInfo that is set to true when the newBid >= sellNowPrice
            2. Set  highest bidder and highest bid  
         */

        if (newBid >= sellNowPrice && sellNowPrice != 0) {
            store.setEndBlock(tokenId, auctionId, block.number); // forces the auction to end

            // refund bidder the difference if any
            uint256 difference = newBid.sub(sellNowPrice);
            if (difference > 0) {
                bool sent = msg.sender.send(difference);
                require(sent, 'BFMB');
            }

            // bid should now be max bid
            newBid = sellNowPrice;
        } else {
            if (store.getHighestBid(tokenId, auctionId) != store.getMinimumBid(tokenId, auctionId)) {
                require(newBid > store.getHighestBid(tokenId, auctionId), 'BTL');
            } else {
                require(newBid >= store.getHighestBid(tokenId, auctionId), 'BTL2');
            }
        }

        store.setFundsByBidder(tokenId, auctionId, msg.sender, newBid);
        store.setHighestBidder(tokenId, auctionId, msg.sender);
        store.setHighestBid(tokenId, auctionId, newBid);
        store.addBidder(tokenId, auctionId, msg.sender);
        store.addBid(tokenId, auctionId, newBid);

        emit LogBid(msg.sender, newBid);
    }

    function _withdrawOwner(uint256 tokenId, uint256 auctionId) internal returns (bool, uint256) {
        Token t = store.getToken(tokenId);
        address owner = t.ownerOf(tokenId);
        address highestBidder = store.getHighestBidder(tokenId, auctionId);

        uint256 withdrawalAmount = store.getFundsByBidder(tokenId, auctionId, highestBidder);

        store.setFundsByBidder(tokenId, auctionId, highestBidder, 0);

        // we have to take fees
        uint256 xfp = store.getXendFeesPercentage();
        uint256 ifp = store.getIssuerFeesPercentage();

        if (t.getIssuer() == owner) {
            // owner is issuer, xendFees is xendFees + issuerFees
            xfp = store.getXendFeesPercentage().add(store.getIssuerFeesPercentage());
            ifp = 0;
        }

        uint256 xendFees = (xfp.mul(withdrawalAmount)).div(100);
        uint256 issuerFees = (ifp.mul(withdrawalAmount)).div(100);

        withdrawalAmount = withdrawalAmount.sub(xendFees).sub(issuerFees);

        if (issuerFees > 0) {
            bool sent = t.getIssuer().send(issuerFees);
            require(sent, 'CNSTI');
        }

        if (xendFees > 0) {
            bool sent = store.getXendFeesAddress().send(xendFees);
            require(sent, 'CNSTXND');
        }

        return (true, withdrawalAmount);
    }

    function withdraw(uint256 tokenId, uint256 auctionId) public override {
        Token t = store.getToken(tokenId);
        require(store.isStarted(tokenId, auctionId), 'BANS');
        require(block.number > store.getEndBlock(tokenId, auctionId) || store.isCancelled(tokenId, auctionId), 'ANE');
        bool cancelled = store.isCancelled(tokenId, auctionId);
        address owner = t.ownerOf(tokenId);
        address highestBidder = store.getHighestBidder(tokenId, auctionId);

        if (cancelled) {
            // owner can not withdraw anything, everyone should be refunded
            require(msg.sender != owner, 'AWC');
        }

        // everyone else that participated, but didn't win should be allowed to withdraw their funds.
        uint256 withdrawalAmount = store.getFundsByBidder(tokenId, auctionId, msg.sender);
        address payable withdrawalAccount = msg.sender;

        if (withdrawalAccount == owner) {
            // owner should be allowed to withdrawal highestBid only if highestbidder is not address(0)
            require(highestBidder != address(0), 'HBNZ');
            withdrawalAmount = store.getHighestBid(tokenId, auctionId);
            require(store.getFundsByBidder(tokenId, auctionId, highestBidder) == withdrawalAmount, 'HBFAW');
        }

        bool withdrawEth = false;
        if (withdrawalAccount != owner && withdrawalAccount != highestBidder) {
            // if sender is not owner only then can we reduce the funds by bidder
            store.setFundsByBidder(tokenId, auctionId, withdrawalAccount, 0);
            withdrawEth = true;
        } else if (withdrawalAccount == owner) {
            // withdraw funds from highest bidder
            (, withdrawalAmount) = _withdrawOwner(tokenId, auctionId);                    
            withdrawEth = true;
        } else if (withdrawalAccount == highestBidder) {
            if (cancelled) {
                // do normal refund
                store.setFundsByBidder(tokenId, auctionId, highestBidder, 0);
                withdrawEth = true;
            } else {
                // transfer the token from owner to highest bidder
                address tokenOwner = t.ownerOf(tokenId);
                require(t.changeOwnership(tokenId, tokenOwner, highestBidder), 'CNCO');
                
                // withdraw owner
                (, withdrawalAmount) = _withdrawOwner(tokenId, auctionId);      
                if(withdrawalAmount > 0) {
                    // owner have not withdrawn...withdraw for them                    
                    store.setFinished(tokenId, auctionId, false);
                    bool sent = withdrawalAccount.send(withdrawalAmount);
                    require(sent, 'WF');
                }                

                // withdraw token
                withdrawEth = false;
                store.setInAuction(tokenId, false); // we can create new auction
                store.setOwner(tokenId, highestBidder);
            }
        }

        // console.log("WE: %s, ACC: %s, WA: %d", withdrawEth, withdrawalAccount, withdrawalAmount);
        if (withdrawEth && withdrawalAmount > 0) {
            // if we get here, we can safely say the auction is finished
            store.setFinished(tokenId, auctionId, false);
            bool sent = withdrawalAccount.send(withdrawalAmount);

            require(sent, 'WF');
        }

        emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);
    }

    // TODO: Check if there are no bids before cancelling.
    function cancelAuction(uint256 tokenId, uint256 auctionId) public override {
        shouldBeStarted(tokenId, auctionId);
        require(store.getBids(tokenId, auctionId).length > 0);
        store.setCancelled(tokenId, auctionId, true);
        emit LogCanceled();
    }

    function getTokenInfo(uint256 tokenId) public view override returns (Models.Asset memory) {
        Token t = store.getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        Models.Asset memory a = Models.Asset(tokenId, t.ownerOf(tokenId), t.getIssuer(), address(t), t.name(), t.symbol());
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
}
