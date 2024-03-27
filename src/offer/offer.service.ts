import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OfferService {
    constructor(private prisma: PrismaService){}

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

    async uplaodImages(offerId: number, files: Array<Express.Multer.File>){
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
    }
}
