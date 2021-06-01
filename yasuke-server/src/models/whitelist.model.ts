import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("whitelist")
export class Whitelist {
    @PrimaryGeneratedColumn()
    id?: number;     
    
    @Column()
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @Column()
    @ApiProperty()
    @IsNotEmpty()    
    lastName: string;    

    @Column()
    @ApiProperty()
    @IsNotEmpty()    
    @Index("email-idx")
    email: string;     
    
    @Column()
    @ApiProperty()
    @IsNotEmpty()    
    amount: number;        

    @Column()
    @ApiProperty()
    @IsNotEmpty()   
    @Index("wallet-address-idx") 
    walletAddress: string;        

    @Column()
    @ApiProperty()
    @IsNotEmpty()    
    @Index("linkedin-url-idx") 
    linkedInURL: string;        

    @Column()
    @ApiProperty()
    @IsNotEmpty()    
    countryOfOrigin: string;        

    @Column()
    @ApiProperty()
    @IsNotEmpty()    
    linkToTweet: string;        
}