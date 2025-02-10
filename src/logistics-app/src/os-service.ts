import axios from 'axios';
import dotenv from 'dotenv';

import RabbitMQConnection from "../../message-broker/src";
import { addRefrigeratorToOrder } from "../../redis/src/services";
import logger from "../../logging/src/logger";
import { rl } from "./services";
import { driverDataSelector } from "./services";

dotenv.config();

const OTP_SERVER_URL = process.env.OTP_SERVER_URL as string;

class OSService {
    private rabbit: RabbitMQConnection;
    private isConnected: boolean = false;

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
            } 
            catch (error) {
                console.error('Error initializing RabbitMQ connection:', error);
                logger.error('Error initializing RabbitMQ connection:', error);
                throw error;
            }
        }
    }

    async publishOrderStatus(service: string, orderId?: number, batchId?: number) {
        try {
            const osMessage = JSON.stringify({ orderId, service, batchId });
            await this.rabbit.publish('OS', osMessage);
            console.log(`Order Status for service ${service} - message sent: `, osMessage);
            logger.info(`Order Status for service ${service} - message sent: `, osMessage);
        } 
        catch (error) {
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
                } else {
                    console.log('No messages in the OS queue');
                    logger.info('No messages in the OS queue');
                }
            });
        } 
        catch (error) {
            console.error('Error consuming Order Status:', error);
            logger.error('Error consuming Order Status:', error);
        }
    }

    private async processOS(data: any) {
      const { service, orderId } = data;
      try {  
            if (service == 'kitchen-batch_status'){
                const { batchId, kitchenId, premiseId } = data;
                logger.info(`Logistics App - batch ${batchId} is ready to be picked up 
                    from the kitchen ${kitchenId}!`);
                console.log(`batch ${batchId} is ready to be picked up from the kitchen
                     ${kitchenId}!`);
                rl.question(`Write anything when you arrived at the kitchen to pick up 
                        the boxes from the batch.`, async () => {
                    await this.publishOrderStatus('travel-batch_status', undefined, batchId);        
                    rl.question(`Write anything when you arrived at the premise ${premiseId}.`, 
                      async () => {
                        await this.publishOrderStatus('premise-batch_status', undefined, batchId);
                        await this.publishOrderStatus('orderId-order', orderId);
                      }
                    );
                 }
                );
            } 
            else if (service == 'productBoxes-order'){
                const { driver_selector_data } = data;
                while (driver_selector_data.length > 0) {
                    const dSelected = await driverDataSelector(driver_selector_data);
                    const fridgeIdSelected = dSelected.refrigeratorId;
                    await addRefrigeratorToOrder(orderId, fridgeIdSelected);
                    const index = driver_selector_data.indexOf(dSelected);
                    driver_selector_data.splice(index, 1);
                    const response = await axios.post(OTP_SERVER_URL, { "product_quantity": dSelected.quantity,
                        "product_id": dSelected.productId, "service": "userDriver-refrigerator_key", 
                            "refrigerator_id": fridgeIdSelected});
                    if (response.status == 500)
                        console.log('Error: ', response.data.message);
                };
                await this.publishOrderStatus('refrigerator-order_status', orderId, undefined);       
            }
        } 
        catch (error) {
            logger.error(`${service}: `, error);
            console.log(`${service}: `, error);
        }
    }
}

export default OSService;

