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
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ProfilingInterceptor } from './interceptors/profiling/profiling.interceptor';

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
      {
        provide: APP_INTERCEPTOR,
        useClass: ProfilingInterceptor,
      }
    ]
})
export class AppModule {}
