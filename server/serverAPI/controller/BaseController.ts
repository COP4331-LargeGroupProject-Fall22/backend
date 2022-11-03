import { Response } from "express";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import ISchema from "../model/ISchema";

export default class BaseController {
    protected getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    protected async verifySchema<T extends ISchema>(object: T, res: Response): Promise<T> {
        let logs = await object.validate()

        if (logs.length > 0) {
            return Promise.reject(this.sendError(400, res, "Incorrect schema."));
        }

        return object;
    }

    protected sendError(statusCode: number, res: Response, message?: any): Response<any, Record<string, any>> {
        return res.status(statusCode)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, message));
    }

    protected sendSuccess(statusCode: number, res: Response, message?: any)
        : Response<any, Record<string, any>> {
        return res.status(statusCode)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, message));
    }

    protected isStringUndefinedOrEmpty(data: string): boolean {
        return data === undefined || data.length === 0;
    }
}
