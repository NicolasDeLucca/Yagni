import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';  

import logger from '../../logging/src/logger';
import { validateAuthentication } from './auth';
import gateway from './gateway';
import { batchReady } from './services';

dotenv.config();

const router = Router();

const YAGNI_URL = process.env.YANGI_KITCHENS_URL;

router.get('/products', async (req: Request, res: Response) => {
    const tokens = req.headers.authorization?.split('Bearer ');
    if (tokens) {
        const authenticationToken = tokens[1];
        const authenticate = validateAuthentication(authenticationToken);
        if (!authenticate) {
            logger.error('Invalid authentication token');
            return res.status(401).send('Invalid authentication token');
        }
        const { kitchenId } = req.body;
        const authorizationToken = tokens[2];
        const response = await gateway(req, res, `${YAGNI_URL}/kitchens/${kitchenId}/products`, authorizationToken); 
        console.log(response);
        return response;
    }
});

router.put('/batch', async (req: Request, res: Response) => {
    const tokens = req.headers.authorization?.split('Bearer ');
    if (tokens) {
        const authenticationToken = tokens[1];
        const authenticate = validateAuthentication(authenticationToken);
        if (!authenticate) {
            logger.error('Invalid authentication token');
            return res.status(401).send('Invalid authentication token');
        }
        const { kitchenId, batchId, orderId, premiseId } = req.body;
        const authorizationToken = tokens[2];
        const response = await gateway(req, res, `${YAGNI_URL}/kitchens/${kitchenId}/batch/${batchId}/order/${orderId}/premise/${premiseId}`, authorizationToken); 
        if (res.statusCode === 200) {
            batchReady(kitchenId);
        }
        return response;
    }
});

export default router;