//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
import '../library/models.sol';
import '../Token.sol';

interface StorageInterface {
    function setAdmin(address _admin) external;

    function startAuction(Models.AuctionInfo memory ai) external;

    function getAuction(uint256 tokenId) external view returns (Models.AuctionInfo memory);

    function getFundsByBidder(uint256 tokenId, address sender) external view returns (uint256);

    function getSellNowPrice(uint256 tokenId) external view returns (uint256);

    function getHighestBid(uint256 tokenId) external view returns (uint256);

    function getStartBlock(uint256 tokenId) external view returns (uint256);

    function isCancelled(uint256 tokenId) external view returns (bool);

    function setCancelled(uint256 tokenId, bool cancelled) external;

    function isStarted(uint256 tokenId) external view returns (bool);

    function setStarted(uint256 tokenId, bool started) external;    

    function setHighestBid(uint256 tokenId, uint256 highestBid) external;

    function setEndBlock(uint256 tokenId, uint256 endBlock) external;

    function getEndBlock(uint256 tokenId) external view returns (uint256);

    function setFundsByBidder(
        uint256 tokenId,
        address sender,
        uint256 newBid
    ) external;

    function setHighestBidder(uint256 tokenId, address highestBidder) external;

    function getHighestBidder(uint256 tokenId) external view returns (address);

    function setOwner(uint256 tokenId, address owner) external;

    function getOwner(uint256 tokenId) external view returns (address);

    function addBidder(uint256 tokenId, address bidder) external;

    function addBid(uint256 tokenId, uint256 bid) external;

    function addToken(uint256 tokenId, Token token) external;

    function getToken(uint256 tokenId) external view returns (Token);
}
