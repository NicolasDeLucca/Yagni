interface responseDto {
    statusCode: number;
    body: {
        error?: string;
        data?: any;
    };
}

export { responseDto };