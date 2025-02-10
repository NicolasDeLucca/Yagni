import express from 'express';
import dotenv from 'dotenv';

import { setToken } from './auth';
import logger from '../../logging/src/logger';
import routes from './controller';

dotenv.config();

const app = express();

const PORT = process.env.PORT; 
const MOUNT = process.env.MOUNT;

app.use(express.json());
app.use(`/${MOUNT}`, routes);

(async () => {
    const authorizationToken = await setToken();

    app.use((req, res, next) => {
        logger.info('Validating authentication token for Kitchen App');
        const authToken = req.headers.authorization;
        if (!authToken) {
            logger.error('No token provided');
            return res.status(401).send('No token provided');
        }
        req.headers.authorization += ` Bearer ${authorizationToken}`; 
        next();
    });

    app.listen(PORT, async () => {
        logger.info(`Kitchen App running on port ${PORT}`);
        console.log(`Kitchen App running on port ${PORT}`);
    });
})();


