import express from "express";
import dotenv from "dotenv";
import logger from "../../logging/src/logger";

import productRoutes from './controllers/orderController';
import logisticsRoutes from './controllers/logisticsController';
import refrigeratorRoutes from './controllers/refrigeratorController';

const app = express();

dotenv.config();
const PORT = process.env.API_PORT;

app.use(express.json());

app.use('/logistics', logisticsRoutes);
app.use(productRoutes);
app.use('/refrigerators', refrigeratorRoutes);

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
    logger.info(`API running on port ${PORT}`);
});