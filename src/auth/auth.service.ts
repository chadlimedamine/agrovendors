import { ConflictException, ForbiddenException, HttpCode, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private config: ConfigService, private jwt: JwtService){}

    async singup(authDto: AuthSignupDto){

        // use this variable to capture the id of the created user
        let userId: number = 0;

        try{
            // generate a salt
            const salt = await bcrypt.genSalt();

            // generate hash
            const hash = await bcrypt.hash(authDto.password, salt);

            // save user to DB
            const user = await this.prisma.user.create({
                data: {
                    fullName: authDto.fullName,
                    hash: hash,
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
            return this.signToken(user.id, authDto.phoneNumber);
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
                else
                    return this.signToken(user.id, phoneNumber.phoneNumber);
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

    async signToken(userId: Number, phoneNumber: String): Promise<{access_token: String}>{
        const payload = {
            sub: userId,
            phoneNumber
        };

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(
            payload,
            {
                secret: secret,
                expiresIn: '15m',
            },
        );

        return {
            access_token: token,
        };
    }
}
