import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Index, Entity, Unique, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";

@Entity("issuer")
@Unique("issuer_idx", ["email", "phoneNumber", "blockchainAddress"])
export class Issuer {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("email-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    email: string;    

    @Index("phone-number-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    phoneNumber: string;        

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    firstName: string    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    middleName: string    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    lastName: string   

    @Index("b-address-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    blockchainAddress: string;       
}