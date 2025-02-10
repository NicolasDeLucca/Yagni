import fs from 'fs'; 
import dotenv from 'dotenv';

import logger from '../../logging/src/logger';
import OSService from './os-service';

dotenv.config();

const KEY_NAME = process.env.KEY_NAME;
const CERT_NAME = process.env.CERT_NAME;

export const key = fs.readFileSync(`${KEY_NAME}.pem`);
export const cert = fs.readFileSync(`${CERT_NAME}.pem`);

const osService = new OSService({ key, cert });

async function main() {
    logger.info('Logistics App - starting order status service..');
    await osService.init();
    await osService.consumeOrderStatus();
}

main();

export { osService };