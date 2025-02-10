import redis_client from "./redis";
import logger from "../../logging/src/logger";

// real time stock management

async function addProductToRefrigerator(refrigeratorId: number, productId: number, quantity: number) {
    const existingQuantity = await redis_client.hGet(`refrigerator:${refrigeratorId}`, productId.toString());
    const newQuantity = (parseInt(existingQuantity || '0', 10)) + quantity;
    await redis_client.hSet(`refrigerator:${refrigeratorId}`, productId.toString(), newQuantity.toString());
    logger.info(`Redis Service - Product ${productId}, quantity: ${newQuantity}`);
    console.log(`Product ${productId}, quantity: ${newQuantity}`);
}

async function getRefrigeratorContents(refrigeratorId: number) {
    const products = await redis_client.hGetAll(`refrigerator:${refrigeratorId}`);
    logger.info(`Redis Service - Refrigerator ${refrigeratorId} content: `, products);
    console.log(`Refrigerator ${refrigeratorId} content retrieved succesfully`);    
    return products;
}

// order refrigerator location management

async function addRefrigeratorToOrder(orderId: number, refrigeratorId: number) {
    await redis_client.lPush(`order:${orderId}`, refrigeratorId.toString());
    logger.info(`Redis Service - Refrigerator ${refrigeratorId} added to order ${orderId}`);
    console.log(`Cache: Refrigerator ${refrigeratorId} added to order ${orderId}`);
}

async function getRefrigeratorsForOrder(orderId: number) {
    const refrigerators = await redis_client.lRange(`order:${orderId}`, 0, -1);
    logger.info(`Redis Service - Refrigerators associated to order ${orderId}: `, refrigerators);
    console.log(`Cache: Refrigerators associated to order ${orderId}.`);
    return refrigerators;
}

export { addProductToRefrigerator, getRefrigeratorContents, addRefrigeratorToOrder, getRefrigeratorsForOrder };