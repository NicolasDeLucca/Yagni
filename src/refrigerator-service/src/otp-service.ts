import RabbitMQConnection from '../../message-broker/src/index';
import logger from '../../logging/src/logger';
import { updateInventoryItemDto, refrigeratorAction } from './dtos';
import { openDoor, inventoryAction } from './services';

export default async function consumeOtpKey(key: any, cert: any){
  const rabbit = new RabbitMQConnection({ key, cert });
  try {
    await rabbit.connect();
    await rabbit.createChannel();
    await rabbit.consume('OTP', (message: any) => {
      if (message) {
      const data = JSON.parse(message.content.toString());
      const { product_quantity, product_id, service, otp } = data;
      console.log(`Received OTP for service ${service}`);
      logger.info(`Received OTP for service ${service}`);
      processOTP(product_quantity, product_id, service, otp);
      } else {
        console.log('No messages in the OTP queue');
        logger.info('No messages in the OTP queue');
      }
    });
  }
  catch (error) {
    console.log('Error consuming OTP: ', error);
    logger.error('Error consuming OTP: ', error);
  } 
  finally {}
}

let incoming_fridgeKey: string;
let incoming_fridgeId: number;
let fridgeKey: string;
let fridgeId: number;
  
async function processOTP(product_quantity: string, product_id: string, service: string, otp: string): Promise<void> {
    try {
      const data = await getRefrigeratorData(otp);
      if (service == 'userDriver-refrigerator_key'){
        fridgeKey = data.fridgeKey;
        fridgeId = data.fridgeId;
      }
      else
      if (service == 'userClient-refrigerator_key'){
        fridgeKey = data.fridgeKey;
        fridgeId = data.fridgeId;
      }
      else 
      if (service == 'refrigerator_app-refrigerator_key'){
         incoming_fridgeKey = data.fridgeKey;
         incoming_fridgeId = data.fridgeId;
        if (incoming_fridgeKey == fridgeKey && incoming_fridgeId == fridgeId){
           logger.info('refrigerator OTP is correct');
           console.log('refrigerator OTP is correct');
           const doorResponse = await openDoor(fridgeId);
           if (doorResponse.body.error){
             throw new Error(doorResponse.body.error);
           }
           const inventoryItem: updateInventoryItemDto = {
              productId: Number(product_id),
              quantity: Number(product_quantity),
              action: "remove" as refrigeratorAction
           };
           const inventoryResponse = await inventoryAction(fridgeId, inventoryItem);
           if (inventoryResponse.body.error){
              throw new Error(inventoryResponse.body.error);
           }
        } else {
           logger.error('refrigerator OTP is incorrect');
           console.log('refrigerator OTP is incorrect');
        }
      }
    } catch (error) {
      logger.error(`${service}: `, error);
      console.log(`${service}: `, error);
    }
}

async function getRefrigeratorData(data: string){
  const dataArr = data.split('/');
  return { 
    fridgeKey: dataArr[0], 
    fridgeId: Number(dataArr[1]) 
  };
}