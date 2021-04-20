import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YasukeController } from './controllers/yasuke.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuctionInfo, TokenInfo } from './models/entities.model';
import { Issuer } from './models/issuer.model';
import { ImageService } from './services/image.service';
import { YasukeService } from './services/yasuke.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([Issuer, TokenInfo, AuctionInfo]),    
  ],
  controllers: [YasukeController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    YasukeService,
    ImageService,
  ],
})
export class AppModule {}
