import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto } from './dto';

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
}
