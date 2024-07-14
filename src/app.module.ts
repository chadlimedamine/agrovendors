import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './modules/authorization/authorization.module';

import { OfferModule } from './modules/offer/offer.module';
import { MulterModule } from '@nestjs/platform-express';
import { LoggingModule } from './modules/logging/logging.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ProfilingInterceptor } from './interceptors/profiling/profiling.interceptor';
import { PhoneNumbersModule } from './modules/phone-numbers/phone-numbers.module';

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
    LoggingModule,
    PhoneNumbersModule],
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
