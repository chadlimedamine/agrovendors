import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async getAuthenticatedUser(user){
        return user;
    }
    
    async getUsers(filterOn: string | undefined, filterQuery: string | undefined, 
        sortOn: string | undefined, isAscending: boolean = true, 
        pageNumber: number = 1, pageSize: number = 10){

            // ########## this is an optimized function to perform ####################
            // ########## filtering, sorting, and pagination       ####################

            // the list of users to be returned
            let users: Partial<User>[];

            // filtering
            if (filterOn){
                if (filterOn === 'fullName'){
                    users = await this.prisma.user.findMany({
                        where: {
                            fullName: {
                                contains: filterQuery,
                                mode: 'insensitive',
                            }
                        },
                        select: {
                            id: true,
                            fullName: true,
                            role: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            },
                            createdAt: true,
                            updatedAt: true,
                            facebookProfileUrl: true,
                            phoneNumbers: {
                                select: {
                                   id: true,
                                   phoneNumber: true, 
                                }
                            },
                            offers: true
                        }
                    });
                }
            } else {
                // if there is no filterOn query provided just return all the users
                users = await this.prisma.user.findMany(
                    {
                        select: {
                            id: true,
                            fullName: true,
                            role: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            },
                            createdAt: true,
                            updatedAt: true,
                            facebookProfileUrl: true,
                            phoneNumbers: {
                                select: {
                                   id: true,
                                   phoneNumber: true, 
                                }
                            },
                            offers: true
                        }
                    }
                );
            }

            // if (sortOn){
            //     if (sortOn === 'fullName'){
            //         users = isAscending? await this.prisma.user.findMany({
            //             orderBy: {
            //                 fullName: 'asc',
            //             }
            //         }) : await this.prisma.user.findMany({
            //             orderBy: {
            //                 fullName: 'desc',
            //             }
            //         });
            //     }
            //     else if (sortOn === 'associatedText'){
            //         users = isAscending? await this.prisma.user.findMany({
            //             orderBy: {
            //                 associatedText: 'asc',
            //             }
            //         }) : await this.prisma.user.findMany({
            //             orderBy: {
            //                 associatedText: 'desc',
            //             }
            //         });
            //     }
            // }

            // sorting
            if (sortOn){
                if (sortOn === 'fullName'){
                    users = isAscending ? users.sort((a, b) => a.fullName.localeCompare(b.fullName))
                    : users.sort((a, b) => b.fullName.localeCompare(a.fullName));
                }
            }

            // pagination
            const skipResults = (pageNumber - 1) * pageSize;
            const lastItem = pageNumber * pageSize;

            // users = await this.prisma.user.findMany({
            //     skip: skipResults,
            //     take: pageSize,
            // });

            users = users.slice(skipResults, lastItem);

            return users;
    }

    async getUserById(id: number){
        try{
            const user = await this.prisma.user.findUniqueOrThrow({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    fullName: true, 
                    facebookProfileUrl: true,
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    phoneNumbers: {
                        select: {
                            id: true,
                            phoneNumber: true,
                        }
                    },
                    offers: true,
                }
            });
            
            return user;
        } catch (error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2025'){
                    throw new NotFoundException("User doesn't exist!");
                }else{
                    throw error;
                }
            }else{
                throw error;
            } 
        }
    }

    async deleteUser(id: number){
        try{
            // the related phone numbers will be deleted with cascade delete applied on the table
            const deleteUser = await this.prisma.user.delete({
                where: {
                    id: id,
                }
            });
            return deleteUser;
        } catch (error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2025'){
                    throw new NotFoundException("User doesn't exist!");
                }else{
                    throw error;
                }
            }else{
                throw error;
            } 
        }
    }
}
