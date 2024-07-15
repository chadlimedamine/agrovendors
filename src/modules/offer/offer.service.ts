import { Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Offer } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createReadStream, existsSync } from 'fs';
import { ArgumentOutOfRangeError } from 'rxjs';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class OfferService {
    constructor(private prisma: PrismaService, private config: ConfigService){}

    async createOwnOffer(userId: number, name: string, description: string | undefined){
        // create the offer
        const offer = await this.prisma.offer.create({
            data: {
                name: name,
                description: description,
                owner: {
                    connect: {
                        id: userId,
                    }
                },
                createdBy: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
        
        return offer;
    }

    async getOfferById(
        offerId: number) {
        const offer = await this.prisma.offer.findFirst({
            where: {
                id: offerId
            },
            include: {
                images: true
            }
        });

        if (!offer) 
            throw new NotFoundException("offer doesn't exists");

        return offer;
    }

    async getMyOffers(
        currentUserId: number,
        filterOn: string | undefined, filterQuery: string | undefined, 
        sortOn: string | undefined, isAscending: boolean = true, 
        pageNumber: number = 1, pageSize: number = 10) {
        const user = await this.prisma.user.findFirst(
            {
                where: {
                    id: currentUserId,
                }
            }
        );

        if (!user)
            throw new NotFoundException('user not found!');

        // ########## this is an optimized function to perform ####################
            // ########## filtering, sorting, and pagination       ####################

            // the list of users to be returned
            let offers: Partial<Offer>[];

            // filtering
            if (filterOn){
                if (filterOn === 'description'){
                    offers = await this.prisma.offer.findMany({
                        where: {
                            description: {
                                contains: filterQuery,
                                mode: 'insensitive',
                            },
                            ownerId: currentUserId,
                        },
                        select: {
                            id: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                            name: true,
                            createdBy: true,
                            owner: true,
                            images: true,
                        }
                    });
                }
            } else {
                // if there is no filterOn query provided just return all the users
                offers = await this.prisma.offer.findMany(
                    {
                        where: {
                            ownerId: currentUserId,
                        },
                        select: {
                            id: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                            name: true,
                            createdBy: true,
                            owner: true,
                            images: true,
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
                if (sortOn === 'description'){
                    offers = isAscending ? offers.sort((a, b) => a.description.localeCompare(b.description))
                    : offers.sort((a, b) => b.description.localeCompare(a.description));
                }
            }

            // pagination
            const skipResults = (pageNumber - 1) * pageSize;
            const lastItem = pageNumber * pageSize;

            // users = await this.prisma.user.findMany({
            //     skip: skipResults,
            //     take: pageSize,
            // });

            offers = offers.slice(skipResults, lastItem);

            return offers;
    }

    async getOfferImages(offerId: number){
        try{
            // throw an error for testing purposes
            // throw new RangeError();

            // get the offer to check if it exists
            const offer = await this.prisma.offer.findFirstOrThrow({
                where: {
                    id: offerId,
                }
            });

            // get all the iages that belongs to the offer of interest
            const images = await this.prisma.image.findMany({
                where: {
                    belognsToId: offerId
                }
            });

            // get the URLs of the images
            return images.map(image => `${this.config.get('APP_URL')}/offers/${offerId}/images/${image.id}`);

        }catch(error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2025'){
                    throw new NotFoundException('Offer not found!');
                }else{
                    throw error;
                }
            }else{
                throw error;
            }
        }
    }
    async uplaodImages(offerId: number, files: Array<Express.Multer.File>){
        try{
            // check if the offer exists
        const offer = await this.prisma.offer.findFirstOrThrow({
            where: {
                id: offerId
            }
        });

        // associate the images to their offers
        files.forEach(async file => await this.prisma.image.create({
            data: {
                path: file.path,
                belognsTo: {
                    connect: {
                        id: offerId,
                    }
                }
            }
        }));
        }catch (error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2025'){
                    throw new NotFoundException('Offer not found! You cannot add images to a non existing offer.');
                }else{
                    throw error;
                }
            }else{
                throw error;
            }
        }

    }

    async getOfferImagebyId(id: number, offerId: number) {
        
        try{
            const offer = await this.prisma.offer.findFirstOrThrow({
                where: {
                    id: offerId
                }
            }); 
            const image = await this.prisma.image.findFirstOrThrow({
                where: {
                    id: id,
                }
            });

        // check if the image exists on the hard drive
        if (!existsSync(image.path)){
            throw new InternalServerErrorException('file not found on the disk');
        }
        const imageFile = createReadStream(image.path);
        return new StreamableFile(imageFile);

        }catch (error){
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2025'){
                    throw new NotFoundException('Not found Image or Offer!');
                }else{
                    throw error;
                }
            }else{
                throw error;
            }
        }
    }

    async getOffers(filterOn: string | undefined, filterQuery: string | undefined, 
        sortOn: string | undefined, isAscending: boolean = true, 
        pageNumber: number = 1, pageSize: number = 10){

            // ########## this is an optimized function to perform ####################
            // ########## filtering, sorting, and pagination       ####################

            // the list of users to be returned
            let offers: Partial<Offer>[];

            // filtering
            if (filterOn){
                if (filterOn === 'description'){
                    offers = await this.prisma.offer.findMany({
                        where: {
                            description: {
                                contains: filterQuery,
                                mode: 'insensitive',
                            }
                        },
                        select: {
                            id: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                            name: true,
                            createdBy: true,
                            owner: true,
                            images: true,
                        }
                    });
                }
            } else {
                // if there is no filterOn query provided just return all the users
                offers = await this.prisma.offer.findMany(
                    {
                        select: {
                            id: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                            name: true,
                            createdBy: true,
                            owner: true,
                            images: true,
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
                if (sortOn === 'description'){
                    offers = isAscending ? offers.sort((a, b) => a.description.localeCompare(b.description))
                    : offers.sort((a, b) => b.description.localeCompare(a.description));
                }
            }

            // pagination
            const skipResults = (pageNumber - 1) * pageSize;
            const lastItem = pageNumber * pageSize;

            // users = await this.prisma.user.findMany({
            //     skip: skipResults,
            //     take: pageSize,
            // });

            offers = offers.slice(skipResults, lastItem);

            return offers;
    }
}
