//SPDX-License-Identifier: MIT-0
pragma solidity >= 0.7.0 < 0.9.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
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
        _setTokenURI(tokenId, uri);
        return true;          
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