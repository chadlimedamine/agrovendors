import { ConflictException, ForbiddenException, HttpCode, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from './enum/role.enum';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private config: ConfigService, private jwt: JwtService){}

    async singup(authDto: AuthSignupDto){

        // use this variable to capture the id of the created user
        let userId: number = 0;

        try{
            // generate a salt
            const salt = await bcrypt.genSalt();

            // generate password hash
            const hash = await bcrypt.hash(authDto.password, salt);

            //  generate 

            // save user to DB
            const user = await this.prisma.user.create({
                data: {
                    fullName: authDto.fullName,
                    hash: hash,
                    roles: [Role.User]
                }
            });

            // save associated phone number to DB
            if (user){
                // capture the id of the created user
                userId = user.id;
                const phoneNumber = await this.prisma.phone.create({
                    data: {
                        phoneNumber: authDto.phoneNumber,
                        user: {
                            connect: {
                                id: user.id,
                            }
                        }
                    }
                });
            }

            // return the newly created user
            const tokens = await this.getTokens(user.id, authDto.phoneNumber);
            await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
            return tokens;
        } catch(error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002'){
                    
                    // delete the user if it exists
                    if (userId){
                        this.prisma.user.delete({
                            where: {
                                id: userId,
                            }
                        });
                    }

                    throw new ConflictException('a user with that phone number already exists!');
                }

                throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async signin(authDto: AuthSigninDto){
        try{
            // check if the user exists using its related phone number
            const phoneNumber = await this.prisma.phone.findFirstOrThrow({
                where: {
                    phoneNumber: authDto.phoneNumber,
                }
            });

            // check if the password is correct
            if (phoneNumber){
                
                // get the related user
                const user  = await this.prisma.user.findFirst({
                    where: {
                        id: phoneNumber.userId,
                    }
                });
                
                // now check the password
                const pwMatches = await bcrypt.compare(authDto.password, user.hash);

                if (!pwMatches)
                    throw new ForbiddenException('Password is incorrect!');
                else{
                    const tokens = await this.getTokens(user.id, phoneNumber.phoneNumber);
                    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
                    return tokens;
                }
            }else{
                throw new NotFoundException("User doesn't exist");
            }
        } catch (error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2025')
                    throw new NotFoundException('user not found!');
                else
                    throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (error instanceof ForbiddenException)
                throw error;

            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async logout(userId: number){
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRefreshToken: null,
            }
        });
    }

    async refreshTheTokens(userId: number, phoneNumber: string, refresh_token: string){
        // get user
        const user  = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        // get hashedrefreshToken
        const hashedrefreshToken = user.hashedRefreshToken;

        // compare the provided refresh token with the hashed one to see if the user is loged out
        const refreshTokenhashMachtes = await bcrypt.compare(refresh_token, hashedrefreshToken ?? '');

        if (refreshTokenhashMachtes){
            // get tokens
            const tokens = await this.getTokens(user.id, phoneNumber);

            // update the refresh token hash to DB
            this.updateRefreshTokenHash(user.id, tokens.refresh_token);

            // return ther tokens
            return tokens;
        }else{
            throw new ForbiddenException('The user is logged out!');
        }
    }

    async updateRefreshTokenHash(userid: number, refresh_token: string){
        // hash the refresh token
        const hashedrefreshToken = await bcrypt.hash(refresh_token, 10);

        // update the hash to DB
        await this.prisma.user.update({
            where: {
                id: userid,
            },
            data: {
                hashedRefreshToken: hashedrefreshToken,
            }
        });
    }

    async getTokens(userId: Number, phoneNumber: String): Promise<{access_token: String, refresh_token: string}>{
        const payload = {
            sub: userId,
            phoneNumber
        };

        const access_token_secret = this.config.get('ACCESS_TOKEN_JWT_SECRET');
        const refresh_token_secret = this.config.get('REFRESH_TOKEN_JWT_SECRET');


        const [access_token, refresh_token] = await Promise.all([
            this.jwt.signAsync(
                payload,
                {
                    secret: access_token_secret,
                    expiresIn: 60 * 15,
                },
            ),
            this.jwt.signAsync(
                payload,
                {
                    secret: refresh_token_secret,
                    expiresIn: 60 * 60 * 24 * 7,
                },
            )
        ]); 
        

        return {
            access_token: access_token,
            refresh_token: refresh_token,
        };
    }
}
