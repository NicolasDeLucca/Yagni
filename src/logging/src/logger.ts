import winston from 'winston';
import logStream from './logStream';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Stream({ stream: logStream })
    ]
});

export default logger;
