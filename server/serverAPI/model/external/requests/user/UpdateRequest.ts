import IsType from "../../../../../utils/ClassValidator";

import Schema from "../../../Schema";

export default class UpdateRequestSchema extends Schema {
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
        super();

        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}
