import BaseUserSchema from "./BaseUserSchema";

export default class UserRegistrationSchema extends BaseUserSchema {
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
