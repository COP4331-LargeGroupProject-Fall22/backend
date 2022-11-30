import { IsDefined, IsUrl } from "class-validator";

import IImage from "./IImage";

import Schema from "../../Schema";

export default class ImageSchema extends Schema implements IImage {
    @IsDefined()
    @IsUrl()
    srcUrl: string;
    
    constructor(srcUrl: string) {
        super();

        this.srcUrl = srcUrl;
    }
}
