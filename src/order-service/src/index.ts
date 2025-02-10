import express from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';

import logger from "../../logging/src/logger";
import { syncDatabase } from "./main-db";
import { orderController } from "./controllers/order-controller";
import { ConnectToReports } from "./reports-db/mongoose";

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post('/orders', orderController.createOrder);

app.put('/orders/complete/:id', orderController.completeOrder);
app.put('/orders/uncomplete/:id', orderController.uncompleteOrder);
app.put('/orders/finish/:id', orderController.finishOrder);

app.get('/orders/clients/:id', orderController.getOrdersByClient);
app.get('/orders', orderController.getAllOrders);
app.get('/products', orderController.getAllProducts);
app.get('/products/:id', orderController.getProductByID);

const PORT = process.env.ORDER_PORT;
(async () => {
    try {
        await ConnectToReports();
        await syncDatabase();
        app.listen(PORT, () => {
            logger.info(`Order Service is running on port: ${PORT}`);
            console.log(`Order Service is running on port: ${PORT}`);
        });
    } 
    catch (error) {
        logger.error('Failed to run Order Service:', error);
        console.error('Failed to run Order Service:', error);
    }
})();