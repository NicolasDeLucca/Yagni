import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';  

import { validateAuthentication } from './auth';
import logger from '../../logging/src/logger';
import { sendOtpKey, getUserKey } from './otp-service';
import { request_redirection } from './utils';
import gateway from './gateway';

dotenv.config();

const router = Router();

const YAGNI_URL = process.env.YANGI_REFRIGERATORS_URL;

router.post('/inventory', async (req: Request, res: Response) => {
    const tokens = req.headers.authorization?.split('Bearer ');
    if (tokens) {
        const authenticationToken = tokens[1];
        const authenticate = validateAuthentication(authenticationToken);
        if (!authenticate) {
            logger.error('Invalid authenticaiton token');
            return res.status(401).send('Invalid authentication token');
        }
        const { action, fridgeId, productId, quantity } = req.body;
        const redirection = await request_redirection(req, 
            { action, productId, quantity }
        );
        const authorizationToken = tokens[2];
        return await gateway(redirection, res, `${YAGNI_URL}/inventory/${fridgeId}`, authorizationToken); 
    };
});

router.post('/door', async (req: Request, res: Response) => {
    const tokens = req.headers.authorization?.split('Bearer ');
    if (tokens) {
        const authenticationToken = tokens[1];
        const authenticate = validateAuthentication(authenticationToken);
        if (!authenticate) {
            logger.error('Invalid authenticaiton token');
            return res.status(401).send('Invalid authentication token');
        }
        const { fridgeId } = req.body;
        const authorizationToken = tokens[2];
        return await gateway(req, res, `${YAGNI_URL}/door/${fridgeId}`, authorizationToken);
    }
});

router.post('/user-console/:id', async (req: Request, res: Response) => {
    const tokens = req.headers.authorization?.split('Bearer ');
    if (tokens) {
        const authenticationToken = tokens[1];
        const authenticate = validateAuthentication(authenticationToken);
        if (!authenticate) {
            logger.error('Invalid authenticaiton token');
            return res.status(401).send('Invalid authentication token');
        }
        const refrigeratorId = req.params.id;
        const key = getUserKey();
        const otp = `${key}/${refrigeratorId}`;
        const response = await sendOtpKey('refrigerator_app-refrigerator_key', otp);
        return res.status(response.statusCode).json(response.body);
    }
});

export default router;