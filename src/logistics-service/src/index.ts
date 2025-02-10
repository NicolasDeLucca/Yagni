import express from 'express';
import fs from "fs";
import https from "https";
import dotenv from "dotenv";

import seedData from './data-seed';
import routes from "./controller";
import OSService from "./os-service";
import logger from "../../logging/src/logger";

dotenv.config();

const app = express();
const PORT = process.env.LOGISTICS_PORT; 

const KEY_NAME = process.env.KEY_NAME;
const CERT_NAME = process.env.CERT_NAME;
const CA_NAME = process.env.CA_NAME;

app.use(express.json());
app.use(routes);

const key = fs.readFileSync(`${KEY_NAME}.pem`);
const cert = fs.readFileSync(`${CERT_NAME}.pem`);
const ca = [fs.readFileSync(`${CA_NAME}.pem`)];

https.createServer({ca, key, cert}, app).listen(PORT, async () => {
    console.log(`Logistics Service is running on port ${PORT}.`);
    logger.info(`Logistics Service is running on port ${PORT}.`);
});

const osService = new OSService({ key, cert });

async function main() {
    logger.info('Logistics Service - starting order status service..');
    await seedData();
    await osService.init();
    await osService.consumeOrderStatus();
}

main();

export { osService };
