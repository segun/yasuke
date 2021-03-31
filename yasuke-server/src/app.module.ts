import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { YasukeController } from './controllers/yasuke.controller';
import { AuthGuard } from './guards/auth.guard';
import { YasukeService } from './services/yasuke.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
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
