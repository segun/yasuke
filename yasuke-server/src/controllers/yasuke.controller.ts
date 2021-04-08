import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Issuer } from 'src/models/issuer.model';
import { YasukeService } from 'src/services/yasuke.service';
import { Response, ResponseUtils } from 'src/utils';

@ApiTags('yasuke')
@Controller('yasuke')
export class YasukeController {
    constructor(
        private configService: ConfigService,
        private yasukeService: YasukeService
    ) { }

    @Get('/get-token-info/:tokenId')
    async getTokenInfo(@Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.getTokenInfo(tokenId));
    }

    @Get('/get-auction-info/:tokenId/:auctionId')
    async getAuctionInfo(@Param("tokenId") tokenId: number, @Param("auctionId") auctionId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.getAuctionInfo(tokenId, auctionId));
    }

    @Get("/get-contract-addres")
    async getContractAddress(): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.configService.get<string>('CONTRACT_ADDRESS'));
    }

    @Post('/save-issuer')
    async saveIssuer(@Body() issuer: Issuer): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.saveIssuer(issuer));
    }
}