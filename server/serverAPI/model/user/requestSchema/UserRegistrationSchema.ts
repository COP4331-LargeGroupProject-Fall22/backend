import { validate } from "class-validator";
import UserSchema from "./UserSchema";

export default class UserRegistrationSchema extends UserSchema {
    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
    ) {
        super(firstName, lastName, username, password, Date.now())
    }

    async validate(): Promise<{ [type: string]: string; }[]> {
        let validationError = validate(this);

        const errors = await validationError;

        let logs: Array<{ [type: string]: string; }> = [];
        if (errors.length > 0) {
            errors.forEach(error => logs.push(error.constraints!));
        }

        return await Promise.resolve(logs);
    }
}
