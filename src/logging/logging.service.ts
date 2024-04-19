import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { winstonGlobalConfig } from './config/winston-global.config';

@Injectable()
export class LoggingService {
    private readonly globalLogger: winston.Logger;

    constructor(){
        winston.loggers.add('GlobalLogger', winstonGlobalConfig);
        this.globalLogger = winston.loggers.get('GlobalLogger');
    }

    globalLog(message, error: Error){
        this.globalLogger.error(message, error);
    }
}
