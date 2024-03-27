import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';

import { OfferModule } from './offer/offer.module';
import { OfferController } from './offer/offer.controller';
import { UploadConfigModule } from './upload-config/upload-config.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), AuthModule, UserModule, PrismaModule, AuthorizationModule, OfferModule, UploadConfigModule],
  controllers: [OfferController, ],
})
export class AppModule {}
