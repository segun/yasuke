export class TokenInfo {
    tokenId: number;
    owner: string;
    contractAddress: string;
}

export class AuctionInfo {
    auctionId: number;
    tokenId: number;
    owner: string;
    startBlock: number;
    endBlock: number;
    sellNowPrice: number;
    highestBidder: string;
    highestBid: number;
    cancelled: boolean;
    minimumBid: number;
}