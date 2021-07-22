import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Column, Index, Entity, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity('buyer')
@Unique('buyer_idx', ['email', 'phoneNumber', 'blockchainAddress'])
export class Buyer {
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

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  country: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  zipCode: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  state: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  street: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  houseNumber: string;
}
