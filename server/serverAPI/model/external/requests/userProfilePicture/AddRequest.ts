import { IsBase64 } from "class-validator";

import ISchema from "../../../ISchema";
import Schema from "../../../Schema";

export default class AddRequestSchema extends Schema {
    @IsBase64()
    imgAsBase64: string

    constructor(imgAsBase64: string) {
        super();
        
        this.imgAsBase64 = imgAsBase64;
    }
}
