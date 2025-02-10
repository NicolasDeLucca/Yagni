import { Router, Request, Response } from 'express';
import gateway from '../services/gateway';

const ORDER_BASE_URL = process.env.ORDER_URL; 
const PRODUCT_URL = `${ORDER_BASE_URL}/products`;

const router = Router();

router.get('/products', async (req: Request, res: Response) => {
    await gateway(req, res, PRODUCT_URL);
});

// R8, R10

router.get('/orders/clients/:id', async (req: Request, res: Response) => {
    await gateway(req, res, `${ORDER_BASE_URL}/orders/clients/:id`);
});

// R16

router.post('/orders', async (req: Request, res: Response) => {
    await gateway(req, res, `${ORDER_BASE_URL}/orders`);
});

// R17

router.put('/orders/complete/:id', async (req: Request, res: Response) => {
    await gateway(req, res, `${ORDER_BASE_URL}/orders/complete/:id`);
});

router.put('/orders/uncomplete/:id', async (req: Request, res: Response) => {
    await gateway(req, res, `${ORDER_BASE_URL}/orders/uncomplete/:id`);
});


export default router;


