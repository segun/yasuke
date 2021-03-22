//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Auction.sol";
import "./Storage.sol";
import "./library/console.sol";
import "./library/models.sol";
import "./interfaces/StorageInterface.sol";
import "./interfaces/YasukeInterface.sol";

contract Yasuke is ERC1155, AccessControl, YasukeInterface {
    string internal uri;
    address internal minter;
    bytes32 internal constant MINTER_ROLE = keccak256("MINTER");
    StorageInterface internal store;
    address internal storeAddress = address(0);

    constructor(string memory _uri, address sa) ERC1155(_uri) {
        uri = _uri;
        minter = msg.sender;
        console.log("Minter %s", minter);
        // Production
        storeAddress = sa;
        store = StorageInterface(storeAddress);
        // Testing
        // store = new Storage();
        _setupRole(MINTER_ROLE, minter);
    }

    modifier isMemberOf(
        address user,
        bytes32 role,
        string memory rm
    ) {
        console.log("Msg.Sender %s", msg.sender);
        require(hasRole(role, user), rm);        
        _;
    }

    function mint(
        address sender,
        uint256 tokenId,
        uint256 amount,
        uint256 startBlock,
        uint256 endBlock,
        uint256 sellNowPrice,
        uint256 minimumBid
    ) public override isMemberOf(sender, MINTER_ROLE, "NAM") {        
        console.log("Minting %d", tokenId);
        _mint(sender, tokenId, amount, "");
        store.addOwner(tokenId, sender);
        Auction auctionContract =
            new Auction(
                tokenId,
                sender,
                startBlock,
                endBlock,
                sellNowPrice,
                minimumBid
            );
        store.addAuctionContract(tokenId, auctionContract);
        console.log("Token %d Minted", tokenId);
    }

    function getTokenInfo(uint256 tokenId)
        public
        view
        override
        returns (Models.Asset memory)
    {
        Models.Asset memory a =
            Models.Asset(
                tokenId,
                store.getOwner(tokenId),
                address(store.getAuctionContract(tokenId)),
                uri
            );

        return a;
    }

    function getAuctionInfo(uint256 tokenId)
        public
        view
        override
        returns (Models.AuctionInfo memory)
    {
        Auction a = store.getAuctionContract(tokenId);

        Models.AuctionInfo memory b =
            Models.AuctionInfo(
                tokenId,
                store.getOwner(tokenId),
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
    ) public override {
        safeTransferFrom(msg.sender, to, tokenId, amount, data);
    }
}
