//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;

import "../Auction.sol";

interface StorageInterface {
    function addOwner(uint256, address) external;
    function addAuctionContract(uint256, Auction) external;
    function getOwner(uint256) external view returns(address);
    function getAuctionContract(uint256) external view returns (Auction);
}
