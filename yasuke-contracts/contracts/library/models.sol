//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

library Models {
    struct Asset {
        uint256 tokenId;
        address owner;
        address bidContract;
        string uri;
    }

    struct AuctionInfo {
        uint256 tokenId;
        address owner;
        uint256 startBlock;
        uint256 endBlock;
        uint256 buyNowPrice;
        address[] bidders;
        uint256[] bids;
        address highestBidder;
        uint256 highestBid;
        bool cancelled;
    }
}