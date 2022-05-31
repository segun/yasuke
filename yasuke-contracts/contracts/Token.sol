//SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import './library/console.sol';

contract Token is ERC721 {
    address internal owner;
    address payable internal issuer;
    address internal admin;
    string internal uri;


    constructor(address payable _owner, string memory _uri, string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        uri = _uri;
        owner = _owner; 
        issuer = _owner;
        admin = msg.sender;
    }

    function mint(uint256 tokenId) public returns (bool) {
        require(msg.sender == admin, 'Only admin can call this contract');
        _mint(owner, tokenId);   
        allowSpending(tokenId);        
        return true;          
    }
    
    function _baseURI() override internal view returns (string memory) {
        return uri;
    }

    function changeOwnership(uint tokenId, address from, address to) public returns (bool) {
        require(msg.sender == admin, 'Only admin can call this contract');        
        safeTransferFrom(from, to, tokenId);
        allowSpending(tokenId);
        owner = to;
        return true;
    }

    function allowSpending(uint256 tokenId) public {
        require(msg.sender == admin, 'Only admin can call this contract');        
        _approve(msg.sender, tokenId);
    }

    function getIssuer() public view returns (address payable) {
        return issuer;
    }
}