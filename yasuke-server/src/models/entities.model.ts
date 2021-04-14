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

@Entity("auctionInfo")
@Unique("auction_info_idx", ["auctionId"])
export class AuctionInfo {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("auctionId-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    auctionId: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    tokenId: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    owner: string;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    startBlock: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    endBlock: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    sellNowPrice: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    highestBidder: string;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    highestBid: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    cancelled: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @Column()    
    minimumBid: number;
}