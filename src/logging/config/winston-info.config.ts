import * as winston from 'winston';
const {format} = winston;

export const winstonInfoConfig = {
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.prettyPrint(),
    ),
    transports: [
        new winston.transports.File({filename: 'logs/Info.log', level: 'info'}),
    ],
};