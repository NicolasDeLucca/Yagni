interface responseDto {
    statusCode: number;
    body: {
        error?: string;
        data?: any;
    };
}

interface driverData {
    quantity: number;
    productId: number;
    refrigeratorId: number;
}

interface productQuantityReport {
    productId: number;
    in_transit: number;
    in_kitchen: number;
    in_refrigerator: number;
}

interface productQuantityxPremise {
    productId: number;
    premiseId: number;
    quantity: number;
}

export { responseDto, driverData, productQuantityReport, productQuantityxPremise };