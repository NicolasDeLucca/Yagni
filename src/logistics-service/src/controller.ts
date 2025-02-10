import { Router, Request, Response } from 'express';

import * as service from './services';
import logger from '../../logging/src/logger';

const router = Router();

router.get('/kitchens/:kitchenID/products', async (req: Request, res: Response) => {
   try{
      const kitchenId = Number(req.params.id);
      const response = await service.getMonitorData(kitchenId);
      logger.info('Logistics Service - Product data to show in kitchen monitors retrieved succesfully');
      return res.status(200).json(response);
   }
   catch(error)
   {
      console.log('Error fetching product data to show in kitchen monitors.');
      logger.error('Logistics Service - Error fetching product data to show in kitchen monitors: ', error);
      return res.status(500).json('Error fetching product data to show in kitchen monitors.');
   }
});

router.put('/kitchens/:kitchenID/batch/:batchID/order/:orderID/premise/:premiseID', async (req: Request, res: Response) => {
   try{
      const kitchenId = Number(req.params.kitchenID);
      const batchId = Number(req.params.batchID);
      const orderId = Number(req.params.orderID);
      const premiseId = Number(req.params.premiseID);

      const okResponse = await service.updateBatch(kitchenId, batchId, orderId, premiseId);
      if (okResponse){
         logger.info(`Logistics Service - Batch ${batchId} ready status succesfully updated`);
         return res.status(200).json(`Batch ${batchId} ready status succesfully updated`);
      }
      else{
         console.log('Product box of the batch isnt ready yet.');
         logger.error('Logistics Service - Product box of the batch isnt ready yet');
      }
   }
   catch(error)
   {
      console.log('Error notifying batch ready status.');
      logger.error('Logistics Service - Error notifying batch ready status: ', error);
      return res.status(500).json('Error notifying batch ready status');
   }
});

router.get('/products/:id/state', async (req: Request, res: Response) => {
   try {
      const productId = Number(req.params.id);
      const quantities_x_state = service.getProductQuantityPerState(productId);
      if (quantities_x_state){
         logger.info(`Logistics Service - Product ${productId} quantity per state retrieved succesfully`);
         return res.status(200).json({ message: `Product ${productId} quantity per state retrieved succesfully`, data: quantities_x_state });
      }else{
         console.log('Product not found.');
         logger.error('Logistics Service - Product not found');
         return res.status(404).json('Product not found');
      }
   }
   catch(error){
      console.log('Error fetching product quantity per state.');
      logger.error('Logistics Service - Error fetching product quantity per state: ', error);
      return res.status(500).json('Error fetching product quantity per state.');
   }
});

router.put('/batch', async (req: Request, res: Response) => {
   try{
      const {
         orderId,
         premiseId
      } = req.body;
      const okResponse = await service.createBatch(orderId, premiseId);
      if (!okResponse){
         console.log(`Logistics couldnt work with the order ${orderId}.`);
         logger.error(`Logistics Service - Logistics couldnt work with the order ${orderId}.`);
         return false;
      }
      return true;
   }
   catch(error)
   {
      console.log(`Error working with new order.`);
      logger.error('Logistics Service - Error working with new order: ', error);
      return false;
   }
});

export default router;