import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';

import { OfferModule } from './offer/offer.module';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './uploadConfig/multer.config.service';
import { LoggingModule } from './logging/logging.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}), 
    AuthModule, 
    UserModule, 
    PrismaModule, 
    AuthorizationModule, 
    OfferModule,
    MulterModule.register({
      dest: 'offerImages'
    }),
    LoggingModule],
    providers: [
      {
        provide: APP_FILTER,
        useClass: AllExceptionsFilter,
      },
      {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
      },
    ]
})
export class AppModule {}
