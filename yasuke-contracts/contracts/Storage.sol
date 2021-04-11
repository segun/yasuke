//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import './interfaces/StorageInterface.sol';
import './library/models.sol';
import './library/console.sol';
import './Token.sol';

contract Storage is StorageInterface {
    mapping(uint256 => address) internal owner;
    mapping(uint256 => mapping(uint256 => uint256)) internal startBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal endBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal sellNowPrice;
    mapping(uint256 => mapping(uint256 => address[])) internal bidders;
    mapping(uint256 => mapping(uint256 => uint256[])) internal bids;
    mapping(uint256 => mapping(uint256 => address)) internal highestBidder;
    mapping(uint256 => mapping(uint256 => uint256)) internal highestBid;
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) internal fundsByBidder;
    mapping(uint256 => mapping(uint256 => bool)) internal cancelled;
    mapping(uint256 => mapping(uint256 => bool)) internal started;
    mapping(uint256 => bool) internal inAuction;
    mapping(uint256 => mapping(uint256 => uint256)) internal minimumBid;
    mapping(uint256 => Token) internal tokens;

    address internal admin = address(0);

    function setAdmin(address _admin) public override {
        if (admin == address(0)) {
            admin = _admin;
        } else {
            console.log('Sender: %s, Admin: %s', msg.sender, admin);
            require(msg.sender == admin, "You can't do that");
            admin = _admin;
        }
    }

    function addToken(uint256 tokenId, Token token) public override {
        require(msg.sender == admin, "You can't do that");
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
        sellNowPrice[tokenId][auctionId] = ai.sellNowPrice;
        minimumBid[tokenId][auctionId] = ai.minimumBid;
        highestBid[tokenId][auctionId] = ai.minimumBid;
        started[tokenId][auctionId] = true;
        inAuction[tokenId] = true;
    }

    function getAuction(uint256 tokenId, uint256 auctionId) public view override returns (Models.AuctionInfo memory) {
        Models.AuctionInfo memory ai =
            Models.AuctionInfo(
                tokenId,
                auctionId,
                owner[tokenId],
                startBlock[tokenId][auctionId],
                endBlock[tokenId][auctionId],
                sellNowPrice[tokenId][auctionId],
                highestBidder[tokenId][auctionId],
                highestBid[tokenId][auctionId],
                cancelled[tokenId][auctionId],
                minimumBid[tokenId][auctionId]
            );

        return ai;
    }

    function getFundsByBidder(
        uint256 tokenId,
        uint256 auctionId,
        address sender
    ) public view override returns (uint256) {
        return fundsByBidder[tokenId][auctionId][sender];
    }

    function setFundsByBidder(
        uint256 tokenId,
        uint256 auctionId,
        address sender,
        uint256 newBid
    ) public override {
        require(msg.sender == admin, "You can't do that");
        fundsByBidder[tokenId][auctionId][sender] = newBid;
    }

    function getSellNowPrice(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return sellNowPrice[tokenId][auctionId];
    }

    function getHighestBid(uint256 tokenId, uint256 auctionId) public view override returns (uint256) {
        return highestBid[tokenId][auctionId];
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

    function addBidder(
        uint256 tokenId,
        uint256 auctionId,
        address bidder
    ) public override {
        require(msg.sender == admin, "You can't do that");
        bidders[tokenId][auctionId].push(bidder);
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

    function setStarted(
        uint256 tokenId,
        uint256 auctionId,
        bool _started
    ) public override {
        require(msg.sender == admin, "You can't do that");
        started[tokenId][auctionId] = _started;
        inAuction[tokenId] = _started;
    }

    function setInAuction(uint256 tokenId, bool _inAuction) public override {
        require(msg.sender == admin, "You can't do that");
        inAuction[tokenId] = _inAuction;
    }

    function isInAuction(uint256 tokenId) public view override returns (bool) {
        return inAuction[tokenId];
    }
}
