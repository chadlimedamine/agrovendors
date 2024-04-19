import * as winston from 'winston';
const {format} = winston;

export const winstonGlobalConfig = {
    level: "error",
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new winston.transports.File({filename: 'logs/Global_Caught_Exceptions.log', level: 'error'}),
    ],
};