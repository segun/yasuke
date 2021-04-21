import { Logger } from '@ethersproject/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AuctionInfo, Bid } from 'src/models/entities.model';
import { Repository } from 'typeorm';
import { YasukeService } from './yasuke.service';

@Injectable()
export class AuctionService {
    private readonly logger = new Logger(AuctionService.name);
    constructor(
        private yasukeService: YasukeService
    ) {                
    }

    @InjectRepository(AuctionInfo)
    auctionInfoRepository: Repository<AuctionInfo>;
    

    @InjectRepository(Bid)
    bidRepository: Repository<Bid>;

    async startAuction(auctionId: number, tokenId: number): Promise<AuctionInfo> {
        return new Promise(async (resolve, reject) => {
            try {
                let dbAuction = await this.auctionInfoRepository.createQueryBuilder("auctionInfo")
                    .where("tokenId = :tid", { tid: tokenId })
                    .andWhere("auctionId = :aid", { aid: auctionId })
                    .getOne();

                if (dbAuction !== undefined) {
                    reject('Auction already exists for token');
                }

                dbAuction = await this.yasukeService.getAuctionInfo(tokenId, auctionId);

                dbAuction = await this.auctionInfoRepository.save(dbAuction);

                resolve(dbAuction);
            } catch (error) {
                reject(error);
            }
        });
    }

    async listAuctionsByTokenId(options: IPaginationOptions, tokenId: number): Promise<Pagination<AuctionInfo>> {
        const qb = this.auctionInfoRepository.createQueryBuilder("auctionInfo")
            .where("tokenId = :tid", { tid: tokenId });
        return paginate<AuctionInfo>(qb, options);
    }

    async getAuction(auctionId: number, tokenId: number): Promise<AuctionInfo> {
        return new Promise(async (resolve, reject) => {
            try {
                let blockchainAuction = await this.yasukeService.getAuctionInfo(tokenId, auctionId);

                let dbAuction = await this.auctionInfoRepository.createQueryBuilder("auctionInfo")
                    .where("tokenId = :tid", { tid: tokenId })
                    .andWhere("auctionId = :aid", { aid: auctionId })
                    .getOne();

                if (dbAuction === undefined) {
                    reject('Auction for Token not found');
                }

                let _bids = blockchainAuction._bids;
                let _bidders = blockchainAuction._bidders;

                let count = 0;

                let bids: Bid[] = [];
                for(let b of _bids) {
                    let _bidder = _bidders[count];
                    let _bid = +ethers.utils.formatEther(b);
                    let dbBid: Bid = {
                        auctionId: auctionId,
                        tokenId: tokenId,
                        bid: _bid,
                        bidder: _bidder
                    }   
                                        
                    bids.push(dbBid);
                }

                dbAuction.bids = bids;

                resolve(dbAuction);
            } catch (error) {
                reject(error);
            }
        });
    }

}
