import { Response } from "express";
import { ResponseCodes } from "../../../utils/ResponseCodes";

import ISchema from "../../model/ISchema";

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
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, logs));
        }

        return object;
    }

    protected send(statusCode: ResponseCodes, res: Response, message?: any): Response<any, Record<string, any>> {
        return res.status(statusCode)
            .json(message);
    }

    protected isStringUndefinedOrEmpty(data: string): boolean {
        return data === undefined || data.length === 0;
    }

    protected convertResponse<T extends object>(collection: T[]): [string, T[]][] {
        return Array.from([["unorganized", collection]]);
    }
}
