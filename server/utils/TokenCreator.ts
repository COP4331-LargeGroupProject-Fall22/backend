import jwt from 'jsonwebtoken'

import JsonWebTokenError from '../exceptions/JsonWebTokenError'

export default class TokenCreator<T extends object> {
    private privateKey: string;

    constructor(privateKey: string) {
        this.privateKey = privateKey;
    }

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    sign(obj: T, expiresInSeconds: number): string {
        return jwt.sign(
            obj,
            this.privateKey,
            {
                expiresIn: expiresInSeconds
            }
        );
    }

    verify(token: string): T {
        try {
            return jwt.verify(token, this.privateKey) as T;
        }
        catch (error) {
            throw new JsonWebTokenError(this.getException(error));
        }
    }
}
