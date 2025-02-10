import * as readline from 'readline';

import RabbitMQConnection from '../../message-broker/src/index';
import logger from '../../logging/src/logger';
import { response } from './utils';
import { cert, key } from './app';

async function sendOtpKey(service: string, otp: string) {
  let result: response;
  const rabbit = new RabbitMQConnection({ key, cert });
  try {
      await rabbit.connect();
      await rabbit.createChannel();
      const product_quantity = null;
      const product_id = null;
      const otpMessage = JSON.stringify(
        { product_quantity: product_quantity, product_id: product_id, service: service, otp: otp });
      await rabbit.publish('OTP', otpMessage);
      logger.info(`OTP sent successfully for service: ${service}`);
      return result = { statusCode: 200, body: { data: `OTP sent successfully for service: ${service}` }};
  } 
  catch (err) {
      logger.error(`Could not send the OTP for service: ${service}`);
      return result = { statusCode: 500, body: { error: `Could not send the OTP: ${err}.` }};
  }
  finally {
      await rabbit.close();
  }  
}

async function getUserKey(){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  let key = '';
  rl.question('Please enter the refrigerator password: ', (enteredOtp) => {
      key = `${enteredOtp}`;
      rl.close();
  });    
  return key;
}
  
export { sendOtpKey, getUserKey };