import { Op } from 'sequelize'
import { addProductToRefrigerator, getRefrigeratorContents } from '../../redis/src/services';
const { InventoryItem, Refrigerator } = require('./models');
import { retrieveInventoryItemDto ,updateInventoryItemDto, 
    postRefrigeratorDto, responseDto } from './dtos';
import logger from '../../logging/src/logger';

const createFridge = async (newFridge: postRefrigeratorDto) => {
    let result: responseDto;
    try {
        const fridge = await Refrigerator.create({newFridge});
        logger.info('Refrigerator created successfully. Refrigerator id: ' + fridge.dataValues.id);
        console.log('Refrigerator created successfully. Refrigerator id: ' + fridge.dataValues.id);
        return result = {
            statusCode: 201,
            body: { data: 'Refrigerator created successfully. Refrigerator id: ' + 
                fridge.dataValues.id }
        };
    } 
    catch (error) {
        logger.error('Error creating refrigerator: ' + error);
        console.log('Error creating refrigerator: ' + error);
        return result = {
            statusCode: 400,
            body: { error: 'Error creating refrigerator: ' + error }
        };
    }
};

const deleteFridge = async (fridgeId: number) => {
    let result: responseDto;
    try {
        const fridge = await Refrigerator.findByPk(fridgeId);
        if (!fridge) {
            logger.error('Refrigerator not found');
            console.log('Refrigerator not found');
            return result = {
                statusCode: 404,
                body: { error: 'Refrigerator not found' }
            };
        }
        await fridge.destroy();
        logger.info('Refrigerator deleted successfully');
        console.log('Refrigerator deleted successfully');
        return result = {
            statusCode: 200,
            body: { data: 'Refrigerator deleted successfully' }
        };
    }
    catch (error) {
        logger.error('Error deleting refrigerator: ' + error);
        console.log('Error deleting refrigerator: ' + error);
        return result = {
            statusCode: 400,
            body: { error: 'Error deleting refrigerator: ' + error }
        };
    }
};

const openDoor = async (fridgeId: number) => {
    let result: responseDto;
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        const fridge = await Refrigerator.findByPk(fridgeId);
        if (!fridge) {
            logger.error('Refrigerator not found');
            console.log('Refrigerator not found');
            return result = {
                statusCode: 404,
                body: { error: 'Refrigerator not found' }
            };
        }
        let isLocked = fridge.dataValues.isLocked;
        while (!isLocked){
            logger.info('Door is already open. We are waiting until the other person closes it.');
            console.log('Door is already open. We are waiting until the other person closes it.');
            await new Promise(resolve => setTimeout(resolve, 8000));
            await fridge.reload();
            isLocked = fridge.dataValues.isLocked;
        } 
        fridge.dataValues.isLocked = false;
        await fridge.save();
        logger.info('Door opened successfully');
        console.log('Door opened successfully');
        return result = {
            statusCode: 200,
            body: { data: 'Door opened successfully' }
        };     
    }
    catch (error) {
        logger.error('Door action failed: ' + error);
        console.log('Door action failed: ' + error);
        return result = {
            statusCode: 400,
            body: { error: 'Door action failed: ' + error }
        };
    }
}

const inventoryAction = async (fridgeId: number, inventoryItemToUpdate: updateInventoryItemDto) => {  
    let result: responseDto;
    try {
        const fridge = await Refrigerator.findByPk(fridgeId);
        if (!fridge) {
            logger.error('Refrigerator not found');
            console.log('Refrigerator not found');
            return result = {
                statusCode: 404,
                body: { error: 'Refrigerator not found' }
            };
        }
        if (inventoryItemToUpdate.action === 'lock' || inventoryItemToUpdate.action === 'unlock') {
            logger.error('Invalid Refrigerator Action');
            console.log('Invalid Refrigerator Action');
            return result = {
                statusCode: 400,
                body: { error: 'Invalid Refrigerator Action' }
            };
        }
        else { 
            const inventoryItem = await InventoryItem.findOne({ where: { 
                    RefrigeratorID: fridgeId, 
                    productID: inventoryItemToUpdate.productId, 
                    quantity: inventoryItemToUpdate.action === 'add' ? 
                            { [Op.gte]: inventoryItemToUpdate.quantity } : 
                            { [Op.lte]: inventoryItemToUpdate.quantity }
            }});
            if (!inventoryItem) {
                logger.error('Inventory Item not found');
                console.log('Inventory Item not found');
                return result = {
                    statusCode: 404,
                    body: { error: 'Inventory Item not found' }
                };
            }
            const quantity_before = inventoryItem.dataValues.quantity;
            if (inventoryItemToUpdate.action === 'add')
                inventoryItem.dataValues.quantity += inventoryItemToUpdate.quantity;
            else
                inventoryItem.dataValues.quantity -= inventoryItemToUpdate.quantity;
            if (
                inventoryItemToUpdate.action === 'remove' &&
                quantity_before - inventoryItemToUpdate.quantity > inventoryItem.dataValues.quantity)
            {
                console.log("the client got more items of the fridge than they should have");
                logger.error(`the client got more items of the fridge - with id ${fridgeId} - than they should have`);
                return result = {
                    statusCode: 412,
                    body: { data: "Pip! Pip! Pip! Inventory could not be updated correctly. The Premise Supervisor needs" + 
                                    "to take action to solve the inventory problem correctly." }
                };
            } else
            {
                await inventoryItem.save();
                logger.info('Inventory Successfully updated');
                console.log('Inventory Successfully updated');
                fridge.dataValues.isLocked = true;
                await fridge.save();
                logger.info('Door was locked');
                console.log('Door was locked');
                await addProductToRefrigerator(fridgeId, inventoryItemToUpdate.productId, inventoryItem.dataValues.quantity);
                return result = {
                    statusCode: 200,
                    body: { data: 'Inventory Successfully updated' }
                };
            }
        }
    }
    catch (error) {
        logger.error('Inventory Update failed: ' + error);
        console.log('Inventory Update failed: ' + error);
        return result = {
            statusCode: 400,
            body: { error: 'Inventory Update failed: ' + error }
        };
    }
};

const getInventoryItemsByPremise = async (premiseID_: number) => {
    let result: responseDto;
    try {
        const fridges = await Refrigerator.findAll({ where: { premiseID: premiseID_ }});
        const AllInventoryItems = await InventoryItem.findAll();
        const fridgesId = fridges.map((fridge:any) => fridge.dataValues.id);
        const inventoryItems = AllInventoryItems.filter((item:any) => fridgesId.includes(
            item.dataValues.refrigeratorID
        ));
        const premiseInventoryItems: retrieveInventoryItemDto[] = inventoryItems.map((item:any) => {
            return {
                refrigeratorId: item.dataValues.refrigeratorID,
                productId: item.dataValues.productID,
                quantity: item.dataValues.quantity
            };
        });
        logger.info('Inventory items retrieved successfully');
        console.log('Inventory items retrieved successfully');
        return result = {
            statusCode: 200,
            body: { data: premiseInventoryItems }
        };
    }
    catch (error) {
        logger.error('Error retrieving Inventory items: ' + error);
        return result = {
            statusCode: 400,
            body: { error: 'Error retrieving Inventory items: ' + error }
        };
    }
}

const getProductRefrigerators = async (productId: number) => {
    let result: responseDto;
    try{
        const refrigerator_x_quantity:any[] = [];
        const allRefrigerators = await Refrigerator.findAll();
        for (const fridge of allRefrigerators) {
            const fridgeId = fridge.dataValues.id;
            const fridgeContent = await getRefrigeratorContents(fridgeId);
            const productQuantity = fridgeContent[productId.toString()];
            if (productQuantity !== undefined) {
                refrigerator_x_quantity.push({ "refrigeratorId": fridgeId, "quantity": productQuantity });
            }
        }
        logger.info('Refrigerators retrieved successfully');
        console.log('Refrigerators retrieved successfully');
        return result = {
            statusCode: 200,
            body: { data: refrigerator_x_quantity }
        }
    }
    catch (error) {
        logger.error('Error retrieving Refrigerators: ' + error);
        console.log('Error retrieving Refrigerators.');
        return result = {
            statusCode: 400,
            body: { error: 'Error retrieving Refrigerators: ' + error }
        };
    }
}

export { inventoryAction, openDoor, getInventoryItemsByPremise, createFridge, deleteFridge, getProductRefrigerators };