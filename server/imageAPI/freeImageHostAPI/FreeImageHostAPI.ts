import axios from "axios";
import IImage from "../../serverAPI/model/image/IImage";
import IImageAPI from "../IImageAPI";

export default class FreeImageHostAPI implements IImageAPI {
    protected apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async Get(imgSrc: string): Promise<IImage> {
        return axios.post(
            process.env.FREE_IMAGE_HOST_BASE_URL,
            {
                "source": imgSrc
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                params: {
                    key: this.apiKey
                }
            }
        ).then(response => {
            return {
                srcUrl: response.data.image.file.resource.chain.image
            };
        }).catch((error) => {
            return Promise.reject(error);
        });
    }
}
