import { Op } from "sequelize";
import axios from "axios";
import dotenv from 'dotenv';

import RabbitMQConnection from "../../message-broker/src";
import logger from "../../logging/src/logger";
import { driverData } from "./dtos"
const { Batch, ProductBox, OrderCode } = require('./models');

dotenv.config();

class OSService {
    private rabbit: RabbitMQConnection;
    private isConnected: boolean = false;
    public batch_in_transit: number[] = [];

    constructor(private rabbitConfig: { key: any; cert: any }) {
        this.rabbit = new RabbitMQConnection(this.rabbitConfig);
    }

    async init() {
        if (!this.isConnected) {
            try {
                await this.rabbit.connect();
                await this.rabbit.createChannel();
                this.isConnected = true;
                console.log('RabbitMQ connection initialized');
            } catch (error) {
                console.error('Error initializing RabbitMQ connection:', error);
                logger.error('Error initializing RabbitMQ connection:', error);
                throw error;
            }
        }
    }

    async publishOrderStatus(service: string, orderId?: number, batchId?: number, kitchenId?: number, 
        premiseId?: number, driver_selector_data?: driverData[]) {
        try {
            const osMessage = JSON.stringify({ service, orderId, batchId, kitchenId, premiseId, 
                driver_selector_data });
            await this.rabbit.publish('OS', osMessage);
            console.log('Order Status message sent:', osMessage);
            logger.info('Order Status message sent:', osMessage);
        } catch (error) {
            console.error('Error publishing order status:', error);
            logger.error('Error publishing order status:', error);
        }
    }

    async consumeOrderStatus() {
        try {
            await this.rabbit.consume('OS', async (message: any) => {
                if (message) {
                    const data = JSON.parse(message.content.toString());
                    const { service } = data;
                    await this.processOS(data);
                    console.log(`Received Order Status for service ${service}`);
                    logger.info(`Received Order Status for service ${service}`);
                } 
                else {
                    console.log('No messages in the OS queue');
                    logger.info('No messages in the OS queue');
                }
            });
        } catch (error) {
            console.error('Error consuming Order Status:', error);
            logger.error('Error consuming Order Status:', error);
        }
    }

    private async processOS(data: any) {
        const { service } = data;
        if (service == 'orderId-order'){
            const { orderId } = data;
            const selector_data: driverData[] = [];
            const productBoxes = await ProductBox.findAll({
                where: { orderID : orderId },
                attributes: ['quantity', 'orderCodeID']
            });
            const productBoxesItems = productBoxes.map((pb:any) => pb.dataValues);
            const orderCodes = await OrderCode.findAll({
                where: { id: { [Op.in]: productBoxesItems.orderCodeID } },
                attributes: ['destinationRefrigeratorID', 'productID'],
                group: ['destinationRefrigeratorID']
            });
            orderCodes.forEach((oc: any) => {
                const quantity = productBoxesItems.find((pb_item: any) => pb_item.
                    orderCodeID == oc.dataValues.id)?.quantity || 0;
                selector_data.push({
                    quantity: quantity,
                    productId: oc.dataValues.productID,
                    refrigeratorId: oc.dataValues.destinationRefrigeratorID
                });
            });
            await this.publishOrderStatus('productBoxes-order', orderId, undefined, undefined, undefined,
                 selector_data); 
        }
        else 
        if (service == 'premise-batch_status'){
            const { batchId } = data;
            this.batch_in_transit.splice(this.batch_in_transit.indexOf(batchId), 1);
            const batch = await Batch.findByPk(batchId);
            batch.dataValues.in_premise = true;
            await batch.save();
        }else
        if (service == 'refrigerator-order_status'){
            const { orderId } = data;
            try{
                await axios.put(`http://localhost:${process.env.ORDER_PORT}/orders/finish/${orderId}`);
            }
            catch(error){
                console.error('Error updating status order to in-refrigerator.');
                logger.error('Error updating status order to in-refrigerator: ', error);
            }
        }else
        if (service == 'travel-batch_status'){
            const { batchId } = data;
            this.batch_in_transit.push(batchId);
        }
    }
}

export default OSService;
