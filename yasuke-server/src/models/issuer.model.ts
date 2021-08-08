import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Column, Index, Entity, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issuer')
@Unique('issuer_idx', ['email', 'phoneNumber', 'blockchainAddress'])
export class Issuer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Index('email-idx')
  @ApiProperty()
  @IsNotEmpty()
  @Column()
  email: string;

  @Index('phone-number-idx')
  @ApiProperty()
  @IsNotEmpty()
  @Column()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  middleName: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  lastName: string;

  @Index('b-address-idx')
  @ApiProperty()
  @IsNotEmpty()
  @Column()
  blockchainAddress: string;

  @Column()
  enabled: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  bankName: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  bankAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  accountName: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  bankCode?: string = "0";

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  IBAN?: string = "0";
}
