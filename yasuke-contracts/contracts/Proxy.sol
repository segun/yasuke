//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./interfaces/YasukeInterface.sol";
import "./library/models.sol";

contract Proxy {
    YasukeInterface yasuke;

    constructor(address ya) {
        yasuke = YasukeInterface(ya);
    }

    function mint(
        uint256 tokenId,
        uint256 amount,
        uint256 startBlock,
        uint256 endBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) public {
        yasuke.mint(
            msg.sender,
            tokenId,
            amount,
            startBlock,
            endBlock,
            sellNowPrice,
            minimumBid
        );
    }

    function getTokenInfo(uint256 tokenId)
        public
        view
        returns (Models.Asset memory)
    {
        return yasuke.getTokenInfo(tokenId);
    }

    function getAuctionInfo(uint256 tokenId)
        public
        view
        returns (Models.AuctionInfo memory)
    {
        return yasuke.getAuctionInfo(tokenId);
    }

    function transfer(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public {
        yasuke.transfer(to, tokenId, amount, data);
    }
}
