import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YasukeController } from './controllers/yasuke.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuctionInfo, Bid, Media, TokenInfo } from './models/entities.model';
import { Issuer } from './models/issuer.model';
import { ImageService } from './services/image.service';
import { YasukeService } from './services/yasuke.service';
import { TokenService } from './services/token.service';
import { AuctionService } from './services/auction.service';
import { ICOController } from './controllers/ico.controller';
import { ICOService } from './services/ico.service';
import { Whitelist } from './models/whitelist.model';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([Issuer, TokenInfo, AuctionInfo, Media, Whitelist]),    
  ],
  controllers: [YasukeController, ICOController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    YasukeService,
    ImageService,
    TokenService,
    AuctionService,
    ICOService,
  ],
})
export class AppModule {}
