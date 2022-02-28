import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Buyer } from 'src/models/buyer.model';
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
    private auctionService: AuctionService,
  ) {
    // do nothing
  }

  @Get('/get-token-info/:tokenId')
  async getTokenInfo(@Param('tokenId') tokenId: number, @Headers('chain') chain: string): Promise<Response> {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }
    return ResponseUtils.getSuccessResponse(
      await this.tokenService.getTokenInfo(tokenId, chain),
    );
  }

  @Get('/get-auction-info/:tokenId/:auctionId')
  async getAuctionInfo(
    @Param('tokenId') tokenId: number,
    @Param('auctionId') auctionId: number,
    @Headers('chain') chain: string
  ): Promise<Response> {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }
    return ResponseUtils.getSuccessResponse(
      await this.auctionService.getAuctionInfo(tokenId, auctionId, chain),
    );
  }

  @Get('/get-contract-address')
  async getContractAddress(@Headers('chain') chain: string): Promise<Response> {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }

    let contractAddressKey = `${chain.toUpperCase}_CONTRACT_ADDRESS`;
    return ResponseUtils.getSuccessResponse(
      await this.configService.get<string>(contractAddressKey),
    );
  }

  @Post('/save-issuer')
  @Roles('api')
  @ApiSecurity('api-key')
  async saveIssuer(@Body() issuer: Issuer): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.saveIssuer(issuer),
    );
  }

  @Get('/buyer/by-email/:address')
  async geteBuyerByEmail(@Param('address') address: string): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.getBuyerByEmail(address),
    );
  }

  @Get('/buyer/by-blockchain-address/:address')
  async geteBuyerByBlockchainAddress(
    @Param('address') address: string,
  ): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.getBuyerByBlockchainAddress(address),
    );
  }

  @Post('/save-buyer')
  @Roles('api')
  @ApiSecurity('api-key')
  async saveBuyer(@Body() buyer: Buyer): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.saveBuyer(buyer),
    );
  }

  @Get('is-issuer/:address')
  async isIssuer(@Param('address') address: string): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.isIssuer(address),
    );
  }

  @Post('issue-token/')
  @Roles('api')
  @ApiSecurity('api-key')
  async issueToken(@Body() issueToken: IssueToken, @Headers('chain') chain: string): Promise<Response> {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }
    return ResponseUtils.getSuccessResponse(
      await this.tokenService.issueToken(issueToken, chain),
    );
  }

  @Post(':tokenId/toggle-sold')
  @Roles('api')
  @ApiSecurity('api-key')
  async setSold(@Param('tokenId') tokenId: number, @Headers('chain') chain: string): Promise<Response> {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }
    return ResponseUtils.getSuccessResponse(
      await this.tokenService.toggleSold(tokenId, chain),
    );
  }

  @Get('list-tokens')
  async listTokens(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Headers('chain') chain: string
  ): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.tokenService.listTokens({
        page,
        limit,
        route: '/v3/assets',
      }, chain),
    );
  }

  @Get('list-tokens/by-owner/:owner')
  async listTokensByOwner(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('owner') owner: string,
    @Headers('chain') chain: string
  ): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.tokenService.listTokensByOwner(
        {
          page,
          limit,
          route: '/v3/assets',
        },
        owner,
        chain
      ),
    );
  }

  @Post('change-token-ownership/:tokenId')
  @Roles('api')
  @ApiSecurity('api-key')
  async changeTokenOwnership(@Param('tokenId') tokenId: number, @Headers('chain') chain: string) {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }
    return ResponseUtils.getSuccessResponse(
      await this.tokenService.changeTokenOwnership(tokenId, chain),
    );
  }

  @Post('start-auction')
  @Roles('api')
  @ApiSecurity('api-key')
  async startAuction(@Body() sa: StartAuction, @Headers('chain') chain: string): Promise<Response> {
    if (chain === undefined || chain === '') {
      chain = 'bsc';
    }
    return ResponseUtils.getSuccessResponse(
      await this.auctionService.startAuction(sa, chain),
    );
  }

  @Get('list-auctions/by-token-id/:tokenId')
  async listAuctionsByTokenId(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('tokenId') tokenId: number,
  ): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.auctionService.listAuctionsByTokenId(
        {
          page,
          limit,
          route: '/v3/assets',
        },
        tokenId,
      ),
    );
  }

  @Get('get-block')
  async getBlock(): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.getBlock(),
    );
  }

  @Get('get-account-balance/:address')
  async getAccountBalance(
    @Param('address') address: string,
  ): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.yasukeService.getAccountBalance(address),
    );
  }
}
