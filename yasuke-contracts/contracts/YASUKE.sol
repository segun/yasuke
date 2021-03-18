//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./Auction.sol";

contract YASUKE is ERC1155Upgradeable, AccessControlUpgradeable {
    string uri = "";
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

    function initialize() public initializer {
        __ERC1155_init(uri);
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
        uint256 maxBid,
        bytes memory data
    ) public isMemberOf(msg.sender, MINTER_ROLE, "Not a minter") {
        _mint(msg.sender, tokenId, amount, data);
        owners[tokenId] = msg.sender;
        Auction bidContract =
            new Auction(tokenId, msg.sender, startBlock, endBlock, maxBid);
        bidContracts[tokenId] = bidContract;
    }

    function getAsset(uint256 tokenId) public view returns (Asset memory) {
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
