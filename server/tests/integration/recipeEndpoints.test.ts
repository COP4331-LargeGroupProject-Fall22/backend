import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from 'express';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import supertest from 'supertest';
import UserDatabase from '../../database/UserDatabase';

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let databaseURL = (global as any).__MONGO_URI__;
let databaseName = process.env.DB_NAME!;
let collectionName = process.env.DB_USERS_COLLECTION!;

import { app } from '../../App';
import { recipeSearchResponse } from '../unit/responses/recipeSearchResponse';
import { recipeSearchAPIResponse } from '../unit/responses/recipeSearchAPIResponse';
import { recipeGetResponse } from '../unit/responses/recipeGetResponse';
import { recipeGetAPIResponse } from '../unit/responses/recipeGetAPIResponse';

beforeAll(() => {
    UserDatabase.connect(databaseURL, databaseName, collectionName);
});

describe('Recipe endpoints', () => {
    let mockAxios: MockAdapter;

    let searchResponse: any;
    let searchAPIResponse: any;

    let getResponse: any;
    let getAPIResponse: any;

    let searchURL: string;
    let getURL: string;

    let mockRecipeID: number;

    beforeAll(() => {
        mockAxios = new MockAdapter(axios);

        searchResponse = recipeSearchResponse;
        searchAPIResponse = recipeSearchAPIResponse;
        searchURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/complexSearch`;
    
        mockRecipeID = 532245;

        getResponse = recipeGetResponse;
        getAPIResponse = recipeGetAPIResponse;
        getURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/${mockRecipeID}/information`

    });

    beforeEach(() => {
        mockAxios.reset();
    });

    it('Search Recipe items using correct query', async () => {
        mockAxios.onGet(searchURL).reply(200, searchResponse);
        mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

        let response = await supertest(app)
            .get(`/recipes?query=pasta`);

        expect(response.body.data).toMatchObject(searchAPIResponse);
    });

    it('Get Recipe item using correct id', async () => {
        mockAxios.onGet(getURL).reply(200, getResponse);
        mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

        let response = await supertest(app)
            .get(`/recipes/recipe/${mockRecipeID}`);
        
        expect(response.body.data).toMatchObject(getAPIResponse)
    });
})

afterAll(() => {
    UserDatabase.getInstance()?.disconnect();
})