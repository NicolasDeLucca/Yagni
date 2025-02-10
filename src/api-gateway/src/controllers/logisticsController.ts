import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

import gateway from '../services/gateway';
import logger from '../../../logging/src/logger';
import { validateAuth } from '../services/auth-service';

dotenv.config();

const LOGISTICS_URL = process.env.LOGISTICS_URL;

const router = Router();

// R11

router.get('/kitchens/:kitchenID/products', async (req: Request, res: Response) => {
    const { kitchenID } = req.params;
    const token = req.headers['authorization'];
    if (token == null || token.length <= 7) {
        logger.error('Unauthorized: Kitchen App sent to Api Gateway an empty token.');
        return res.status(401).send('Unauthorized: empty token.');
    }
    if (!await validateAuth(token)){
        logger.error('Unauthorized: Kitchen App sent to Api Gateway an invalid token or expired.');
        return res.status(401).send('Unauthorized: invalid token or expired.');
    }
    return await gateway(req, res, `${LOGISTICS_URL}/kitchens/${kitchenID}/products`);
});

// R12

router.put('/kitchens/:kitchenID/batch/:batchID/order/:orderID/premise/:premiseID', async (req: Request, res: Response) => {
    const { kitchenID, batchID, orderID, premiseID } = req.params;
    const token = req.headers['authorization'];
    if (token == null || token.length <= 7) {
        logger.error('Unauthorized: Kitchen App sent to Api Gateway an empty token.');
        return res.status(401).send('Unauthorized: empty token.');
    }
    if (!await validateAuth(token)) { 
        logger.error('Unauthorized: Kitchen App sent to Api Gateway an invalid token or expired.');
        return res.status(401).send('Unauthorized: invalid token or expired.');
    }
    return await gateway(req, res, `${LOGISTICS_URL}/kitchens/${kitchenID}/batch/${batchID}/order/${orderID}/premise/${premiseID}`);
});

// R9

router.get('/products/:id/state', async (req: Request, res: Response) => {
    const productId = req.params.id;
    return await gateway(req, res, `${LOGISTICS_URL}/products/${productId}/state`);
});

export default router;


