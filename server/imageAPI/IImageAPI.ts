import IImage from "../serverAPI/model/internal/image/IImage";

export default interface IImageAPI {
    /**
     * Returns IImage object.
     * 
     * @param imgAsBase64 - source image as base64 string
     */
    Get(imgAsBase64: string): Promise<IImage>;
}
