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
    async signup(@Body() authSignupDto: AuthSignupDto){
        return await this.authService.singup(authSignupDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    async signin(@Body() authSigninDto: AuthSigninDto){
        return await this.authService.signin(authSigninDto);
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@GetUser('id') userId: number){
        return await this.authService.logout(userId);
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post('refresh-tokens')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@GetUser('id') userId: number, 
                @GetUser('phoneNumber') phoneNumber: string, 
                @GetUser('refresh_token') refresh_token: string){
                    return await this.authService.refreshTheTokens(userId, phoneNumber, refresh_token);
    }
}
