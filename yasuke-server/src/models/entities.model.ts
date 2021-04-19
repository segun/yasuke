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

    @Column()    
    @Index("issuer-idx") 
    issuer: string;

    @Index("contract-idx") 
    @Column()    
    contractAddress: string;

    @OneToMany(() => Media, media => media.tokenInfo)
    media: Media[];        
}

@Entity("auctionInfo")
@Unique("auction_info_idx", ["auctionId"])
export class AuctionInfo {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("auctionId-idx") 
    @Column()
    auctionId: number;

    @Column()
    tokenId: number;

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
}

@Entity("media")
export class Media {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Column()
    key: string;        

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
    medias: string[];

    @ApiProperty()
    @IsNotEmpty()    
    keys: string[];            
}