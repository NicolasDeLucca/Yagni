import express from 'express';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

import { setToken } from './auth';
import logger from '../../logging/src/logger';
import routes from './controller';
 
dotenv.config();

const app = express();

const PORT = process.env.PORT; 
const MOUNT = process.env.MOUNT;

const KEY_NAME = process.env.KEY_NAME;
const CERT_NAME = process.env.CERT_NAME;
const CA_NAME = process.env.CA_NAME;

export const key = fs.readFileSync(`${KEY_NAME}.pem`);
export const cert = fs.readFileSync(`${CERT_NAME}.pem`);
const ca = [fs.readFileSync(`../security/${CA_NAME}.pem`)];

app.use(express.json());
app.use(`/${MOUNT}`, routes);

(async () => {
    const authorizationToken = await setToken();

    app.use((req, res, next) => {
        logger.info('Validating authentication token for Refrigerator App');
        const authToken = req.headers.authorization;
        if (!authToken) {
            logger.error('No token provided');
            return res.status(401).send('No token provided');
        }
        req.headers.authorization += ` Bearer ${authorizationToken}`; 
        next();
    });

    https.createServer({ca, key, cert}, app).listen(PORT, async () => {
        logger.info(`Refrigerator App running on port ${PORT}`);
        console.log(`Refrigerator App running on port ${PORT}`);
    });
})();

