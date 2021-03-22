//SPDX-License-Identifier: MIT-0
pragma solidity ^0.7.0;

interface AuctionInterface {
    function placeBid() external payable returns (bool);

    function withdraw() external returns (bool);

    function cancelAuction() external returns (bool);

    event LogBid(address bidder, uint256 bid);

    event LogWithdrawal(
        address withdrawer,
        address withdrawalAccount,
        uint256 amount
    );

    event LogCanceled();

    event LogSold(address bidder, uint256 bid, uint256 amount);
}
