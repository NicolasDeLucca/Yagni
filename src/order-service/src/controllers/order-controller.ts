import { Request, Response } from 'express';

import { order } from '../dtos/order';
import logger from '../../../logging/src/logger';
import { orderService } from '../services/order-service';

export const orderController = {

    createOrder: async (req: Request, res: Response) => {
        const orderData = req.body as order;
        if (!orderData) {
            logger.error("Order Service - Order data is required to create an order");
            return res.status(400).json({ error: "Order data is required to create an order" });
        }
        const order = await orderService.processOrder(orderData);
        if (order != null){
            logger.info("Order Service - Order created successfully");
            return res.status(201).json({ message: "Order created successfully", order: order });
        }
        else {
            logger.error("Order Service - Error creating the order");
            return res.status(404).json({ message: "Error creating the order", order: order  });
        }
    },

    completeOrder: async (req: Request, res: Response) => {
        const orderId = req.params.id;
        if (!orderId) {
            logger.error("Order Service - Order id is required to update the order status");
            return res.status(400).json({ error: "Order id is required to update the order status" });
        }
        const response = await orderService.updateStatusToComplete(orderId);
        if (response!=null){
            return res.status(200).json({ message: "Order completed successfully!. Can't open refrigerator again"});
        }
        else {
            return res.status(404).json({ message: "Error completing the order."});
        }
    },

    uncompleteOrder: async (req: Request, res: Response) => {
        const orderId = req.params.id;
        if (!orderId) {
            logger.error("Order Service - Order id is required to update the order status");
            return res.status(400).json({ error: "Order id is required to update the order status" });
        }
        const response = await orderService.updateStatusToIncomplete(orderId);
        if (response!=null){
            return res.status(200).json({ message: `The order ${orderId} was successfully updated to incomplete.` });
        }
        else {
            return res.status(404).json({ message: `Error ${orderId} updating order to incomplete. Customer service should help you shortly.`});
        }
    },

    finishOrder: async (req: Request, res: Response) => {
        const orderId = req.params.id;
        if (!orderId) {
            logger.error("Order Service - Order id is required to update the order status");
            return res.status(400).json({ error: "Order id is required to update the order status" });
        }
        const response = await orderService.updateStatusToInRefrigerator(orderId);
        if (response!=null){
            return res.status(200).json({ message: `The order ${orderId} was successfully updated to in-refrigerator.` });
        }
        else {
            return res.status(404).json({ message: `Error updating order ${orderId}.`});
        }
    },

    getAllProducts: async (req: Request, res: Response) => {
        const products = await orderService.getAllProducts();
        if (products != null){
            return res.status(200).json({ message: "Products retrieved successfully", products: products });
        }
        else {
            return res.status(404).json({ message: "Error retrieving products" });
        }
    },

    getAllOrders: async (req: Request, res: Response) => {
        const orders = await orderService.getAllOrders();
        if (orders != null){
            return res.status(200).json({ message: "Orders retrieved successfully", orders: orders });
        }
        else {
            return res.status(404).json({ message: "Error retrieving orders" });
        }
    },

    getProductByID: async (req: Request, res: Response) => {
        const productId = req.params.id;
        if (!productId) {
            logger.error("Order Service - Product id is required to retrieve a product");
            return res.status(400).json({ error: "Product id is required to retrieve a product" });
        }
        const product = await orderService.getProductById(productId);
        if (product != null){
            return res.status(200).json({ message: "Product retrieved successfully", product: product });
        }
        else {
            return res.status(404).json({ message: "Error retrieving product" });
        }
    },

    getOrdersByClient: async (req: Request, res: Response) => {
        const clientId = req.params.id;
        if (!clientId) {
            logger.error("Order Service - Client id is required to retrieve his orders");
            return res.status(400).json({ error: "Client id is required to retrieve his orders" });
        }
        const orders = await orderService.getOrdersByClientID(clientId);
        if (orders.length > 0){
            return res.status(200).json({ message: "Client orders retrieved successfully", orders: orders });
        }else {
            return res.status(404).json({ message: "Error retrieving client orders" });
        }
    }

};
