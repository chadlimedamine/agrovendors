import * as winston from 'winston';
const {format} = winston;

export const winstonProfilingConfig = {
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.prettyPrint(),
    ),
    transports: [
        new winston.transports.File({filename: 'logs/Profiling.log', level: 'info'}),
    ],
};