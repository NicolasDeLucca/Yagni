import { Router, Request, Response } from 'express';
import { postRefrigeratorDto, updateInventoryItemDto } from './dtos'
import * as service from './services';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const newFridge: postRefrigeratorDto = req.body;
    const response = await service.createFridge(newFridge);

   return res.status(response.statusCode).json(response.body);
});

router.delete('/:id', async (req: Request, res: Response) => {
    const fridgeId = Number(req.params.id);
    const response = await service.deleteFridge(fridgeId);

    return res.status(response.statusCode).json(response.body);
});

router.post('/inventory/:id', async (req: Request, res: Response) => {
    const fridgeId = Number(req.params.id);
    const inventoryItemToUpdate: updateInventoryItemDto = req.body;
    const response = await service.inventoryAction(fridgeId, inventoryItemToUpdate);

   return res.status(response.statusCode).json(response.body);
});

router.post('/door/:id', async (req: Request, res: Response) => {
    const fridgeId = Number(req.params.id);
    const response = await service.openDoor(fridgeId);

    return res.status(response.statusCode).json(response.body);
});

router.get('/premises/:premiseID', async (req: Request, res: Response) => {
    const { premiseID } = req.params;
    const response = await service.getInventoryItemsByPremise(Number(premiseID));
    
    return res.status(response.statusCode).json(response.body);
});

router.get('/products/:id', async (req: Request, res: Response) => {
    const productId = Number(req.params.id);
    const response = await service.getProductRefrigerators(productId);

    return res.status(response.statusCode).json(response.body);
});

export default router;