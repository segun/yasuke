//SPDX-License-Identifier: MIT-0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
import '../library/models.sol';

interface YasukeInterface {
    function startAuction(
        uint256 tokenId,
        uint256 auctionId,
        uint256 startBlock,
        uint256 endBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) external;

    function issueToken(
        uint256 tokenId,        
        address payable owner,
        string memory _uri,
        string memory _name,
        string memory _symbol
    ) external;

    function getTokenInfo(uint256 tokenId) external view returns (Models.Asset memory);

    function getAuctionInfo(uint256 tokenId, uint256 auctionId) external view returns (Models.AuctionInfo memory);

    function placeBid(uint256 tokenId, uint256 auctionId) external payable;

    function withdraw(uint256 tokenId, uint256 auctionId) external;

    function cancelAuction(uint256 tokenId, uint256 auctionId) external;

    event LogBid(address, uint256);

    event LogWithdrawal(address, address, uint256);

    event LogCanceled();
}
