import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guard/index.';
import { AccessTokenJwtStrategy } from './strategy';
import { RefreshTokenJwtStrategy } from './strategy/refresh.token.jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenJwtStrategy, RefreshTokenJwtStrategy, RolesGuard]
})
export class AuthModule {}
