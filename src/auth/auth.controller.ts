import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { JwtGuard } from './guard/jwt.guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { JwtRefreshTokenGuard } from './guard/jwt.refresh.token.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('signup')
    signup(@Body() authSignupDto: AuthSignupDto){
        return this.authService.singup(authSignupDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() authSigninDto: AuthSigninDto){
        return this.authService.signin(authSigninDto);
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@GetUser('id') userId: number){
        return this.authService.logout(userId);
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post('refresh-tokens')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@GetUser('id') userId: number, 
                @GetUser('phoneNumber') phoneNumber: string, 
                @GetUser('refresh_token') refresh_token: string){
                    return this.authService.refreshTheTokens(userId, phoneNumber, refresh_token);
    }
}
