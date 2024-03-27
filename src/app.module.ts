import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';

import { OfferModule } from './offer/offer.module';
import { OfferController } from './offer/offer.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './uploadConfig/multer.config.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}), 
    AuthModule, 
    UserModule, 
    PrismaModule, 
    AuthorizationModule, 
    OfferModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService
    })],
  controllers: [OfferController, ],
})
export class AppModule {}
