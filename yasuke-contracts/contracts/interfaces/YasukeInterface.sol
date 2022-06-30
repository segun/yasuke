//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;
import '../library/models.sol';

interface YasukeInterface {
    function startAuction(
        uint256 tokenId,
        uint256 auctionId,
        uint256 startBlock,
        uint256 endBlock,
        uint256 currentBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) external;

    function issueToken(
        uint256 tokenId,        
        address payable owner,
        string memory _uri,
        string memory _name,
        string memory _symbol,
        bool isPhysicalArt
    ) external;

    function getTokenInfo(uint256 tokenId) external view returns (Models.Asset memory);

    function getAuctionInfo(uint256 tokenId, uint256 auctionId) external view returns (Models.AuctionInfo memory);

    function placeBid(uint256 tokenId, uint256 auctionId) external payable;    

    // function buyNow(uint256 tokenId) external payable;

    // function sellNow(uint256 tokenId, uint256 price) external;

    function withdraw(uint256 tokenId, uint256 auctionId) external;

    // function cancelAuction(uint256 tokenId, uint256 auctionId) external;

    function setIssuerFeesPercentage(uint256 percentage) external;

    function setXendFeesAddress(address payable xfAddress) external;

    event LogBid(address indexed, uint256 indexed);

    event Sold(address indexed, address indexed, uint256 indexed, uint256);
    
    event LogWithdrawal(address indexed, uint256 indexed, uint256 indexed);

    event LogCanceled();

    event OnSale(address indexed, uint256 indexed);
}
