import emitter from './event-emitter';
import logger from '../../../logging/src/logger';

import order from '../reports-db/models/order';
import product from '../reports-db/models/product';
import { Order } from '../main-db/models/order';
import { Product } from '../main-db/models/product';

emitter.on('orderUpdated', async (orderId) => {
  try {
    const retrievedOrder = await Order.findByPk(orderId, {
      attributes: ['date', 'totalPrice', 'status', 'pickUpDate', 'pickUp', 'arrivalTime'], 
      include: [
        {
          model: Product,
          through: { attributes: ['cant'] }
        },
      ],
    });
    if (!retrievedOrder) {
      logger.error(`CQRS Orders Sync - Order ${orderId} not found in main db.`);
      console.error(`Order ${orderId} not found in main db.`);
      return;
    }
    const updateData = {
      date: retrievedOrder.dataValues.date,
      totalPrice: retrievedOrder.dataValues.totalPrice,
      status: retrievedOrder.dataValues.status,
      pick_up_date: retrievedOrder.dataValues.pickUpDate,
      pick_up: retrievedOrder.dataValues.pickUp,
      arrival_time: retrievedOrder.dataValues.arrivalTime,
      products: retrievedOrder.dataValues.Products.map((p: any) => ({
        product: p.dataValues.id,
        cant: p.dataValues.OrderProducts.dataValues.cant,
      })),
    };
    const existingOrder = await order.findOne({ id_main_db: orderId });
    if (!existingOrder) {
      const newOrder = new order({
        id_main_db: orderId,
        ...updateData
      });
      await newOrder.save();
      logger.info(`CQRS Orders Sync - Order ${orderId} created in reports db.`);
      console.log(`Order ${orderId} created in reports db.`);
    }
    else
    {
      await order.updateOne({ id_main_db : orderId }, updateData);
      logger.info(`CQRS Orders Sync - Order ${orderId} updated to read in reports.`);  
      console.log(`Order ${orderId} updated to read in reports db.`);
    }
  } 
  catch (err) {
    logger.error('Error synchronizing the order to reports db: ', err);
    console.error('Error synchronizing the order to reports db.');
  }
});


emitter.on('productCreated', async (productId) => {
  try {
    const retrievedProduct = await Product.findByPk(productId, {
      attributes: ['name', 'description', 'listPrice', 'ingredients'],
    });
    if (!retrievedProduct) {
      logger.info(`CQRS Orders Sync - Product ${productId} not found in main db.`);
      console.error(`Product ${productId} not found in main db.`);
      return;
    }
    const existingProduct = await product.findOne({ id_main_db: productId });
    if (!existingProduct) {
      const newProduct = new product({
        id_main_db: productId,
        name: retrievedProduct.dataValues.name,
        description: retrievedProduct.dataValues.description,
        listPrice: retrievedProduct.dataValues.listPrice,
        ingredients: retrievedProduct.dataValues.ingredients,
      });
      await newProduct.save();
      logger.info(`CQRS Orders Sync - Product ${productId} created in reports db.`);
      console.log(`Product ${productId} created in reports db.`);
    }
    else{
      logger.info(`CQRS Orders Sync - Product ${productId} already created in reports db.`);
      console.log(`Product ${productId} already created in reports db.`);
    }
  }
  catch(err){
    logger.error('Error synchronizing the product to reports db: ', err);
    console.error('Error synchronizing the product to reports db.');
  }
});