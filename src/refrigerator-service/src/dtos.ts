export type refrigeratorAction = 'lock' | 'unlock' | 'add' | 'remove';

interface postRefrigeratorDto {
    guid: string;
    brand: string;
    premiseId: number;
}

interface retrieveInventoryItemDto {
    refrigeratorId: number;
    productId: number;
    quantity: number;
}

interface updateInventoryItemDto {
    action: refrigeratorAction;
    productId: number;
    quantity: number;
}

interface responseDto {
    statusCode: number;
    body: {
        error?: string;
        data?: any;
    };
}

export { 
    postRefrigeratorDto, 
    retrieveInventoryItemDto, 
    updateInventoryItemDto, 
    responseDto
};