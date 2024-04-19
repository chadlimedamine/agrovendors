import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { winstonGlobalConfig, winstonInfoConfig } from './config';
import { winstonProfilingConfig } from './config/winston-profiling.config';

@Injectable()
export class LoggingService {
    private readonly globalLogger: winston.Logger;
    private readonly infoLogger: winston.Logger;
    private readonly profilingLogger: winston.Logger;

    constructor(){
        winston.loggers.add('GlobalLogger', winstonGlobalConfig);
        winston.loggers.add('InfoLogger', winstonInfoConfig);
        winston.loggers.add('ProfilingLogger', winstonProfilingConfig);
        this.globalLogger = winston.loggers.get('GlobalLogger');
        this.infoLogger = winston.loggers.get('InfoLogger');
        this.profilingLogger = winston.loggers.get('ProfilingLogger');
    }

    globalLog(message, error: Error){
        this.globalLogger.error(message, error);
    }

    logInfo(message, serviceName){
        this.infoLogger.info(message, {serviceName});
    }

    startProfiling(){
        return this.profilingLogger.startTimer()
    }
}
