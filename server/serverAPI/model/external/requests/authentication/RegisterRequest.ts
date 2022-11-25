import BaseUserSchema from "../../../internal/user/requestSchema/BaseUserSchema";

export default class RegisterRequestSchema extends BaseUserSchema {
    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string
    ) {
        super(firstName, lastName, username, password, email, Date.now())
    }
}
