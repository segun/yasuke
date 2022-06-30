//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '../library/models.sol';
import '../Token.sol';
import '../interfaces/PhysicalArtsInterface.sol';

contract PhysicalArts is ReentrancyGuard, PhysicalArtsInterface {
    address internal admin = address(0);
    address internal parent = address(0);
    mapping(uint256 => Token) internal tokens;
    mapping(uint256 => bool) internal onSale;
    mapping(uint256 => uint256) internal salePrice;

    function setAdmin(address _admin, address _parent) public override {
        if (admin == address(0) && parent == address(0)) {
            parent = _parent;
            admin = _admin;
        } else if (parent == _parent) {
            admin = _admin;
        } else {
            revert('OACDT');
        }
    }

    function addToken(uint256 tokenId, Token token) public override {
        require(msg.sender == admin, "You can't do that");
        require(address(tokens[tokenId]) == address(0), "Token with ID already exists");
        tokens[tokenId] = token;
    }

    function getToken(uint256 tokenId) public view override returns (Token) {
        return tokens[tokenId];
    }    

    function sellNow(uint256 tokenId, uint256 sellNowPrice) public override {
        require(msg.sender == admin, "You can't do that");
        onSale[tokenId] = true;
        salePrice[tokenId] = sellNowPrice;
    }

    function bought(uint256 tokenId) public override {
        require(msg.sender == admin, "You can't do that");
        onSale[tokenId] = false;
        salePrice[tokenId] = 0;        
    }
}