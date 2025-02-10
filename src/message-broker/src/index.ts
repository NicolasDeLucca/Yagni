import logger from "../../logging/src/logger";
import fs from 'fs';
import { rmqConfig } from "./config";

const amqp = require('amqplib');
const ca_url = '../security/ca-cert.pem';

export default class RabbitMQConnection {
  private connection: any;
  private channel: any;
  private config: rmqConfig = {
    hostname: 'localhost',
    username: 'guest',
    password: 'guest',
    vhost: '/'
  }; 
  constructor(tlsOptions:any = null) {
    if (tlsOptions) {
      this.config.port = 5671;
      this.config.protocol = 'amqps';
      this.config.ca = [fs.readFileSync(ca_url)],
      this.config.cert = tlsOptions.cert;
      this.config.key = tlsOptions.key;
      this.config.rejectUnauthorized = true;    
    }else{
      this.config.port = 5672;
      this.config.protocol = 'amqp';
      this.config.rejectUnauthorized = false; 
    }
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.config);
      logger.info('Sucessful connection to RabbitMQ');
      console.log('Sucessful connection to RabbitMQ');
    }
    catch (err) {
      logger.error('Error connecting to RabbitMQ: ', err);
      console.error('Error connecting to RabbitMQ: ', err);
      throw err;
    }
  }

  async createChannel() {
    if (!this.connection) {
      throw new Error('There is no active connection. Call connect() first.');
    }
    try {
      this.channel = await this.connection.createChannel();
      logger.info('Channel created successfully');
      console.log('Channel created successfully');
      return this.channel;
    }
    catch (err) {
      logger.error('Error creating the channel: ', err);
      console.error('Error creating the channel: ', err);
      throw err;
    }
  }

  async publish(queue: any, message: string) {
    if (!this.channel) {
      logger.error('The channel is not available. Call createChannel() first.');
      throw new Error('The channel is not available. Call createChannel() first.');
    }
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      logger.info(`Message sent to queue "${queue}": ${message}`);
      console.log(`Message sent to queue "${queue}": ${message}`);
    } 
    catch (err) {
      logger.error('Error publishing message: ', err);
      console.error('Error publishing message: ', err);
      throw err;
    }
  }

  async consume(queue: any, onMessage: any) {
    if (!this.channel) {
      logger.error('The channel is not available. Call createChannel() first.');
      throw new Error('The channel is not available. Call createChannel() first.');
    }
    try {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.consume(queue, (msg: any) => {
        if (msg !== null) {
          onMessage(msg.content.toString());
          this.channel.ack(msg);
        }
      });
      logger.info(`Consuming messages from queue "${queue}"`);
      console.log(`Consuming messages from queue "${queue}"`);
    } 
    catch (err) {
      logger.error('Error consuming messages: ', err);
      console.error('Error consuming messages: ', err);
      throw err;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        logger.info('Closed channel');
        console.log('Closed channel');
      }
      if (this.connection) {
        await this.connection.close();
        logger.info('Closed connection');
        console.log('Closed connection');
      }
    } catch (err) {
      logger.error('Error closing connection: ', err);
      console.error('Error closing connection: ', err);
      throw err;
    }
  }

}