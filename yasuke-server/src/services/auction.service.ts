import { Logger } from '@ethersproject/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import {
  AuctionInfo,
  Bid,
  StartAuction,
  TokenInfo,
} from 'src/models/entities.model';
import { Repository } from 'typeorm';
import { YasukeService } from './yasuke.service';

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);
  constructor(private yasukeService: YasukeService) {}

  @InjectRepository(AuctionInfo)
  auctionInfoRepository: Repository<AuctionInfo>;

  @InjectRepository(TokenInfo)
  tokenInfoRepository: Repository<TokenInfo>;

  async startAuction(sa: StartAuction): Promise<AuctionInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        let dbAuction = await this.auctionInfoRepository
          .createQueryBuilder('auctionInfo')
          .where('tokenId = :tid', { tid: sa.tokenId })
          .andWhere('auctionId = :aid', { aid: sa.auctionId })
          .getOne();

        if (dbAuction !== undefined) {
          reject('Auction already exists for token');
        }

        let dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: sa.tokenId })
          .getOne();

        this.logger.debug(`DB Token: ${dbToken}`);

        if (dbToken === undefined) {
          reject('Token with token id not found');
        }

        let blockAuction = await this.yasukeService.getAuctionInfo(
          sa.tokenId,
          sa.auctionId,
        );
        blockAuction.startDate = sa.startDate;
        blockAuction.endDate = sa.endDate;
        dbAuction = await this.auctionInfoRepository.save(blockAuction);

        dbToken.lastAuctionId = sa.auctionId;
        dbToken.hasActiveAuction = true;

        this.tokenInfoRepository.save(dbToken);

        resolve(dbAuction);
      } catch (error) {
        reject(error);
      }
    });
  }

  async listAuctionsByTokenId(
    options: IPaginationOptions,
    tokenId: number,
  ): Promise<Pagination<AuctionInfo>> {
    const qb = this.auctionInfoRepository
      .createQueryBuilder('auctionInfo')
      .where('tokenId = :tid', { tid: tokenId });
    return paginate<AuctionInfo>(qb, options);
  }

  async getAuctionInfo(
    tokenId: number,
    auctionId: number,
  ): Promise<AuctionInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        let blockchainAuction = await this.yasukeService.getAuctionInfo(
          tokenId,
          auctionId,
        );

        if (
          blockchainAuction.started === false ||
          blockchainAuction.finished === true
        ) {
          let dbToken = await this.tokenInfoRepository.findOne(tokenId);

          if (dbToken === undefined) {
            reject('Token with token id not found');
          }

          dbToken.hasActiveAuction = false;
          this.tokenInfoRepository.save(dbToken);

          reject('Auction has ended');
        }

        let dbAuction = await this.auctionInfoRepository
          .createQueryBuilder('auctionInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .andWhere('auctionId = :aid', { aid: auctionId })
          .getOne();

        if (dbAuction === undefined) {
          reject('Auction for Token not found');
        }

        let _bids = blockchainAuction._bids;
        let _bidders = blockchainAuction._bidders;

        let count = 0;

        let bids: Bid[] = [];

        _bids.forEach((b, index) => {
          let _bidder = _bidders[index];
          let _bid = +ethers.utils.formatEther(b);
          let dbBid: Bid = {
            auctionId: auctionId,
            tokenId: tokenId,
            bid: _bid,
            bidder: _bidder,
          };

          bids.push(dbBid);
        });

        dbAuction.bids = bids;

        resolve(dbAuction);
      } catch (error) {
        reject(error);
      }
    });
  }
}
