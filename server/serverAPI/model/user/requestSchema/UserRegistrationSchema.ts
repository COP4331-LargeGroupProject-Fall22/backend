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
}
