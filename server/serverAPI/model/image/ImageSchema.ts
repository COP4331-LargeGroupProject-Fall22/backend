import { IsBase64, IsUrl } from "class-validator";
import IImage from "./IImage";

export default class ImageSchema implements IImage {
    @IsBase64()
    imgAsBase64?: string;

    @IsUrl()
    srcUrl: string;

    constructor(srcUrl: string, imgAsBase64: string) {
        this.imgAsBase64 = imgAsBase64;
        this.srcUrl = srcUrl;
    }
}
