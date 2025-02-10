import express from 'express';
import https from 'https';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import RabbitMQConnection from '../../message-broker/src/index';
import logger from '../../logging/src/logger';

dotenv.config();

const KEY_NAME = process.env.KEY_NAME;
const CERT_NAME = process.env.CERT_NAME;
const CA_NAME = process.env.CA_NAME;

const OTP_SERVER_PORT = process.env.OTP_SERVER_PORT;
const REFRIGERATOR_APP_URL = process.env.REFRIGERATOR_APP_URL;

const app = express();
app.use(express.json());

const ca = [fs.readFileSync(`../security/${CA_NAME}.pem`)];
const key = fs.readFileSync(`${KEY_NAME}.pem`);
const cert = fs.readFileSync(`${CERT_NAME}.pem`);

app.post('/send-otp', async (req, res) => {
  const { product_quantity, product_id, service, refrigerator_id } = req.body;
  if (!service) {
    return res.status(400).json({ message: 'OTP Server - needs a service to send one time passwords.' });
  }
  const otp_key = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = `${otp_key}/${refrigerator_id}`;
  let fridge_console_response = null;
  (async () => {
    const rabbit = new RabbitMQConnection({key, cert});
    try {
      await rabbit.connect();
      await rabbit.createChannel();
      const otpMessage = JSON.stringify(
        { product_quantity: product_quantity, product_id: product_id, service: service, otp: otp }
      );
      await rabbit.publish('OTP', otpMessage);
      console.log('OTP KEY: ', otp_key);
      fridge_console_response = await axios.post(
        `${REFRIGERATOR_APP_URL}/user-console/${refrigerator_id}`
      );
      res.status(200).json({ message: 'OTP sent successfully!'});
      logger.info(`OTP sent successfully for service: ${service}. OTP: ${otp_key}`);
    } 
    catch (err) {
      console.error(`Error: ${err}`);
      if (fridge_console_response || fridge_console_response == 200){
          res.status(500).json({ message: 'OTP Server - could not send the one time password.' });
          logger.error(`OTP Server - could not send the OTP for service: ${service}`);
      }
    }
    finally {
      await rabbit.close();
    }
  })();
});

https.createServer({ca, key, cert}, app).listen(OTP_SERVER_PORT, () => {
  console.log(`OTP server running on port ${OTP_SERVER_PORT}`);
  logger.info(`OTP server running on port ${OTP_SERVER_PORT}`);
});
