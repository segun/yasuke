//SPDX-License-Identifier: MIT-0
pragma solidity >= 0.7.0 < 0.9.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import './library/console.sol';

contract Token is ERC721 {
    address internal owner;
    address internal admin;
    string internal uri;


    constructor(address _owner, string memory _uri, string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        uri = _uri;
        owner = _owner; 
        admin = msg.sender;
    }

    function mint(uint256 tokenId) public returns (bool) {
        require(msg.sender == admin, 'Only admin can call this contract');
        _mint(owner, tokenId);    
        allowSpending(tokenId);
        console.log("Owner of %d: %s", tokenId, ownerOf(tokenId));
        _setTokenURI(tokenId, uri);
        return true;          
    }

    function allowSpending(uint256 tokenId) public {
        require(msg.sender == admin, 'Only admin can call this contract');        
        _approve(msg.sender, tokenId);
    }
}