import * as winston from 'winston';
const {format} = winston;

export const winstonGlobalConfig = {
    level: "error",
    format: format.combine(
        format.errors({stack: true}),
        format.timestamp(),
        format.json(),
        format.prettyPrint(),
    ),
    transports: [
        new winston.transports.File({filename: 'logs/Global_Caught_Exceptions.log', level: 'error'}),
    ],
};