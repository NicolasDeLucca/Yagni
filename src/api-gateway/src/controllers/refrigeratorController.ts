import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

import logger from "../../../logging/src/logger";
import gateway from '../services/gateway';
import { validateAuth } from '../services/auth-service';

dotenv.config();

const REFRIGERATOR_URL = process.env.REFRIGERATOR_URL;
const router = Router();

// R14, R17

router.post('/inventory/:id', async (req: Request, res: Response) => {
    const token = req.headers['authorization'];
    if (token == null || token.length <= 7) {
        logger.error('Unauthorized: Refrigerator App sent to Api Gateway an empty token.');
        return res.status(401).send('Unauthorized: empty token.');
    }
    if (!await validateAuth(token)){
        logger.error('Unauthorized: Refrigerator App sent to Api Gateway an invalid token or expired.');
        return res.status(401).send('Unauthorized: invalid token or expired.');
    }
    return await gateway(req, res, `${REFRIGERATOR_URL}/inventory/${req.params.id}`);
});

router.post('/door/:id', async (req: Request, res: Response) => {
    const token = req.headers['authorization'];
    if (token == null || token.length <= 7) {
        logger.error('Unauthorized: Refrigerator App sent to Api Gateway an empty token.');
        return res.status(401).send('Unauthorized: empty token.');
    }
    if (!await validateAuth(token)){
        logger.error('Unauthorized: Refrigerator App sent to Api Gateway an invalid token or expired.');
        return res.status(401).send('Unauthorized: invalid token or expired.');
    }
    return await gateway(req, res, `${REFRIGERATOR_URL}/door/${req.params.id}`);
});

router.get('/premises/:premiseID', async (req: Request, res: Response) => {
    const premiseId = req.params.premiseID;
    return await gateway(req, res, `${REFRIGERATOR_URL}/premises/${premiseId}`);
});

// R7

router.get('/products/:id', async (req: Request, res: Response) => {
    const productId = req.params.id;
    return await gateway(req, res, `${REFRIGERATOR_URL}/products/${productId}`);
});


export default router;