import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("tokenInfo")
@Unique("token_info_idx", ["tokenId", "contractAddress"])
export class TokenInfo {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("tokenId-idx") 
    @Column()
    tokenId: number;

    @Index("owner-idx") 
    @Column()    
    owner: string;

    @Index("issuer-idx") 
    @Column()        
    issuer: string;

    @Index("contract-idx") 
    @Column()    
    contractAddress: string;

    @OneToMany(() => Media, media => media.tokenInfo)
    media: Media[];       
    
    @Column()
    symbol: string;

    @Column()
    name: string;

    @Column()
    dateIssued: number;

    @Column()
    hasActiveAuction: boolean;

    @Column()
    lastAuctionId: number;
}

@Entity("auctionInfo")
@Unique("auction_info_idx", ["auctionId"])
export class AuctionInfo {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("auctionId-idx") 
    @Column()
    auctionId: number;

    @Index("tokenId-idx") 
    @Column()
    tokenId: number;

    @Index("owner-idx") 
    @Column()
    owner: string;

    @Column()    
    startBlock: number;

    @Column()    
    endBlock: number;

    @Column()    
    sellNowPrice: number;

    @Column()    
    highestBidder: string;

    @Column()    
    highestBid: number;

    @Column()    
    cancelled: boolean;

    @Column()    
    minimumBid: number;

    @Column()
    isActive: boolean;

    bids: Bid[];       
    _bidders?: string[];
    _bids?: number[];
}

export class Bid {
    auctionId: number;
    tokenId: number;
    bid: number;
    bidder: string;
}

@Entity("media")
export class Media {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Column()
    mediaKey: string;        

    @Column()
    media: string;        

    @ManyToOne(() => TokenInfo, tokenInfo => tokenInfo.media)
    tokenInfo: TokenInfo;
}

export class IssueToken {
    @ApiProperty()
    @IsNotEmpty()
    tokenId: number;

    @ApiProperty()
    @IsNotEmpty()
    dateIssued: number;

    @ApiProperty()
    @IsNotEmpty()
    medias: string[];

    @ApiProperty()
    @IsNotEmpty()    
    keys: string[];            
}