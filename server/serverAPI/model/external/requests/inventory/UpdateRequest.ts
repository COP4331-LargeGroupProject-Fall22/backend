import IsType from "../../../../../utils/ClassValidator";

import Schema from "../../../Schema";

export default class UpdateRequestSchema extends Schema {
    @IsType(['null', 'positiveInt'])
    expirationDate: number | null;

    constructor(
        expirationDate: number | null = null
    ) {
        super();

        this.expirationDate = expirationDate;
    }
}
