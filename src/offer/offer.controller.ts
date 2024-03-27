import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { CreateOfferDto } from './dto/create.offer.dto';
import { OfferService } from './offer.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('offers')
export class OfferController {
    constructor(private offerService: OfferService){}

    @Post()
    createOwnOffer(@GetUser() user: User, @Body() offer: CreateOfferDto){
        return this.offerService.createOwnOffer(user.id, offer.name, offer.description);
    }

    @Post('images/:id')
    @UseInterceptors(FilesInterceptor('files', 12))
    uploadImages(@Param('id', ParseIntPipe) offerId: number,
    @UploadedFiles(
        new ParseFilePipe(
            {
                validators: [
                    new MaxFileSizeValidator({maxSize: 1000}),
                    new FileTypeValidator({fileType: 'jpeg'}),
                ]
            }
        )
    ) files: Array<Express.Multer.File>){
        return this.offerService.uplaodImages(offerId, files);
    }
}
