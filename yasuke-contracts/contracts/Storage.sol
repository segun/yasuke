//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./interfaces/StorageInterface.sol";
import "./Auction.sol";

contract Storage is StorageInterface {
    mapping(uint256 => address) owners;

    mapping(uint256 => Auction) auctionContracts;

    function addOwner(uint256 tokenId, address owner) public override {
        owners[tokenId] = owner;
    }

    function addAuctionContract(uint256 tokenId, Auction auction) public override {
        auctionContracts[tokenId] = auction;
    }

    function getOwner(uint256 tokenId) public override view returns (address) {
        return owners[tokenId];
    }

    function getAuctionContract(uint256 tokenId) public override view returns (Auction) {
        return auctionContracts[tokenId];
    }    
}