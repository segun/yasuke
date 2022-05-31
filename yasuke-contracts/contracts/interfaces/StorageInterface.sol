//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;
import '../library/models.sol';
import '../Token.sol';

interface StorageInterface {
    function setAdmin(address _admin, address parent) external;

    function startAuction(Models.AuctionInfo memory ai) external;

    function getAuction(uint256 tokenId, uint256 auctionId) external view returns (Models.AuctionInfo memory);

    function getSellNowPrice(uint256 tokenId, uint256 auctionId) external view returns (uint256);

    function getHighestBid(uint256 tokenId, uint256 auctionId) external view returns (uint256);

    function getMinimumBid(uint256 tokenId, uint256 auctionId) external view returns (uint256);

    function getStartBlock(uint256 tokenId, uint256 auctionId) external view returns (uint256);

    function getCurrentBlock(uint256 tokenId, uint256 auctionId) external view returns (uint256);

    function isCancelled(uint256 tokenId, uint256 auctionId) external view returns (bool);

    function setCancelled(
        uint256 tokenId,
        uint256 auctionId,
        bool cancelled
    ) external;

    function isStarted(uint256 tokenId, uint256 auctionId) external view returns (bool);
    function isFinished(uint256 tokenId, uint256 auctionId) external view returns (bool);
    function isSellNowTriggered(uint256 tokenId, uint256 auctionId) external view returns (bool);

    function isInAuction(uint256 tokenId) external view returns (bool);

    function isInSale(uint256 tokenId) external view returns (bool);

    function setStarted(
        uint256 tokenId,
        uint256 auctionId,
        bool started
    ) external;

    function setFinished(
        uint256 tokenId,
        uint256 auctionId,
        bool started
    ) external;    

    function setSellNowTriggered(
        uint256 tokenId,
        uint256 auctionId,
        bool started
    ) external;        

    function setInAuction(uint256 tokenId, bool started) external;

    function setInSale(uint256 tokenId, bool started) external;

    function setHighestBid(
        uint256 tokenId,
        uint256 auctionId,
        uint256 highestBid
    ) external;

    function setEndBlock(
        uint256 tokenId,
        uint256 auctionId,
        uint256 endBlock
    ) external;

    function getEndBlock(uint256 tokenId, uint256 auctionId) external view returns (uint256);

    function setHighestBidder(
        uint256 tokenId,
        uint256 auctionId,
        address highestBidder
    ) external;

    function getHighestBidder(uint256 tokenId, uint256 auctionId) external view returns (address);

    function setOwner(uint256 tokenId, address owner) external;

    function getOwner(uint256 tokenId) external view returns (address);

    function addBidder(
        uint256 tokenId,
        uint256 auctionId,
        address bidder
    ) external;

    function addBid(
        uint256 tokenId,
        uint256 auctionId,
        uint256 bid
    ) external;

    function startSale(uint256 tokenId, uint256 price, bool withToken) external;    

    function setNoBiddingPrice(uint256 tokenId, uint256 nbp) external;

    function setBuyWithToken(uint256 tokenId, bool bwt) external;

    function getBuyWithToken(uint256 tokenId) external view returns (bool);

    function getBids(uint256 tokenId, uint256 auctionId) external view returns (uint256[] memory);

    function getBidders(uint256 tokenId, uint256 auctionId) external view returns (address[] memory);

    function addToken(uint256 tokenId, Token token) external;

    function getToken(uint256 tokenId) external view returns (Token);

    function setXendFeesPercentage(uint256 percentage) external;

    function getXendFeesPercentage() external view returns (uint256);

    function setIssuerFeesPercentage(uint256 percentage) external;

    function getIssuerFeesPercentage() external view returns (uint256);    

    function setXendFeesAddress(address payable xfAddress) external;

    function getXendFeesAddress() external view returns (address payable);    

    function getParent() external view returns (address);

    function getAdmin() external view returns (address);

    function getNoBiddingPrice(uint256 tokenId) external view returns (uint256);
}
