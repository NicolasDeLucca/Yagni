import dotenv from 'dotenv';
import axios from 'axios';

import { responseDto, productQuantityReport } from './dtos';
import { osService } from './index';
import { productQuantityxPremise } from './dtos'
import { Op } from 'sequelize';
const { Batch, ProductBox, OrderCode, Premise } = require('./models');

dotenv.config();

const ORDER_PORT = process.env.ORDER_PORT;

const batchProductQuantityToBeReady = Number(process.env.X as string);
const MAX_CONTAINERS_PER_BATCH = Number(process.env.H as string);

let allOrders:any = null;
(async () => {
    try {
        allOrders = await axios.get(`http://localhost:${ORDER_PORT}/orders`);
    }
    catch (error) {}
})();

const getMonitorData = async (kitchenId: number) => {
    let response: responseDto;
    try{
        const data: productQuantityxPremise[] = [];
        const kitchenPremisesId = await Premise.findAll({ where: { kitchenID: kitchenId } }).map((premise: any) => premise.dataValues.id);
        const premiseOrders = allOrders?.data.filter((or: any) => kitchenPremisesId.includes(or.pick_up) &&
            or.date >= new Date(new Date().getTime() - 5 * 60 * 1000));
        if (!premiseOrders)
            return response = {
                statusCode: 404,
                body: {
                    error: `Couldnt get the recent orders. Something went wrong.`
                }
            };
        for (const order of premiseOrders) {
            const pick_up = order.pick_up;
            const productxQuantity = order.products; 
            for (const pxq of productxQuantity){
                data.push({
                    productId: pxq.product,
                    premiseId: pick_up,
                    quantity: pxq.cant
                });
            }
        }
        return response = {
            statusCode: 200,
            body: {
                data: data
            }
        };
    }
    catch (err:any) {
        return response = {
            statusCode: 500,
            body: {
                error: err
            }
        };
    }
}

const createBatch = async (orderId: number, premiseId: number) => {
    let response: responseDto;
    try {
        const retrievedOrders = allOrders.data.filter((order: any) => order.id === orderId);
        if (retrievedOrders.length === 0)
            return response = {
                statusCode: 404,
                body: {
                    error: `Order ${orderId} not found.`
                }
            };
        const orderCodes = await OrderCode.findAll({ 
            where: { 
                destinationPremiseID: premiseId,
                productionDatetime: {
                    [Op.lt]: new Date(new Date().getTime() - 60 * 60 * 1000)
                }
            }
        });
        if (orderCodes.length === 0){
            const newBatch = await Batch.create({ orderID: orderId });
            //creo los productBoxes y orderCodes correspondientes al pedido
            return true;
        }
        else{
            //adapto para colocar la orden con los pedidos en el batch existente.
        }
    }
    catch (error) {
        console.error(`Failed to process order ${orderId} in logistics:`, error);
        return false;
    }
}


const updateBatch = async (kitchenId: number, batchId: number, orderId: number, premiseId: number) => {
    const batch = await Batch.findByPk(batchId);
    const productBoxes = await ProductBox.findAll({ where: { batchId } });
    const batchQuantity = productBoxes.reduce((sum: number, box: any) => sum + box.dataValues.quantity, 0);

    if (batchQuantity < batchProductQuantityToBeReady)
        return false;

    batch.dataValues.ready = true;
    await batch.save();

    await osService.publishOrderStatus('kitchen-batch_status', orderId, batchId, kitchenId, premiseId);
    return true;
}

const getProductQuantityPerState = async (productId: number) => {

    const product = (await axios.get(`http://localhost:${ORDER_PORT}/products/${productId}`)).data;
    if (!product)
        return null;

    const quantities_x_state:productQuantityReport = {
        "productId": productId,
        "in_transit": 0,
        "in_refrigerator": 0,
        "in_kitchen": 0
    };

    const orders = (await axios.get(`http://localhost:${ORDER_PORT}/orders`)).data;
    const ordersWithProduct = orders.filter((o: any) => o.products.includes((item: any) => item.product == productId.toString()));
    if (ordersWithProduct.length === 0)
        return quantities_x_state;

    let quantityInPreparation = 0;
    const ordersWithProductInPreparation = ordersWithProduct.filter((o:any) => o.status == null);
    ordersWithProductInPreparation.forEach((order: any) => {
        quantityInPreparation += order.products.find((item: any) => item.product == productId.toString()).cant;
    });

    const ordersWithProductInRefrigerator = ordersWithProduct.filter((o:any) => o.status == 'in-refrigerator'); 
    ordersWithProductInRefrigerator.forEach((order: any) => {
        quantities_x_state.in_refrigerator += order.products.find((item: any) => item.product == productId.toString()).cant;
    });

    const orderCodes = await OrderCode.findAll({ where: { productID: productId } });
    const orderCodeIds = orderCodes.map((orderCode: any) => orderCode.dataValues.id);

    const productBoxes = await ProductBox.findAll({ where: { orderCodeID: { [Op.in]: orderCodeIds } } });

    const batchIds = productBoxes.map((box: any) => box.dataValues.batchID);
    const batches = await Batch.findAll({ where: { id: { [Op.in]: batchIds } } });
    
    const readyBatches = batches.filter((batch: any) => batch.dataValues.ready);
    const readyBatchIds = readyBatches.map((batch: any) => batch.dataValues.id);
    const readyProductBoxes = productBoxes.filter((box: any) => readyBatchIds.includes(box.dataValues.batchID));
    quantities_x_state.in_kitchen = readyProductBoxes.reduce((sum: number, box: any) => sum + box.dataValues.quantity, 0) +
        quantityInPreparation;

    const batchesIdInTransit = batchIds.filter((batchId: any) => osService.batch_in_transit.includes(batchId));
    const productBoxesInTransit = productBoxes.filter((box: any) => batchesIdInTransit.includes(box.dataValues.batchID));
    quantities_x_state.in_transit = productBoxesInTransit.reduce((sum: number, box: any) => sum + box.dataValues.quantity, 0); 

    return quantities_x_state;
}

export { getMonitorData, updateBatch, getProductQuantityPerState, createBatch };