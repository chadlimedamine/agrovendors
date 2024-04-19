import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { winstonGlobalConfig, winstonInfoConfig } from './config';

@Injectable()
export class LoggingService {
    private readonly globalLogger: winston.Logger;
    private readonly infoLogger: winston.Logger;

    constructor(){
        winston.loggers.add('GlobalLogger', winstonGlobalConfig);
        winston.loggers.add('InfoLogger', winstonInfoConfig);
        this.globalLogger = winston.loggers.get('GlobalLogger');
        this.infoLogger = winston.loggers.get('InfoLogger');
    }

    globalLog(message, error: Error){
        this.globalLogger.error(message, error);
    }

    logInfo(message, serviceName){
        this.infoLogger.info(message, {serviceName});
    }
}
