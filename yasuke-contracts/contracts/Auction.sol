//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "./interfaces/AuctionInterface.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";

contract Auction is AuctionInterface {
    using SafeMathUpgradeable for uint256;

    address owner;

    uint256 internal startBlock;
    uint256 internal endBlock;

    uint256 internal tokenId;

    bool internal cancelled;

    address internal highestBidder;
    mapping(address => uint256) internal fundsByBidder;

    uint256 internal highestBindingBid;
    // if someone bids this amount, end the auction (sell)
    uint256 internal buyNowPrice;

    // Declare a set state variable
    address[] internal bidders;
    uint256[] internal bids;

    function getStartBlock() public view returns (uint256) {
        return startBlock;
    }

    function getEndBlock() public view returns (uint256) {
        return endBlock;
    }

    function isCancelled() public view returns (bool) {
        return cancelled;
    }

    function getHighestBid() public view returns (uint256) {
        return highestBindingBid;
    }

    function getHighestBidder() public view returns (address) {
        return highestBidder;
    }

    function getBuyNowPrice() public view returns (uint256) {
        return buyNowPrice;
    }

    function getBidders() public view returns (address[] memory) {
        return bidders;
    }

    function getBids() public view returns (uint256[] memory) {
        return bids;
    }    

    constructor(
        uint256 _tokenId,
        address _owner,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _buyNowPrice
    ) {
        require(_tokenId > 0, "Zero Token ID");
        require(_owner != address(0), "Owner is  address(0)");
        require(
            _startBlock < _endBlock,
            "Start Block  should  come  before End Block"
        );

        tokenId = _tokenId;
        owner = _owner;
        startBlock = _startBlock;
        endBlock = _endBlock;
        buyNowPrice = _buyNowPrice;
    }

    modifier onlyAfterStart() {
        require(block.number >= startBlock, "Auction not started");
        _;
    }

    modifier onlyBeforeEnd() {
        require(block.number <= endBlock, "Auction ended");
        _;
    }

    modifier onlyNotCanceled() {
        require(!cancelled, "Auction is cancelled");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Owner can't bid");
        _;
    }

    modifier onlyNotOwner() {
        require(msg.sender != owner, "Owner can't bid");
        _;
    }

    modifier onlyEndedOrCancelled() {
        require(block.number > endBlock || cancelled);
        _;
    }

    function placeBid()
        public
        payable
        override
        onlyAfterStart
        onlyBeforeEnd
        onlyNotCanceled
        onlyNotOwner
        returns (bool)
    {
        require(msg.value > 0, "Can not bid 0");

        uint256 newBid = msg.value.add(fundsByBidder[msg.sender]);

        if (newBid >= buyNowPrice && buyNowPrice != 0) {
            endBlock = block.number; // forces the auction to end

            // refund bidder the difference if any
            uint256 difference = newBid.sub(buyNowPrice);
            if (difference > 0) {
                bool sent = msg.sender.send(difference);
                require(sent, "Bidding maxBid Failed.");
            }

            // bid should now be max bid
            newBid = buyNowPrice;
        } else {
            require(newBid > highestBindingBid, "Bid too low");
        }

        fundsByBidder[msg.sender] = newBid;

        highestBidder = msg.sender;

        highestBindingBid = newBid;

        bidders.push(msg.sender);
        bids.push(newBid);

        emit LogBid(msg.sender, newBid);

        return true;
    }

    function withdraw() public override onlyEndedOrCancelled returns (bool) {
        if (cancelled) {
            // owner can not withdraw anything, everyone should be refunded
            require(msg.sender != owner, "Auction was cancelled");
        } else {
            // if the bidding is not cancelled, highest bidder can not withdraw
            require(msg.sender != highestBidder, "Auction was cancelled");
        }

        // everyone else that participated, but didn't win should be allowed to withdraw their funds.
        uint256 withdrawalAmount = fundsByBidder[msg.sender];
        address payable withdrawalAccount = msg.sender;

        if (withdrawalAccount == owner) {
            // owner should be allowed to withdrawal highestBid
            withdrawalAmount = highestBindingBid;
        }

        require(withdrawalAmount > 0, "Zero withdrawal not allowed");
        fundsByBidder[withdrawalAccount] = fundsByBidder[withdrawalAccount].sub(
            withdrawalAmount
        );

        bool sent = withdrawalAccount.send(withdrawalAmount);

        require(sent, "withdrawal failed");

        emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);

        return true;
    }

    function cancelAuction()
        public
        override
        onlyOwner
        onlyBeforeEnd
        onlyNotCanceled
        returns (bool)
    {
        cancelled = true;
        emit LogCanceled();
        return true;
    }
}
