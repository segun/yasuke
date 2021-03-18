//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Auction.sol";
import "./library/console.sol";

contract YASUKE is ERC1155, AccessControl {
    string uri;
    address minter;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");

    struct Asset {
        uint256 tokenId;
        address owner;
        address bidContract;
        string uri;
    }

    struct BidInfo {
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

    mapping(uint256 => address) owners;

    mapping(uint256 => Auction) bidContracts;

    constructor(string memory _uri) ERC1155(_uri) {
        uri = _uri;        
        minter = msg.sender;
        _setupRole(MINTER_ROLE, minter);
    }

    modifier isMemberOf(
        address user,
        bytes32 role,
        string memory rm
    ) {
        require(hasRole(role, user), rm);
        _;
    }

    function mint(
        uint256 tokenId,
        uint256 amount,
        uint256 startBlock,
        uint256 endBlock,
        uint256 maxBid
    ) public isMemberOf(msg.sender, MINTER_ROLE, "NAM") {
        console.log("Minting %d", tokenId);
        _mint(msg.sender, tokenId, amount, "");
        owners[tokenId] = msg.sender;
        Auction bidContract =
            new Auction(tokenId, msg.sender, startBlock, endBlock, maxBid);
        bidContracts[tokenId] = bidContract;
    }

    function getTokenInfo(uint256 tokenId) public view returns (Asset memory) {
        Asset memory a =
            Asset(
                tokenId,
                owners[tokenId],
                address(bidContracts[tokenId]),
                uri
            );

        return a;
    }

    function getBidInfo(uint256 tokenId) public view returns (BidInfo memory) {
        Auction a = bidContracts[tokenId];

        BidInfo memory b =
            BidInfo(
                tokenId,
                owners[tokenId],
                a.getStartBlock(),
                a.getEndBlock(),
                a.getBuyNowPrice(),
                a.getBidders(),
                a.getBids(),
                a.getHighestBidder(),
                a.getHighestBid(),
                a.isCancelled()
            );

        return b;
    }

    function transfer(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public {
        safeTransferFrom(msg.sender, to, tokenId, amount, data);
    }
}
