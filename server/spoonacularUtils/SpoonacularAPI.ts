import axios, { AxiosResponse } from "axios";
import RequestLimitReached from "../exceptions/RequestLimitReached";

export default abstract class SpoonacularAPI {
    private readonly headers: any;

    constructor(apiKey: string, apiHost: string) {
        this.headers = {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": apiHost
        };
    }

    protected static requestRateLimitHeader: string = "x-ratelimit-requests-remaining";
    protected static requestRateRemainingHeader: string = "x-ratelimit-results-limit";

    protected static requestRateLimit: number = Number.MAX_SAFE_INTEGER;
    protected static requestRateRemaining: number = Number.MAX_SAFE_INTEGER;

    protected readonly REQUEST_REMAINING_THRESHOLD: number = 10;

    protected hasEnoughRequestsRemaining(): boolean {
        return (100 * SpoonacularAPI.requestRateRemaining / SpoonacularAPI.requestRateLimit) > this.REQUEST_REMAINING_THRESHOLD;
    }

    protected updateRequestCounters(headers: any): void {
        SpoonacularAPI.requestRateLimit = headers[SpoonacularAPI.requestRateLimitHeader] as number;
        SpoonacularAPI.requestRateRemaining = headers[SpoonacularAPI.requestRateRemainingHeader] as number;
    }

    protected async sendRequest(url: string, params?: URLSearchParams, headers?: any): Promise<any> {
        if (!this.hasEnoughRequestsRemaining()) {
            throw new RequestLimitReached("Request limit has been reached for Spoonacular API.");
        }

        let response: AxiosResponse<any, any>;
        try {
            response = await axios.get(
                url,
                {
                    headers: headers !== undefined ? Object.assign(headers, this.headers) : this.headers,
                    params: params
                }
            );
        } catch (error) {
            console.log(error);
            return Promise.resolve(null);
        }

        this.updateRequestCounters(response.headers);

        return response.data;
    }
}
