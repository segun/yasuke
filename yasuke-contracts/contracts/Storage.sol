//SPDX-License-Identifier: MIT-0
pragma solidity >= 0.7.0 < 0.9.0;
pragma experimental ABIEncoderV2;

import "./interfaces/StorageInterface.sol";
import "./library/models.sol";
import "./Token.sol";

contract Storage is StorageInterface {
    mapping(uint256 => address) internal owner;
    mapping(uint256 => uint256) internal startBlock;
    mapping(uint256 => uint256) internal endBlock;
    mapping(uint256 => uint256) internal sellNowPrice;
    mapping(uint256 => address[]) internal bidders;
    mapping(uint256 => uint256[]) internal bids;
    mapping(uint256 => address) internal highestBidder;
    mapping(uint256 => uint256) internal highestBid;
    mapping(uint256 => mapping(address => uint256)) internal fundsByBidder;
    mapping(uint256 => bool) internal cancelled;
    mapping(uint256 => bool) internal started;
    mapping(uint256 => bool) internal ended;
    mapping(uint256 => uint256) internal minimumBid;
    mapping(uint256 => Token) internal tokens;

    address internal admin = address(0);

    function setAdmin(address _admin) public override {
        if(admin == address(0)) {
            admin = _admin;
        } else {
            require(msg.sender == admin, "You can't do that");
            admin = _admin;
        }
    }

    function addToken(uint256 tokenId, Token token) public override {
        require(msg.sender == admin, "You can't do that");
        tokens[tokenId] = token;
    }

    function getToken(uint256 tokenId) public override view returns (Token) {
        return tokens[tokenId];
    }

    function startAuction(Models.AuctionInfo memory ai) public override {
        require(msg.sender == admin, "You can't do that");
        uint256 ti = ai.tokenId;
        owner[ti] = ai.owner;
        startBlock[ti] = ai.startBlock;
        endBlock[ti] = ai.endBlock;
        sellNowPrice[ti] = ai.sellNowPrice;
        minimumBid[ti] = ai.minimumBid;
        highestBid[ti] = ai.minimumBid;
        started[ti] = true;
    }

    function getAuction(uint256 tokenId)
        public
        view
        override
        returns (Models.AuctionInfo memory)
    {
        Models.AuctionInfo memory ai =
            Models.AuctionInfo(
                tokenId,
                owner[tokenId],
                startBlock[tokenId],
                endBlock[tokenId],
                sellNowPrice[tokenId],
                highestBidder[tokenId],
                highestBid[tokenId],
                cancelled[tokenId],
                minimumBid[tokenId]
            );

        return ai;
    }

    function getFundsByBidder(uint256 tokenId, address sender)
        public
        view
        override
        returns (uint256)
    {
        return fundsByBidder[tokenId][sender];
    }

    function setFundsByBidder(
        uint256 tokenId,
        address sender,
        uint256 newBid
    ) public override {
        require(msg.sender == admin, "You can't do that");
        fundsByBidder[tokenId][sender] = newBid;
    }

    function getSellNowPrice(uint256 tokenId)
        public
        view
        override
        returns (uint256)
    {
        return sellNowPrice[tokenId];
    }

    function getHighestBid(uint256 tokenId)
        public
        view
        override
        returns (uint256)
    {
        return highestBid[tokenId];
    }

    function setHighestBid(uint256 tokenId, uint256 hb) public override {
        require(msg.sender == admin, "You can't do that");
        highestBid[tokenId] = hb;
    }

    function setHighestBidder(uint256 tokenId, address bidder) public override {
        require(msg.sender == admin, "You can't do that");
        highestBidder[tokenId] = bidder;
    }

    function getHighestBidder(uint256 tokenId) public override view returns (address) {
        return highestBidder[tokenId];
    }    

    function setEndBlock(uint256 tokenId, uint256 _endBlock) public override {
        require(msg.sender == admin, "You can't do that");
        endBlock[tokenId] = _endBlock;
    }

    function getEndBlock(uint256 tokenId)
        public
        view
        override
        returns (uint256)
    {
        return endBlock[tokenId];
    }

    function getStartBlock(uint256 tokenId)
        public
        view
        override
        returns (uint256)
    {
        return startBlock[tokenId];
    }

    function addBidder(uint256 tokenId, address bidder) public override {
        require(msg.sender == admin, "You can't do that");
        bidders[tokenId].push(bidder);
    }

    function addBid(uint256 tokenId, uint256 bid) public override {
        require(msg.sender == admin, "You can't do that");
        bids[tokenId].push(bid);
    }

    function getOwner(uint256 tokenId) public view override returns (address) {
        return owner[tokenId];
    }

    function setOwner(uint256 tokenId, address _owner) public override {
        require(msg.sender == admin, "You can't do that");
        owner[tokenId] = _owner;
    }

    function isCancelled(uint256 tokenId) public view override returns (bool) {
        return cancelled[tokenId];
    }

    function setCancelled(uint256 tokenId, bool _cancelled) public override {
        require(msg.sender == admin, "You can't do that");
        cancelled[tokenId] = _cancelled;
    }

    function isStarted(uint256 tokenId) public view override returns (bool) {
        return started[tokenId];
    }

    function setStarted(uint256 tokenId, bool _started) public override {
        require(msg.sender == admin, "You can't do that");
        started[tokenId] = _started;
    }    
}
