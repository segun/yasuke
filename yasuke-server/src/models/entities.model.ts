import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("tokenInfo")
@Unique("token_info_idx", ["tokenId", "contractAddress"])
export class TokenInfo {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("tokenId-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    tokenId: number;

    @Index("owner-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    owner: string;

    @Index("contract-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()    
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