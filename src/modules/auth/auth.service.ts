import { ConflictException, ForbiddenException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoggingService } from 'src/modules/logging/logging.service';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, 
        private config: ConfigService, 
        private jwt: JwtService,
        private readonly logger: LoggingService){}

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
                    roleId: 1
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
            const tokens = await this.generateTokens(user.id, authDto.phoneNumber, user.roleId);
            await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
            return tokens;
        } catch(error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002'){
                    
                    // delete the user if it exists
                    if (userId){
                        await this.prisma.user.delete({
                            where: {
                                id: userId,
                            }
                        });
                    }

                    // check if the password for this user is empty
                    const phoneNumber = await this.prisma.phone.findUnique(
                        {
                            where: {
                                phoneNumber: authDto.phoneNumber
                            }
                        }
                    );

                    const user = await this.prisma.user.findUnique(
                        {
                            where: {
                                id: phoneNumber.userId
                            }
                        }
                    );

                    if (!user.hash)
                        throw new UnprocessableEntityException(`An account for this phone number '${phoneNumber.phoneNumber}' was already created for you. You should now create a password for it!`)
                    
                    throw new ConflictException('a user with that phone number already exists! You should log in!');
                }

                throw error;
            }

            throw error;
        }
    }

    async signin(authDto: AuthSigninDto){
        try{
            // info log testing
            // this.logger.logInfo('testing the info logger!', 'auth.service.signin');
            
            // // throw an error just for testing purposes
            // throw new TypeError('this is a testing thrown error');
            
            // start profiling
            //const profiler = this.logger.startProfiling();

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
                    const tokens = await this.generateTokens(user.id, phoneNumber.phoneNumber, user.roleId);
                    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
                    
                    // save the profiling result after successfully finishin the service call
                    //profiler.done({message: 'auth.service.signin', phoneNumber: authDto.phoneNumber});
                    
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
                    throw error;
            }

            if (error instanceof ForbiddenException)
                throw error;

            throw error;
            // throw new InternalServerErrorException();
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
            const tokens = await this.generateTokens(user.id, phoneNumber, user.roleId);

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

    async generateTokens(userId: Number, phoneNumber: String, roleId: number): Promise<{access_token: String, refresh_token: string}>{
        // get the role of the user
        const role = await this.prisma.role.findFirst({
            where: {
                id: roleId
            }
        });

        // get the permissions associated with this role
        const permissions = await this.prisma.rolePermissions.findMany({
            where: {
                roleId: roleId,
            }
        });

        // get the permisson names 
        const permissionNames = permissions.map(permission => permission.permission);

        // create a jwt paylaod
        const payload = {
            sub: userId,
            phoneNumber,
            role: role.name,
            permissions: permissionNames
        };

        const access_token_secret = this.config.get('ACCESS_TOKEN_JWT_SECRET');
        const refresh_token_secret = this.config.get('REFRESH_TOKEN_JWT_SECRET');


        const [access_token, refresh_token] = await Promise.all([
            this.jwt.signAsync(
                payload,
                {
                    secret: access_token_secret,
                    expiresIn: 60 * 15 * 10,
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
