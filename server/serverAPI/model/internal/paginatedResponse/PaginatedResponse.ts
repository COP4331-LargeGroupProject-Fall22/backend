export default class PaginatedResponse<T extends object> { 
    numOfPages: number;
    numOfResults: number;

    currentPage: number;

    results: T[];

    constructor(
        numOfPages: number,
        numOfResults: number,
        currentPage: number,
        results: T[]
    ) {
        this.numOfPages = numOfPages;
        this.numOfResults = numOfResults;
        this.currentPage = currentPage;
        this.results = results;
    }
}
