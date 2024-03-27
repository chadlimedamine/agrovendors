import { Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import multer from "multer";
import {v4 as uuid} from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {

    const imagesOfferStorageEngine = multer.diskStorage({
        destination: 'offerImages/',
        filename: (req, file, cb) => {
            const uniqueFileName = Date.now() + '_' + uuid();
            cb(null, uniqueFileName + file.filename)
        }
    });
    const imageOfferStorage = {storage: imagesOfferStorageEngine};
    return imageOfferStorage;
  }
}