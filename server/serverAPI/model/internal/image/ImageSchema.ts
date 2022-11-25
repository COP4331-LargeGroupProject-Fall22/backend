import { IsDefined, IsUrl, validate } from "class-validator";
import IImage from "./IImage";
import ISchema from "../../ISchema";

export default class ImageSchema implements IImage, ISchema {
    @IsDefined()
    @IsUrl()
    srcUrl: string;
    
    constructor(srcUrl: string) {
        this.srcUrl = srcUrl;
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
