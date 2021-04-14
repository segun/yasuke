import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
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
    @Roles("api")
    @ApiSecurity('api-key')
    async saveIssuer(@Body() issuer: Issuer): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.saveIssuer(issuer));
    }

    @Post('issue-token/:tokenId')
    @Roles("api")
    @ApiSecurity('api-key')
    async issueToken(@Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.issueToken(tokenId));
    }

    @Get('list-tokens')
    async listTokens(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.listTokens({
            page,
            limit,
            route: '/v3/assets',
        }));
    }

    @Get('list-tokens/by-owner/:owner')
    async listTokensByOwner(@Query('page') page: number, @Query('limit') limit: number, @Param("owner") owner: string): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.listTokensByOwner({
            page,
            limit,
            route: '/v3/assets',
        }, owner));
    }

    @Get('get-token/:tokenId')
    async getToken(@Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.getToken(tokenId));
    }

    @Post('start-auction/:auctionId/:tokenId')
    @Roles("api")
    @ApiSecurity('api-key')
    async startAuction(@Param("auctionId") auctionId: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.startAuction(auctionId, tokenId));
    }

    @Get('list-auctions/by-token-id/:tokenId')
    async listAuctionsByTokenId(@Query('page') page: number, @Query('limit') limit: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.listAuctionsByTokenId({
            page,
            limit,
            route: '/v3/assets',
        }, tokenId));
    }    
}