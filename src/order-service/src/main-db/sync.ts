import logger from '../../../logging/src/logger';
import { Order, OrderProducts } from './models/order';
import { Product } from './models/product';
import { Client } from './models/client';
import clientSeed from "./seeders/client-seed";
import productSeed from "./seeders/product-seed";

export default async () => {
    try {
        await OrderProducts.drop();
        await Product.drop();
        await Order.drop();
        await Client.drop();
        await Client.sync({ force: true });
        await Product.sync({ force: true });
        await Order.sync({ force: true });
        await OrderProducts.sync({ force: true });
        clientSeed();
        productSeed();
        logger.info('Order Database synchronized.');
        console.log('Order Database synchronized.');
    } 
    catch (error) {
        logger.error('Error synchronizing Order Database:', error);
        console.error('Error synchronizing Order Database:', error);
    }
};
