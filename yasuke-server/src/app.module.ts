import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YasukeController } from './controllers/yasuke.controller';
import { AuthGuard } from './guards/auth.guard';
import { Issuer } from './models/issuer.model';
import { YasukeService } from './services/yasuke.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([Issuer]),    
  ],
  controllers: [YasukeController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    YasukeService
  ],
})
export class AppModule {}
