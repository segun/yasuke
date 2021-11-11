import { Injectable, Logger } from '@nestjs/common';
import { AuctionInfo, Media, TokenInfo } from 'src/models/entities.model';
import { Contract, ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issuer } from 'src/models/issuer.model';
import { Utils } from 'src/utils';
import { ImageService } from './image.service';
import { Buyer } from 'src/models/buyer.model';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

@Injectable()
export class YasukeService {
  provider: ethers.providers.JsonRpcProvider;
  yasukeContract: Contract;
  yasukeAddress: string;
  yasukeAbi: string;
  webProvider: string;

  @InjectRepository(Issuer)
  private issuerRepository: Repository<Issuer>;

  @InjectRepository(Buyer)
  private buyerRepository: Repository<Buyer>;

  private readonly logger = new Logger(YasukeService.name);

  constructor(private configService: ConfigService) {
    this.logger.debug(ethers.utils.formatEther('600000000000000000'));
    this.webProvider = this.configService.get<string>('WEB3_PROVIDER');
    this.yasukeAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    this.provider = new ethers.providers.JsonRpcProvider(this.webProvider);
    this.yasukeAbi = JSON.parse(
      fs.readFileSync(path.resolve('src/abis/Yasuke.json'), 'utf8'),
    ).abi;
    this.yasukeContract = new ethers.Contract(
      this.yasukeAddress,
      this.yasukeAbi,
      this.provider,
    );
  }

  async getBlock(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getAccountBalance(address: string): Promise<string> {
    return ethers.utils.formatEther(await this.provider.getBalance(address));
  }

  async isIssuer(address: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbIssuer = await this.issuerRepository
          .createQueryBuilder('issuer')
          .where('blockchainAddress = :bad', { bad: address })
          .getOne();
        if (dbIssuer === undefined) {
          reject('Issuer with blockchain address not found');
        }

        if (!dbIssuer.enabled) {
          reject('Issuer with blockchain address has been blocked');
        }

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async getBuyer(by: string, value: string): Promise<Buyer> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbBuyer = await this.buyerRepository
          .createQueryBuilder('buyer')
          .where(`${by} = :bad`, { bad: value })
          .getOne();

        if (dbBuyer === undefined) {
          reject(`Buyer with ${by}: ${value} not found`);
        } else {
          resolve(dbBuyer);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async getBuyerByEmail(address: string): Promise<Buyer> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(this.getBuyer('email', address));
      } catch (error) {
        reject(error);
      }
    });
  }

  async getBuyerByBlockchainAddress(address: string): Promise<Buyer> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(this.getBuyer('blockchainAddress', address));
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveBuyer(buyer: Buyer): Promise<Buyer> {
    return new Promise(async (resolve, reject) => {
      try {
        let dbBuyer = await this.buyerRepository
          .createQueryBuilder('buyer')
          .where('blockchainAddress = :bad', { bad: buyer.blockchainAddress })
          .getOne();

        if (dbBuyer !== undefined) {
          reject('Buyer with Blockchain Address already exists');
        }

        dbBuyer = await this.buyerRepository
          .createQueryBuilder('buyer')
          .where('phoneNumber = :bad', { bad: buyer.phoneNumber })
          .getOne();
        if (dbBuyer !== undefined) {
          reject('Buyer with Phone Number already exists');
        }

        dbBuyer = await this.buyerRepository
          .createQueryBuilder('buyer')
          .where('email = :bad', { bad: buyer.email })
          .getOne();

        if (dbBuyer !== undefined) {
          reject('Buyer with Email Address already exists');
        }

        buyer.enabled = true;

        dbBuyer = await this.buyerRepository.save(buyer);

        resolve(dbBuyer);
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveIssuer(issuer: Issuer): Promise<Issuer> {
    return new Promise(async (resolve, reject) => {
      try {
        let dbIssuer = await this.issuerRepository
          .createQueryBuilder('issuer')
          .where('blockchainAddress = :bad', { bad: issuer.blockchainAddress })
          .getOne();
        if (dbIssuer !== undefined) {
          reject('Issuer with blockchain address already exists');
        }

        dbIssuer = await this.issuerRepository
          .createQueryBuilder('issuer')
          .where('phoneNumber = :bad', { bad: issuer.phoneNumber })
          .getOne();
        if (dbIssuer !== undefined) {
          reject('Issuer with phone number already exists');
        }

        dbIssuer = await this.issuerRepository
          .createQueryBuilder('issuer')
          .where('email = :bad', { bad: issuer.email })
          .getOne();
        if (dbIssuer !== undefined) {
          reject('Issuer with email already exists');
        }

        issuer.enabled = true;
        dbIssuer = await this.issuerRepository.save(issuer);

        resolve(dbIssuer);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getTokenInfo(tokenId: number): Promise<TokenInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const ti = await this.yasukeContract.getTokenInfo(tokenId);
        this.logger.debug('Token from Blockchain - 1');
        this.logger.debug(ti);
        const tokenInfo: TokenInfo = {
          tokenId: ti[0].toNumber(),
          owner: ti[1],
          issuer: ti[2],
          contractAddress: ti[3],
          symbol: ti[4],
          name: ti[5],
          media: [],
          dateIssued: 0,
          hasActiveAuction: false,
          lastAuctionId: 0,
          category: '',
          sold: false,
          description: '',
          assetType: '',
        };

        this.logger.debug(tokenInfo);
        resolve(tokenInfo);
      } catch (error) {
        if (error.reason === 'TINF') {
          reject(`Token with id ${tokenId} not found`);
        } else {
          reject(error);
        }
      }
    });
  }

  async getAuctionInfo(
    tokenId: number,
    auctionId: number,
  ): Promise<AuctionInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const ai = await this.yasukeContract.getAuctionInfo(tokenId, auctionId);
        this.logger.debug(`Auction Info From Blockchain: ${ai}`);
        const auctionInfo: AuctionInfo = {
          tokenId: ai[0].toNumber(),
          auctionId: ai[1].toNumber(),
          owner: ai[2],
          startBlock: ai[3].toNumber(),
          endBlock: ai[4].toNumber(),
          currentBlock: ai[5].toNumber(),
          sellNowPrice: ethers.utils.formatEther(ai[6] + ''),
          highestBidder: ai[7],
          highestBid: ethers.utils.formatEther(ai[8] + ''),
          cancelled: ai[9],
          minimumBid: ethers.utils.formatEther(ai[10] + ''),
          bids: [],
          _bidders: ai[11],
          _bids: ai[12],
          isActive: ai[13],
          sellNowTriggered: ai[14],
        };

        this.logger.debug(auctionInfo);

        if (auctionInfo.owner === Utils.address0) {
          reject('Auction not found on blockchain');
        }
        resolve(auctionInfo);
      } catch (error) {
        reject(error);
      }
    });
  }
}
