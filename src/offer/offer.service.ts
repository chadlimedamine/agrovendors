import { Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createReadStream, existsSync } from 'fs';
import { ArgumentOutOfRangeError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

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
                    throw new InternalServerErrorException();
                }
            }else{
                throw new InternalServerErrorException();
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
            throw new InternalServerErrorException();
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
}
