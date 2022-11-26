import { validate } from "class-validator";

import IsType from "../../../../../utils/ClassValidator";

import ISchema from "../../../ISchema";

export default class UpdateRequestSchema implements ISchema {
    @IsType(['null', 'string'])
    firstName: string | null;

    @IsType(['null', 'string'])
    lastName: string | null;

    @IsType(['null', 'string'])
    username: string | null;

    @IsType(['null', 'string'])
    password: string | null;

    @IsType(['null', 'string'])
    email: string | null;

    constructor(
        firstName: string | null,
        lastName: string | null,
        username: string | null,
        password: string | null,
        email: string | null
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.email = email;
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
