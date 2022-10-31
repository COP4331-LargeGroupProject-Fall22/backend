import { Response } from "express";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";

export default class BaseController {
    protected getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    protected sendError(statusCode: number, res: Response, message?: any): Response<any, Record<string, any>> {
        return res.status(statusCode)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, message));
    }

    protected sendSuccess(statusCode: number, res:Response, message?: any): Response<any, Record<string, any>> {
        return res.status(statusCode)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, message));
    }

    protected isStringUndefinedOrEmpty(data: string): boolean {
        return data === undefined || data.length === 0;
    }
}
