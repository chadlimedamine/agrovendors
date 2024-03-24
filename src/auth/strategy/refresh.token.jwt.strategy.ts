import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt'){
    constructor(config: ConfigService, private prisma: PrismaService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('REFRESH_TOKEN_JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: {sub: number, phoneNumber: string}){
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            }
        });

        // get the refresh token from the authorization header case insensitive
        const refresh_token = request.get('authorization').replace(/bearer/gi, '').trim();
        return {...user, phoneNumber: payload.phoneNumber, refresh_token: refresh_token};
    }

}