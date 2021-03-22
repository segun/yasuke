//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;
import "../library/models.sol";

interface YasukeInterface {
    function mint(
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) external;

    function getTokenInfo(uint256) external view returns (Models.Asset memory);

    function getAuctionInfo(uint256)
        external
        view
        returns (Models.AuctionInfo memory);

    function transfer(
        address,
        uint256,
        uint256,
        bytes memory
    ) external;
}
