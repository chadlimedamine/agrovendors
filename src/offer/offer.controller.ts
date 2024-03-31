import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { CreateOfferDto } from './dto/create.offer.dto';
import { OfferService } from './offer.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { diskStorage } from 'multer';
import {v4 as uuid} from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';


@Controller('offers')
export class OfferController {
    constructor(private offerService: OfferService){}

    @Post()
    @UseGuards(JwtGuard)
    createOwnOffer(@GetUser() user: User, @Body() offer: CreateOfferDto){
        return this.offerService.createOwnOffer(user.id, offer.name, offer.description);
    }

    @Post(':id/images')
    @UseGuards(JwtGuard)
    @UseInterceptors(FilesInterceptor('files', 12, {
        storage: diskStorage({
          destination: function (req: any, file, cb) {
            const imagesDir = "Images";
            const newAbsoluteDir = path.join(imagesDir, "Offers");
            try{
              if (!existsSync(imagesDir)){
                mkdirSync(imagesDir);
              }
              if (!existsSync(newAbsoluteDir)){
                mkdirSync(newAbsoluteDir);
              }
            }catch(error){
              console.log(error);
            }
            cb(null, newAbsoluteDir);
          },
          filename: function (req, file, cb) {
            cb(null, Date.now() + uuid() + ".jpeg");
          },
        }),
      }))
    uploadImages(@Param('id', ParseIntPipe) offerId: number,
    @UploadedFiles(
        new ParseFilePipe(
            {
                validators: [
                    new MaxFileSizeValidator({maxSize: 10000}),
                    new FileTypeValidator({fileType: 'jpeg'}),
                ]
            }
        )
    ) files: Array<Express.Multer.File>){

        return this.offerService.uplaodImages(offerId, files);
    }
}
