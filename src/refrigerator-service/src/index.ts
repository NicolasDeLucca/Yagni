import express from "express";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";
import routes from "./controller";

import logger from "../../logging/src/logger";
import consumeOtpKey from './otp-service';
import seedData from "./data-seed";

dotenv.config();

const app = express();
const PORT = process.env.REFRIGERATOR_PORT;

const KEY_NAME = process.env.KEY_NAME;
const CERT_NAME = process.env.CERT_NAME;
const CA_NAME = process.env.CA_NAME;

const key = fs.readFileSync(`${KEY_NAME}.pem`);
const cert = fs.readFileSync(`${CERT_NAME}.pem`);
const ca = [fs.readFileSync(`../security/${CA_NAME}.pem`)];

app.use(express.json());
app.use(routes);

async function main(){
    await seedData();
    consumeOtpKey(key, cert);   
}

main();

https.createServer({ca, key, cert}, app).listen(PORT, async () => {
    console.log(`Refrigerator Service is running on port ${PORT}.`);
    logger.info(`Refrigerator Service is running on port ${PORT}.`);
});