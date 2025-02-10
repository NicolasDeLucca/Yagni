import axios from 'axios';
import dotenv from 'dotenv';

import { order as IOrder } from '../dtos/order';
import { orderMessage } from '../dtos/orderMessage';
import { Order, OrderProducts } from '../main-db/models/order';
import order from '../reports-db/models/order'
import product from '../reports-db/models/product';
import { Product } from '../main-db/models/product';
import { Client } from '../main-db/models/client';
import logger from '../../../logging/src/logger';
import emitter from '../cqrs-sync/event-emitter';
import Breaker from './circuit-breaker';

dotenv.config();

interface PostData {
  price: number;
  userId: number;
  paymentMethod: string;
}

const makePayment = async function makePaymentRequest(data: PostData): Promise<number | null> {
  const apiUrl = process.env.PAYMENT_URL as string;
  try {
    const response = await axios.post(apiUrl, data, { timeout: 3000 });
    logger.info('Order Service - Payment Service Response: ', response.data);
    console.log('Order Service - Payment Service Response: ', response.data);
    return response.status;
  } 
  catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Order Service - Error in payment request:', error.response?.data || error.message);
      console.error('Order Service - Error in payment request:', error.response?.data || error.message);
    } else {
      logger.error('Order Service - Unexpected error:', error);
      console.error('Order Service - Unexpected error:', error);
    }
    return null;
  }
};


const paymentBreaker = new Breaker(makePayment);


export const orderService = {

    processOrder: async (data: IOrder) => {
      const d: PostData = {
        price: data.totalPrice,
        userId: data.userId,
        paymentMethod: data.paymentMethod
      };
      logger.info('Order Service - Processing Order..');
      console.log('Order Service - Processing Order..');
      return await paymentBreaker.fire(d).
       then(async (status) => {
         if (status && status == 200) {
            try {          
              var now = new Date();
              const existingClient = await Client.findByPk(data.userId);
              if (!existingClient) {
                logger.error(`Order Service - Client does not exist`);
                throw new Error(`Order Service - Client does not exist`);
              }
              if (!existingClient.dataValues.paymentMethods.includes(data.paymentMethod)){
                logger.error(`Order Service - Payment method not allowed`);
                throw new Error(`Order Service - Payment method not allowed`);
              }
              const newOrder = await Order.create(
                { 
                  idClient: existingClient.dataValues.id,
                  paymentMethod: data.paymentMethod,
                  pickUpDate: data.pickUpDate,
                  pickUp: data.pickUp,
                  date: now
                }
              );
              let totalPrice = 0;
              for (const product of data.products) {
                  const existingProduct = await Product.findByPk(product.productId);
                  if (!existingProduct) {
                    logger.error(`Order Service - Product with id ${product.productId} not found`);
                    throw new Error(`Order Service - Product with id ${product.productId} not found`);
                  }
                  totalPrice += product.quantity * existingProduct.dataValues.listPrice;
                  await OrderProducts.create(
                    { 
                      cant: product.quantity,
                      ProductId: product.productId,
                      OrderId: newOrder.dataValues.id,
                    }
                  );
              };
              newOrder.dataValues.totalPrice = totalPrice;
              await newOrder.save();
              const orderMessage: orderMessage = {
                id: newOrder.dataValues.id,
                clientId: newOrder.dataValues.idClient,
                clientName: existingClient.dataValues.name,
                date: newOrder.dataValues.date,
                totalPrice: totalPrice,
                pickUpDate: newOrder.dataValues.pickUpDate,
                pickUp: newOrder.dataValues.pickUp
              }
              const message = JSON.stringify(orderMessage);
              logger.info('Order Service - Order succesfully created! Message: ', message);
              console.log('Order Service - Order succesfully created! Message: ', message);
              emitter.emit('orderUpdated', newOrder.dataValues.id);
              await axios.post('http://localhost:3001/batch', {
                orderId: newOrder.dataValues.id,
                premiseId: newOrder.dataValues.pickUp
              });
              return newOrder;
            } 
            catch (error) {
              logger.error('Order Service - Failed to create order');
              console.log('Order Service - Failed to create order, Error: ', error);
              return null;
            }
         } 
         else {
          logger.error('Order Service - Failed to get a valid status code');
          console.log('Order Service - Failed to get a valid status code');
          return null;
        }
      });

    },

    updateStatusToComplete: async (orderId: string) => {
      try{
        const realpickUpDate = new Date();
        if (isNaN(Number(orderId))){
            logger.error("Order id must be a number");
            throw new Error("Order id must be a number");
        }
        const order = await Order.findByPk(Number(orderId));
        if (!order) {
          logger.error(`Order with id ${orderId} not found`);
          throw new Error(`Order with id ${orderId} not found`);
        }
        order.dataValues.status = 'completed';
        const arrivalTime = realpickUpDate.getTime() - order.dataValues.pickUpDate.getTime();
        order.dataValues.pickUpDate = realpickUpDate;
        order.dataValues.arrivalTime = arrivalTime;
        await order.save();
        console.log('Order status sucessfully updated to completed!');
        logger.info('Order Service - Order status sucessfully updated to completed!');
        emitter.emit('orderUpdated', order.dataValues.id);
        return 'completed';
      }
      catch(error){
        logger.error('Order Service - Failed to update order status: ', error);
        return null;
      }
    },

    updateStatusToIncomplete: async (orderId: string) => {
      try{
        if (isNaN(Number(orderId))){
            logger.error("Order id must be a number");
            throw new Error("Order id must be a number");
        }
        const order = await Order.findByPk(Number(orderId));
        if (!order) {
          logger.error(`Order with id ${orderId} not found`);
          throw new Error(`Order with id ${orderId} not found`);
        }
        order.dataValues.status = 'incomplete';
        order.dataValues.pickUpDate = null;
        await order.save();
        console.log('Order status sucessfully updated to incomplete!');
        logger.info('Order Service - Order status sucessfully updated to incomplete!');
        emitter.emit('orderUpdated', order.dataValues.id);
        return 'incomplete';
      }
      catch(error){
        logger.error('Order Service - Failed to update order status: ', error);
        return null;
      }
    },

    updateStatusToInRefrigerator: async (orderId: string) => {
      try{
        if (isNaN(Number(orderId))){
            logger.error("Order id must be a number");
            throw new Error("Order id must be a number");
        }
        const order = await Order.findByPk(Number(orderId));
        if (!order) {
          logger.error(`Order with id ${orderId} not found`);
          throw new Error(`Order with id ${orderId} not found`);
        }
        order.dataValues.status = 'in-refrigerator';
        await order.save();
        console.log('Order status sucessfully updated to in-refrigerator!');
        logger.info('Order Service - Order status sucessfully updated to in-refrigerator!');
        console.log(`Order ${orderId} has been delivered to refrigerators!`);
        logger.info(`Order Service - Message to Client: order ${orderId} has been delivered to refrigerators!`);
        emitter.emit('orderUpdated', order.dataValues.id);
        return 'in-refrigerator!';
      }
      catch(error){
        logger.error('Order Service - Failed to update order status: ', error);
        return null;
      }
    },

    getAllProducts: async () => {
      try {
        return await product.find();
      } 
      catch (error) {
        logger.error('Order Service - Failed to get products: ', error);
        return null;
      }
    },

    getAllOrders: async () => {
      try {
        return await order.find();
      } 
      catch (error) {
        logger.error('Order Service - Failed to get orders: ', error);
        return null;
      }
    },

    getProductById: async (productId: string) => {
      try {
        if (isNaN(Number(productId))){
            logger.error("Order Service - Product id must be a number");
            throw new Error("Product id must be a number");
        }
        return await product.findById(Number(productId));
      } 
      catch (error) {
        logger.error('Order Service - Failed to get product: ', error);
        return null;
      }
    },

    getOrdersByClientID: async (clientId: string) => {
      try {
        if (isNaN(Number(clientId))){
            logger.error("Order Service - client id must be a number");
            throw new Error("client id must be a number");
        }
        const orders:orderMessage[] = [];
        const clientOrders = await order.find({client_id: Number(clientId)});
        for (const clientOrder of clientOrders) {
          const orderMessage: orderMessage = {
            id: clientOrder.id,
            clientId: clientOrder.client_id.toString(),
            clientName: clientOrder.client_name,
            date: clientOrder.date,
            pickUpDate: clientOrder.pick_up_date,
            pickUp: clientOrder.pick_up,
            totalPrice: clientOrder.totalPrice,
            status: clientOrder.status? clientOrder.status : 'not-in-refrigerator-yet',
            arrivalTime: (clientOrder.arrival_time? clientOrder.arrival_time : 0).toString()
          }
          orders.push(orderMessage);
        }
        return orders;
      } 
      catch (error) {
        logger.error('Order Service - Failed to get client orders: ', error);
        return [];
      }
    }

};