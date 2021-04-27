import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { IssueToken, StartAuction } from 'src/models/entities.model';
import { Issuer } from 'src/models/issuer.model';
import { AuctionService } from 'src/services/auction.service';
import { TokenService } from 'src/services/token.service';
import { YasukeService } from 'src/services/yasuke.service';
import { Response, ResponseUtils } from 'src/utils';

@ApiTags('yasuke')
@Controller('yasuke')
export class YasukeController {
    constructor(
        private configService: ConfigService,
        private yasukeService: YasukeService,
        private tokenService: TokenService,
        private auctionService: AuctionService
    ) { }

    @Get('/get-token-info/:tokenId')
    async getTokenInfo(@Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.tokenService.getTokenInfo(tokenId));
    }

    @Get('/get-auction-info/:tokenId/:auctionId')
    async getAuctionInfo(@Param("tokenId") tokenId: number, @Param("auctionId") auctionId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.auctionService.getAuctionInfo(tokenId, auctionId));
    }

    @Get("/get-contract-address")
    async getContractAddress(): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.configService.get<string>('CONTRACT_ADDRESS'));
    }

    @Post('/save-issuer')
    @Roles("api")
    @ApiSecurity('api-key')
    async saveIssuer(@Body() issuer: Issuer): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.saveIssuer(issuer));
    }

    @Get('is-issuer/:address')
    async isIssuer(@Param("address") address: string): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.yasukeService.isIssuer(address));
    }

    @Post('issue-token/')
    @Roles("api")
    @ApiSecurity('api-key')
    async issueToken(@Body() issueToken: IssueToken): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.tokenService.issueToken(issueToken));
    }

    @Get('list-tokens')
    async listTokens(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.tokenService.listTokens({
            page,
            limit,
            route: '/v3/assets',
        }));
    }

    @Get('list-tokens/by-owner/:owner')
    async listTokensByOwner(@Query('page') page: number, @Query('limit') limit: number, @Param("owner") owner: string): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.tokenService.listTokensByOwner({
            page,
            limit,
            route: '/v3/assets',
        }, owner));
    }

    @Post('start-auction')
    @Roles("api")
    @ApiSecurity('api-key')
    async startAuction(@Body() sa: StartAuction): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.auctionService.startAuction(sa));
    }

    @Get('list-auctions/by-token-id/:tokenId')
    async listAuctionsByTokenId(@Query('page') page: number, @Query('limit') limit: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.auctionService.listAuctionsByTokenId({
            page,
            limit,
            route: '/v3/assets',
        }, tokenId));
    }
}