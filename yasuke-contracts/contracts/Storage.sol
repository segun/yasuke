//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import './interfaces/StorageInterface.sol';
import './library/models.sol';

contract Storage is StorageInterface {
    mapping(uint256 => address) internal owner;
    mapping(uint256 => mapping(uint256 => uint256)) internal currentBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal startBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal endBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal sellNowPrice;
    mapping(uint256 => uint256) internal noBiddingPrice;
    mapping(uint256 => bool) internal buyWithToken;
    mapping(uint256 => mapping(uint256 => address[])) internal bidders;
    mapping(uint256 => mapping(uint256 => uint256[])) internal bids;
    mapping(uint256 => mapping(uint256 => address)) internal highestBidder;
    mapping(uint256 => mapping(uint256 => uint256)) internal highestBid;
    mapping(uint256 => mapping(uint256 => bool)) internal cancelled;
    mapping(uint256 => mapping(uint256 => bool)) internal started;
    mapping(uint256 => mapping(uint256 => bool)) internal finished;
    mapping(uint256 => mapping(uint256 => bool)) internal sellNowTriggered;
    mapping(uint256 => bool) internal inAuction;
    mapping(uint256 => bool) internal inSale;
    mapping(uint256 => mapping(uint256 => uint256)) internal minimumBid;
    mapping(uint256 => Token) internal tokens;

    address internal admin = address(0);
    address internal parent = address(0);

    uint256 internal xendFeesPercentage = 2;
    uint256 internal issuerFeesPercentage = 5;
    address payable internal xendFeesAddress = payable(0x616B6c01DFeA4AF613326FDF683429f43CEe86FD);

    function setXendFeesPercentage(uint256 _percentage) public override {
        require(msg.sender == admin, "You can't do that");
        // should not increment more than 5% at a time
        // should not be more than 30%
        require(_percentage - xendFeesPercentage <= 5);
        require(_percentage < 30);
        xendFeesPercentage = _percentage;
    }

    function getXendFeesPercentage() public view override returns (uint256) {
        return xendFeesPercentage;
    }

    function setIssuerFeesPercentage(uint256 _percentage) public override {
        require(msg.sender == admin, "You can't do that");
        // should not be more than 30%   
        require(_percentage <= 30);             
        issuerFeesPercentage = _percentage;
    }

    function getIssuerFeesPercentage() public view override returns (uint256) {
        return issuerFeesPercentage;
    }

    function setXendFeesAddress(address payable _feesAddress) public override {
        require(msg.sender == admin, "You can't do that");
        xendFeesAddress = _feesAddress;
    }

    function getXendFeesAddress() public override view returns (address payable) {        
        return xendFeesAddress;
    }

    function getParent() public view override returns (address) {
        return parent;
    }

    function getAdmin() public view override returns (address) {
        return admin;
    }

    function setAdmin(address _admin, address _parent) public override {
        if (admin == address(0) && parent == address(0)) {
            parent = _parent;
            admin = _admin;
        } else if (parent == _parent) {
            admin = _admin;
        } else {
            revert('OACDT');
        }
    }

    function addToken(uint256 tokenId, Token token) public override {
        require(msg.sender == admin, "You can't do that");
        require(address(tokens[tokenId]) == address(0), "Token with ID already exists");
        tokens[tokenId] = token;
    }

    function getToken(uint256 tokenId) public view override returns (Token) {
        return tokens[tokenId];
    }

    function startAuction(Models.AuctionInfo memory ai) public override {
        require(msg.sender == admin, "You can't do that");
        uint256 tokenId = ai.tokenId;
        uint256 auctionId = ai.auctionId;
        owner[tokenId] = ai.owner;
        startBlock[tokenId][auctionId] = ai.startBlock;
        endBlock[tokenId][auctionId] = ai.endBlock;
        currentBlock[tokenId][auctionId] = ai.endBlock;
        sellNowPrice[tokenId][auctionId] = ai.sellNowPrice;
        minimumBid[tokenId][auctionId] = ai.minimumBid;
        highestBid[tokenId][auctionId] = ai.minimumBid;
        started[tokenId][auctionId] = true;
        finished[tokenId][auctionId] = false;
        sellNowTriggered[tokenId][auctionId] = false;
        cancelled[tokenId][auctionId] = false;
        inAuction[tokenId] = true;
        inSale[tokenId] = false;
    }

    function startSale(uint256 tokenId, uint256 price, bool withToken) public override {
        require(msg.sender == admin, "You can't do that");
        noBiddingPrice[tokenId] = price;
        inAuction[tokenId] = false;
        inSale[tokenId] = true;
        buyWithToken[tokenId] = withToken;
    }

    function getNoBiddingPrice(uint256 tokenId) public override view returns (uint256) {
        return noBiddingPrice[tokenId];
    }

    function getBuyWithToken(uint256 tokenId) public override view returns (bool) {
        return buyWithToken[tokenId];
    }

    function setBuyWithToken(uint256 tokenId, bool bwt) public override {
        require(msg.sender == admin, "You can't do that");
        buyWithToken[tokenId] = bwt;
    }    

    function getAuction(uint256 tokenId, uint256 auctionId) public view override returns (Models.AuctionInfo memory) {
        Models.AuctionInfo memory ai =
            Models.AuctionInfo(
                tokenId, 
                auctionId,                               
                owner[tokenId],
                startBlock[tokenId][auctionId],
                endBlock[tokenId][auctionId],
                currentBlock[tokenId][auctionId],
                sellNowPrice[tokenId][auctionId],
                highestBidder[tokenId][auctionId],
                highestBid[tokenId][auctionId],
                cancelled[tokenId][auctionId],
                minimumBid[tokenId][auctionId],
                bidders[tokenId][auctionId],
                bids[tokenId][auctionId],
                started[tokenId][auctionId],
                finished[tokenId][auctionId],
                sellNowTriggered[tokenId][auctionId]
            );

        return ai;
    }

    function getSellNowPrice(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return sellNowPrice[tokenId][auctionId];
    }

    function getHighestBid(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return highestBid[tokenId][auctionId];
    }

    function getMinimumBid(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return minimumBid[tokenId][auctionId];
    }    

    function setHighestBid(
        uint256 tokenId,
        uint256 auctionId,
        uint256 hb
    ) public override {
        require(msg.sender == admin, "You can't do that");
        highestBid[tokenId][auctionId] = hb;
    }

    function setHighestBidder(
        uint256 tokenId,
        uint256 auctionId,
        address bidder
    ) public override {
        require(msg.sender == admin, "You can't do that");
        highestBidder[tokenId][auctionId] = bidder;
    }

    function getHighestBidder(uint256 tokenId, uint256 auctionId) public view override returns (address) {
        return highestBidder[tokenId][auctionId];
    }

    function setEndBlock(
        uint256 tokenId,
        uint256 auctionId,
        uint256 _endBlock
    ) public override {
        require(msg.sender == admin, "You can't do that");
        endBlock[tokenId][auctionId] = _endBlock;
    }

    function getEndBlock(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return endBlock[tokenId][auctionId];
    }

    function getStartBlock(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return startBlock[tokenId][auctionId];
    }

    function getCurrentBlock(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return currentBlock[tokenId][auctionId];
    }    

    function addBidder(
        uint256 tokenId,
        uint256 auctionId,
        address bidder
    ) public override {
        require(msg.sender == admin, "You can't do that");
        bidders[tokenId][auctionId].push(bidder);
    }

    function getBidders(uint256 tokenId, uint256 auctionId) public view override returns (address[] memory) {
        return bidders[tokenId][auctionId];
    }

    function addBid(
        uint256 tokenId,
        uint256 auctionId,
        uint256 bid
    ) public override {
        require(msg.sender == admin, "You can't do that");
        bids[tokenId][auctionId].push(bid);
    }

    function getBids(uint256 tokenId, uint256 auctionId) public view override returns (uint256[] memory) {
        return bids[tokenId][auctionId];
    }

    function getOwner(uint256 tokenId) public view override returns (address) {
        return owner[tokenId];
    }

    function setOwner(uint256 tokenId, address _owner) public override {
        require(msg.sender == admin, "You can't do that");
        owner[tokenId] = _owner;
    }

    function isCancelled(uint256 tokenId, uint256 auctionId) public view override returns (bool) {
        return cancelled[tokenId][auctionId];
    }

    function setCancelled(
        uint256 tokenId,
        uint256 auctionId,
        bool _cancelled
    ) public override {
        require(msg.sender == admin, "You can't do that");
        cancelled[tokenId][auctionId] = _cancelled;
        inAuction[tokenId] = false;
    }

    function isStarted(uint256 tokenId, uint256 auctionId) public view override returns (bool) {
        return started[tokenId][auctionId];
    }

    function isFinished(uint256 tokenId, uint256 auctionId) public view override returns (bool) {
        return finished[tokenId][auctionId];
    }

    function isSellNowTriggered(uint256 tokenId, uint256 auctionId) public view override returns (bool) {
        return sellNowTriggered[tokenId][auctionId];
    }    

    function setStarted(
        uint256 tokenId,
        uint256 auctionId,
        bool _started
    ) public override {
        require(msg.sender == admin, "You can't do that");
        started[tokenId][auctionId] = _started;
        inAuction[tokenId] = _started;
    }

    function setSellNowTriggered(
        uint256 tokenId,
        uint256 auctionId,
        bool _sellNowTriggered
    ) public override {
        require(msg.sender == admin, "You can't do that");
        sellNowTriggered[tokenId][auctionId] = _sellNowTriggered;
        inAuction[tokenId] = _sellNowTriggered;
    }    

    function setFinished(
        uint256 tokenId,
        uint256 auctionId,
        bool _finished
    ) public override {
        require(msg.sender == admin, "You can't do that");
        finished[tokenId][auctionId] = _finished;
        inAuction[tokenId] = _finished;
    }    

    function setInAuction(uint256 tokenId, bool _inAuction) public override {
        require(msg.sender == admin, "You can't do that");
        inAuction[tokenId] = _inAuction;
    }

    function setInSale(uint256 tokenId, bool _inSale) public override {
        require(msg.sender == admin, "You can't do that");
        inSale[tokenId] = _inSale;
    }  

    function setNoBiddingPrice(uint256 tokenId, uint256 nbp) public override {
        require(msg.sender == admin, "You can't do that");
        noBiddingPrice[tokenId] = nbp;
    }

    function isInAuction(uint256 tokenId) public view override returns (bool) {
        return inAuction[tokenId];
    }

    function isInSale(uint256 tokenId) public view override returns (bool) {
        return inSale[tokenId];
    }
}
