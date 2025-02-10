import { Request } from "express";

export const request_redirection = async (req: Request, body_: any) => {
    return {
        method: req.method,
        body: body_,
        headers: req.headers,
        query: req.query
    };
};

export interface response {
    statusCode: number;
    body: {
        error?: string;
        data?: any;
    };
}