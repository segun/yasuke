//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import './interfaces/StorageInterface.sol';
import './library/models.sol';
import './library/console.sol';
import './Token.sol';

contract Storage is StorageInterface {
    mapping(uint256 => address) internal owner;
    mapping(uint256 => mapping(uint256 => uint256)) internal currentBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal startBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal endBlock;
    mapping(uint256 => mapping(uint256 => uint256)) internal sellNowPrice;
    mapping(uint256 => mapping(uint256 => address[])) internal bidders;
    mapping(uint256 => mapping(uint256 => uint256[])) internal bids;
    mapping(uint256 => mapping(uint256 => address)) internal highestBidder;
    mapping(uint256 => mapping(uint256 => uint256)) internal highestBid;
    mapping(uint256 => mapping(uint256 => bool)) internal cancelled;
    mapping(uint256 => mapping(uint256 => bool)) internal started;
    mapping(uint256 => mapping(uint256 => bool)) internal finished;
    mapping(uint256 => mapping(uint256 => bool)) internal sellNowTriggered;
    mapping(uint256 => bool) internal inAuction;
    mapping(uint256 => mapping(uint256 => uint256)) internal minimumBid;
    mapping(uint256 => Token) internal tokens;

    address internal admin = address(0);

    address internal parent = address(0);

    uint256 internal xendFeesPercentage = 5;
    uint256 internal issuerFeesPercentage = 10;
    address payable internal xendFeesAddress = payable(0x616B6c01DFeA4AF613326FDF683429f43CEe86FD);

    function setXendFeesPercentage(uint256 _percentage) public override {
        require(msg.sender == admin, "You can't do that");
        xendFeesPercentage = _percentage;
    }

    function getXendFeesPercentage() public view override returns (uint256) {
        return xendFeesPercentage;
    }

    function setIssuerFeesPercentage(uint256 _percentage) public override {
        require(msg.sender == admin, "You can't do that");
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

    function changeTokenOwner(uint256 tokenId, address _owner, address _highestBidder) public override {
        Token t = getToken(tokenId);
        require(t.changeOwnership(tokenId, _owner, _highestBidder), 'CNCO');
    }

    function addToken(uint256 tokenId, address payable _owner, string memory uri, string memory name, string memory symbol) public override {
        require(msg.sender == admin, "You can't do that");
        Token t = new Token(_owner, uri, name, symbol);
        require(t.mint(tokenId), 'MF');

        tokens[tokenId] = t;
    }

    function getToken(uint256 tokenId) internal view returns (Token) {
        Token t = tokens[tokenId];
        require(address(t) != address(0), 'TINF');
        return t;
    }

    function startAuction(Models.AuctionInfo memory ai, address sender) public override {
        require(msg.sender == admin, "You can't do that");
        require(getOwner(ai.tokenId) == sender, 'WO');
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
        Token t = getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        return t.ownerOf(tokenId);
    }

    function getIssuer(uint256 tokenId) public view override returns (address) {
        Token t = getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        return t.getIssuer();
    } 

    function getAddress(uint256 tokenId) public view override returns (address) {
        Token t = getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        return address(t);
    }  

    function getName(uint256 tokenId) public view override returns (string memory) {
        Token t = getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        return t.name();
    }      

    function getSymbol(uint256 tokenId) public view override returns (string memory) {
        Token t = getToken(tokenId);
        require(address(t) != address(0), 'TINF');
        return t.symbol();
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

    function isInAuction(uint256 tokenId) public view override returns (bool) {
        return inAuction[tokenId];
    }

    function echo() public view override returns (bool) {
        console.log('2. Sender: %s, Admin: %s, Parent: %s', msg.sender, admin, parent);
        require(msg.sender == admin, "You can't do that");
        return true;
    }
}
