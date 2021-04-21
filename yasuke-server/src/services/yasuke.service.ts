import { Injectable, Logger } from '@nestjs/common';
import { AuctionInfo, Media, TokenInfo } from 'src/models/entities.model';
import { Contract, ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issuer } from 'src/models/issuer.model';
import { Utils } from 'src/utils';
import { ImageService } from './image.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

@Injectable()
export class YasukeService {
    provider: ethers.providers.JsonRpcProvider;
    yasukeContract: Contract;
    yasukeAddress: string;
    yasukeAbi: string;
    webProvider: string;

    @InjectRepository(Media)
    private mediaRepository: Repository<Media>;
    @InjectRepository(Issuer)
    private issuerRepository: Repository<Issuer>;
    @InjectRepository(TokenInfo)
    private tokenInfoRepository: Repository<TokenInfo>;
    @InjectRepository(AuctionInfo)
    private auctionInfoRepository: Repository<AuctionInfo>;


    private readonly logger = new Logger(YasukeService.name);

    constructor(
        private configService: ConfigService,
        private imageService: ImageService
    ) {
        this.webProvider = this.configService.get<string>('WEB3_PROVIDER');
        this.yasukeAddress = this.configService.get<string>('CONTRACT_ADDRESS');
        this.provider = new ethers.providers.JsonRpcProvider(this.webProvider);
        this.yasukeAbi = JSON.parse(fs.readFileSync(path.resolve('src/abis/Yasuke.json'), 'utf8')).abi;
        this.yasukeContract = new ethers.Contract(this.yasukeAddress, this.yasukeAbi, this.provider);
    }

    async saveIssuer(issuer: Issuer): Promise<Issuer> {
        return new Promise(async (resolve, reject) => {
            try {
                let dbIssuer = await this.issuerRepository.createQueryBuilder("issuer")
                    .where("blockchainAddress = :bad", { bad: issuer.blockchainAddress })
                    .getOne();
                if (dbIssuer !== undefined) {
                    reject("Issuer with blockchain address already exists");
                }

                dbIssuer = await this.issuerRepository.createQueryBuilder("issuer")
                    .where("phoneNumber = :bad", { bad: issuer.phoneNumber })
                    .getOne();
                if (dbIssuer !== undefined) {
                    reject("Issuer with phone number already exists");
                }

                dbIssuer = await this.issuerRepository.createQueryBuilder("issuer")
                    .where("email = :bad", { bad: issuer.email })
                    .getOne();
                if (dbIssuer !== undefined) {
                    reject("Issuer with email already exists");
                }

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
                    dateIssued: 0
                }

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

    async getAuctionInfo(tokenId: number, auctionId: number): Promise<AuctionInfo> {
        return new Promise(async (resolve, reject) => {
            try {
                const ai = await this.yasukeContract.getAuctionInfo(tokenId, auctionId);
                const auctionInfo: AuctionInfo = {
                    auctionId: ai[0].toNumber(),
                    tokenId: ai[1].toNumber(),
                    owner: ai[2],
                    startBlock: ai[3].toNumber(),
                    endBlock: ai[4].toNumber(),
                    sellNowPrice: +ethers.utils.formatEther(ai[5]),
                    highestBidder: ai[6],
                    highestBid: +ethers.utils.formatEther(ai[7]),
                    cancelled: ai[8],
                    minimumBid: +ethers.utils.formatEther(ai[9]),
                    bids: [],
                    _bidders: ai[10],
                    _bids: ai[11]
                }

                this.logger.debug(auctionInfo);

                if (auctionInfo.owner === Utils.address0) {
                    reject("Auction not found on blockchain");
                }
                resolve(auctionInfo);
            } catch (error) {
                reject(error);
            }
        });
    }
}