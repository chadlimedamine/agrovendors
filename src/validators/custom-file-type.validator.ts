import { FileValidator, InternalServerErrorException } from '@nestjs/common';
import * as fileType from 'file-type-mime';
import { readFile } from 'node:fs/promises';

export interface CustomFileTypeValidatorOptions {
  fileType: string[];
}

export class CustomFileTypeValidator extends FileValidator {
  private _allowedMimeTypes = [];

  constructor(
    protected readonly validationOptions: CustomFileTypeValidatorOptions,
  ) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public async isValid(file?: Express.Multer.File): Promise<boolean> {
    let response: fileType.Result;
    // if the file is not coming from a memory storage retreive it from disk
    if (!file.buffer) {
        try {
            const fileReadFromDisk = await readFile(file.path); 
            response = fileType.parse(fileReadFromDisk.buffer);
        } catch (error) {
            throw error;
        }
    } else {
        response = fileType.parse(file.buffer);
    }
    return this._allowedMimeTypes.includes(response.mime);
  }

  public buildErrorMessage(file: Express.Multer.File): string {
    return `Upload not allowed.
    File type: ${fileType.parse(file.buffer).mime} is not supported.
    We support the following file types: ${this._allowedMimeTypes}`;
  }
}
