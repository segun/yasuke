import { Logger } from '@ethersproject/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { IssueToken, Media, TokenInfo } from 'src/models/entities.model';
import { Repository } from 'typeorm';
import { ImageService } from './image.service';
import { YasukeService } from './yasuke.service';

@Injectable()
export class TokenService {

    private readonly logger = new Logger(TokenService.name);

    constructor(
        private imageService: ImageService,
        private yasukeService: YasukeService,
    ) {

    }

    @InjectRepository(TokenInfo)
    tokenInfoRepository: Repository<TokenInfo>

    @InjectRepository(Media)
    mediaRepository: Repository<Media>

    async getToken(tokenId: number): Promise<TokenInfo> {
        return new Promise(async (resolve, reject) => {
            try {
                let blockchainToken = await this.yasukeService.getTokenInfo(tokenId);

                let dbToken = await this.tokenInfoRepository.createQueryBuilder("tokenInfo")
                    .where("tokenId = :tid", { tid: tokenId })
                    .leftJoinAndSelect("tokenInfo.media", "media")
                    .getOne();

                if (dbToken === undefined) {
                    reject("Token with ID not found");
                }
                
                let media = dbToken.media.map(x => {
                    x.tokenInfo = undefined;
                    return x;
                });

                blockchainToken.media = media;
                blockchainToken.dateIssued = dbToken.dateIssued;                
                resolve(blockchainToken);
            } catch (error) {
                reject(error);
            }
        });
    }

    async listTokens(options: IPaginationOptions): Promise<Pagination<TokenInfo>> {
        const qb = this.tokenInfoRepository.createQueryBuilder("tokenInfo");
        qb.leftJoinAndSelect("tokenInfo.media", "media")
        return paginate<TokenInfo>(qb, options);
    }

    async listTokensByOwner(options: IPaginationOptions, owner: string): Promise<Pagination<TokenInfo>> {
        const qb = this.tokenInfoRepository.createQueryBuilder("tokenInfo");
        qb.leftJoinAndSelect("tokenInfo.media", "media")
        qb.where("owner = :owner", { owner: owner });
        return paginate<TokenInfo>(qb, options);
    }    

    async issueToken(issueToken: IssueToken): Promise<TokenInfo> {
        return new Promise(async (resolve, reject) => {
            try {
                let dbToken = await this.tokenInfoRepository.createQueryBuilder("tokenInfo")
                    .where("tokenId = :tid", { tid: issueToken.tokenId })
                    .getOne()

                if (dbToken !== undefined) {
                    reject("tokenId already exists");
                }

                dbToken = await this.yasukeService.getTokenInfo(issueToken.tokenId);
                this.logger.debug('Token From Blockchain');
                this.logger.debug(dbToken);
                dbToken = await this.tokenInfoRepository.save(dbToken);

                // now let's save the images                
                let medias: Media[] = [];

                if (issueToken.keys.length === issueToken.medias.length) {
                    let count = 0;
                    for (let key of issueToken.keys) {
                        let dbMedia: Media = await this.mediaRepository.createQueryBuilder("media")
                            .where("mediaKey = :key", { key: key })
                            .andWhere("tokenInfoId = :tiid", { tiid: issueToken.tokenId })
                            .getOne();

                        if (dbMedia === undefined) {
                            const imageUrl: string = await this.imageService.uploadAssetImage(issueToken.medias[count]);
                            dbMedia = {
                                tokenInfo: dbToken,
                                mediaKey: key,
                                media: imageUrl
                            }

                            await this.mediaRepository.save(dbMedia);
                            dbMedia.tokenInfo = undefined;
                            medias.push(dbMedia);
                        } else {
                            medias.push(dbMedia);
                            this.logger.debug(`Media Already Exists for tokenId and Key: [${issueToken.tokenId} -> ${key}]`);
                        }
                        count++;
                    }

                    dbToken.media = medias;
                    dbToken = await this.tokenInfoRepository.save(dbToken);
                    resolve(dbToken);
                } else {
                    reject("Keys and Medias not the same length");
                }
            } catch (error) {
                reject(error);
            }
        });
    }    
}
