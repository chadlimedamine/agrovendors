import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private prisma: PrismaService, config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('ACCESS_TOKEN_JWT_SECRET'),
        });
    }

    async validate(payload: { sub: number; phoneNumber: string; }) {

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        });

        delete user.hash;

        // type PhoneNumber = {
        //     phoneNumber: string;
        //     }
        // type UserWithPhone = User & PhoneNumber;
        // const userWithPhone: UserWithPhone = {...user, phoneNumber: payload.phoneNumber};
        return { ...user, phoneNumber: payload.phoneNumber };
    }
}
