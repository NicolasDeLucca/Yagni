import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import logger from '../../logging/src/logger';

dotenv.config();

const app = express();
const PORT = process.env.PAYMENT_MIDDLEWARE_PORT;

app.use(express.json());

app.post('/payment', (_: Request, res: Response) => {
  const isRejected = Math.random() < 0.5; 
  const delay = Math.random() * 4000; 
  setTimeout(() => {
    if (isRejected) {
      res.status(402).json({ error: 'Payment Service - Rejected' });
      logger.error('Payment Service - Rejected');
    } else {
      res.status(200).json({ message: 'Payment Service - Accepted' });
      logger.info('Payment Service - Accepted');
    }
  }, delay);
});

app.listen(PORT, async () => {
  console.log(`Payment Middleware running on port ${PORT}`);
  logger.info(`Payment Middleware running on port ${PORT}`);
});