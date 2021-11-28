import { Logger } from '@ethersproject/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import {
  CATEGORIES,
  IssueToken,
  Media,
  TokenInfo,
} from 'src/models/entities.model';
import { Repository } from 'typeorm';
import { ImageService } from './image.service';
import { YasukeService } from './yasuke.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private imageService: ImageService,
    private yasukeService: YasukeService,
  ) {}

  @InjectRepository(TokenInfo)
  tokenInfoRepository: Repository<TokenInfo>;

  @InjectRepository(Media)
  mediaRepository: Repository<Media>;

  async getTokenInfo(tokenId: number): Promise<TokenInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        let blockchainToken = await this.yasukeService.getTokenInfo(tokenId);

        let dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .leftJoinAndSelect('tokenInfo.media', 'media')
          .getOne();

        if (dbToken === undefined) {
          reject('Token with ID not found');
        }

        this.logger.debug(dbToken.media);

        let media = dbToken.media.map((x) => {
          x.tokenInfo = undefined;
          return x;
        });

        this.logger.debug(media);

        blockchainToken.media = media;
        blockchainToken.dateIssued = dbToken.dateIssued;
        blockchainToken.lastAuctionId = dbToken.lastAuctionId;
        blockchainToken.hasActiveAuction = dbToken.hasActiveAuction;
        blockchainToken.description = dbToken.description;
        blockchainToken.assetType = dbToken.assetType;
        blockchainToken.category = dbToken.category;
        resolve(blockchainToken);
      } catch (error) {
        reject(error);
      }
    });
  }

  async listTokens(
    options: IPaginationOptions,
  ): Promise<Pagination<TokenInfo>> {
    const qb = this.tokenInfoRepository.createQueryBuilder('tokenInfo');
    qb.leftJoinAndSelect('tokenInfo.media', 'media');
    return paginate<TokenInfo>(qb, options);
  }

  async checkTokenOwnership(owner: string): Promise<boolean> {
    console.log('Checking Token Ownership...', owner);
    const qb = this.tokenInfoRepository.createQueryBuilder('tokenInfo');
    qb.leftJoinAndSelect('tokenInfo.media', 'media');
    qb.where('owner = :owner', { owner: owner });
    const ownerTokens = await qb.getMany();

    for (let token of ownerTokens) {
      console.log('dbTokenOwner: ', token.owner);
      let blockToken = await this.yasukeService.getTokenInfo(token.id);
      console.log('blockTokenOwner: ', blockToken.owner);
      if (blockToken.owner !== owner) {
        //Update the owner in the database
        token.owner = blockToken.owner;
        await this.tokenInfoRepository.save(token);
      }
    }

    return true;
  }

  async listTokensByOwner(
    options: IPaginationOptions,
    owner: string,
  ): Promise<Pagination<TokenInfo>> {
    await this.checkTokenOwnership(owner);
    const qb = this.tokenInfoRepository.createQueryBuilder('tokenInfo');
    qb.leftJoinAndSelect('tokenInfo.media', 'media');
    qb.where('owner = :owner', { owner: owner });

    return paginate<TokenInfo>(qb, options);
  }

  async toggleSold(tokenId: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        let dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .getOne();
        if (dbToken === undefined) {
          reject('Token with tokenId not found');
        }

        dbToken.sold = !dbToken.sold;
        await this.tokenInfoRepository.save(dbToken);
        resolve(dbToken.sold);
      } catch (error) {
        reject(error);
      }
    });
  }

  async issueToken(issueToken: IssueToken): Promise<TokenInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        let dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: issueToken.tokenId })
          .getOne();

        if (dbToken !== undefined) {
          reject('tokenId already exists');
        }

        dbToken = await this.yasukeService.getTokenInfo(issueToken.tokenId);
        this.logger.debug('Token From Blockchain');
        this.logger.debug(dbToken);
        dbToken.dateIssued = issueToken.dateIssued;
        dbToken.category = issueToken.category;
        dbToken.description = issueToken.description;
        dbToken.assetType = issueToken.assetType;
        dbToken = await this.tokenInfoRepository.save(dbToken);

        // now let's save the images
        let medias: Media[] = [];

        if (issueToken.keys.length === issueToken.medias.length) {
          let count = 0;
          for (let key of issueToken.keys) {
            let dbMedia: Media = await this.mediaRepository
              .createQueryBuilder('media')
              .where('mediaKey = :key', { key: key })
              .andWhere('tokenInfoId = :tiid', { tiid: issueToken.tokenId })
              .getOne();

            if (dbMedia === undefined) {
              const imageUrl: string = await this.imageService.uploadAssetImage(
                issueToken.medias[count],
              );
              dbMedia = {
                tokenInfo: dbToken,
                mediaKey: key,
                media: imageUrl,
              };

              await this.mediaRepository.save(dbMedia);
              dbMedia.tokenInfo = undefined;
              medias.push(dbMedia);
            } else {
              medias.push(dbMedia);
              this.logger.debug(
                `Media Already Exists for tokenId and Key: [${issueToken.tokenId} -> ${key}]`,
              );
            }
            count++;
          }

          dbToken.media = medias;
          dbToken = await this.tokenInfoRepository.save(dbToken);

          resolve(dbToken);
        } else {
          reject('Keys and Medias not the same length');
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
