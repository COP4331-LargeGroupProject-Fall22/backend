import axios from "axios";

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
        let requestLimit = headers[SpoonacularAPI.requestRateLimitHeader];
        let requestRemaining = headers[SpoonacularAPI.requestRateRemainingHeader];

        SpoonacularAPI.requestRateLimit = requestLimit !== undefined ? requestLimit as number : SpoonacularAPI.requestRateLimit;
        SpoonacularAPI.requestRateRemaining = requestRemaining as number ? requestRemaining as number : SpoonacularAPI.requestRateRemaining;
    }

    protected async getRequest(url: string, params?: URLSearchParams, headers?: any): Promise<any> {
        if (!this.hasEnoughRequestsRemaining()) {
            throw new RequestLimitReached("Request limit has been reached for Spoonacular API.");
        }

        return axios.get(
            url,
            {
                headers: headers !== undefined ? Object.assign(headers, this.headers) : this.headers,
                params: params,
            }
        ).then(response => {
            this.updateRequestCounters(response.headers);
            
            return response.data;
        }, (error) => {
            return Promise.reject(error.message);
        });
    }
}
