//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;
import '../library/models.sol';
import '../Token.sol';
interface PhysicalArtsInterface {
    function setAdmin(address _admin, address parent) external;

    function addToken(uint256 tokenId, Token token) external;

    function getToken(uint256 tokenId) external view returns (Token);

    function sellNow(uint256 tokenId, uint256 sellNowPrice) external;

    function bought(uint256 tokenId) external;
}