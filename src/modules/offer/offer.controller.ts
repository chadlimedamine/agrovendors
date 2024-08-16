import { Body, Controller, FileTypeValidator, Get, Header, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Query, StreamableFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/modules/auth/decorator';
import { CreateOfferDto, OfferQueryDto } from './dto/create.offer.dto';
import { OfferService } from './offer.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/modules/auth/guard/jwt.guard';
import { diskStorage } from 'multer';
import {v4 as uuid} from 'uuid';
import { existsSync } from 'fs';
import * as path from 'path';
import { mkdir } from 'fs/promises';
import { CustomFileTypeValidator } from 'src/validators';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';


@ApiTags('Offers')
@Controller('offers')
export class OfferController {
    constructor(private offerService: OfferService){}

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @Post()
    @UseGuards(JwtGuard)
    async createOwnOffer(@GetUser() user: User, @Body() offer: CreateOfferDto){
        return await this.offerService.createOwnOffer(user.id, offer.name, offer.description);
    }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'User not found'})
    @Get('/me')
    @UseGuards(JwtGuard)
    async getMyOffers(
      @GetUser('id') currentUserId: number,
      @Query() query: OfferQueryDto
    ){
        return await this.offerService.getMyOffers(currentUserId,
          query.filterOn, query.filterQuery, 
                                        query.sortOn, query.isAscending ?? true,
                                        query.pageNumber ?? 1, query.pageSize ?? 10
        );
    }
    
    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'Offer not found'})
    @Get('/:id')
    @UseGuards(JwtGuard)
    async getOfferById(
      @Param('id', ParseIntPipe) offerId: number,
    ){
        return await this.offerService.getOfferById(offerId);
    }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'Offer not found'})
    @Post('/:id/images')
    @UseGuards(JwtGuard)
    @UseInterceptors(FilesInterceptor('files', 12, {
        storage: diskStorage({
          destination: async (req: any, file, cb) => {
            const imagesDir = "Images";
            const newAbsoluteDir = path.join(imagesDir, "Offers");
            try{
              if (!existsSync(imagesDir)){
                await mkdir(imagesDir);
              }
              if (!existsSync(newAbsoluteDir)){
                await mkdir(newAbsoluteDir);
              }
            }catch(error){
              console.log(error);
            }
            cb(null, newAbsoluteDir);
          },
          filename: (req, file, cb) => {
            cb(null, Date.now() + uuid() + ".jpeg");
          },
        }),
      }))
    async uploadImages(@Param('id', ParseIntPipe) offerId: number,
    @UploadedFiles(
        new ParseFilePipe(
            {
                validators: [
                    new MaxFileSizeValidator({maxSize: 100000}),
                    new CustomFileTypeValidator({
                      fileType: ['image/jpeg', 'image/png'],
                    }),
                ]
            }
        )
    ) files: Array<Express.Multer.File>){

        return await this.offerService.uplaodImages(offerId, files);
    }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'Offer or Image not found'})
    // @UseGuards(JwtGuard)
    @Header('Content-Type', 'application/jpeg')
    @Header('Content-Disposition', 'attachment; filename="offer_image.jpeg"')
    @Get(':offerId/images/:id')
    async getOfferImagebyId(
      @Param('offerId', ParseIntPipe) offerId: number,
      @Param('id', ParseIntPipe) id: number){
      return await this.offerService.getOfferImagebyId(id, offerId);
    }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'Offer not found'})
    @UseGuards(JwtGuard)
    @Get('/:offerid/images')
    async getOfferimages(
      @Param('offerid', ParseIntPipe) offerId: number
    ){
      return await this.offerService.getOfferImages(offerId);
    }

    // @ApiInternalServerErrorResponse()
    // @ApiBadRequestResponse()
    // // @UseGuards(JwtGuard)
    // @Get()
    // async getOffers(
    //   @Query() query: OfferQueryDto
    // ){
            
    //     return await this.offerService.getOffers(query.filterOn, query.filterQuery, 
    //                                     query.sortOn, query.isAscending ?? true,
    //                                     query.pageNumber ?? 1, query.pageSize ?? 10);
    // }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    // @UseGuards(JwtGuard)
    @Get()
    async getOffers(
      @Query() query: OfferQueryDto
    ){
            
        return await this.offerService.getOffers(query.filterOn, query.filterQuery);
    }
}
