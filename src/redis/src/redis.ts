import redis from 'redis';
import dotenv from 'dotenv';
import logger from '../../logging/src/logger';

dotenv.config();

const MAX_RETRIES = process.env.MAX_REDIS_RETRIES as string;

const redis_client = redis.createClient({
    url: 'redis://localhost:6380',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > Number(MAX_RETRIES)) {
                logger.error('Redis Service - Max retries reached');
                return new Error('Max retries reached');
            }
            return 1000; 
        }
    }
});

export async function connectToRedis(){
    redis_client.connect()
    .then(() => {
        console.log('Succesfully connected to Redis');
        logger.info('Succesfully connected to Redis');
     }) 
    .catch(err => {
        console.error('Failed to connect to Redis.');
        logger.error('Failed to connect to Redis: ', err);
        process.exit(1); 
    });
}

export default redis_client;
