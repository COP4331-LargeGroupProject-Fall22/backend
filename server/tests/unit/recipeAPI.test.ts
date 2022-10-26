import * as dotenv from 'dotenv';
dotenv.config();

import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { recipeResponse } from './responses/recipeResponse';
import SpoonacularRecipeAPI from '../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI';
import SpoonacularFoodAPI from '../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI';

import * as fs from 'fs';
import { recipeAPIResponse } from './responses/recipeAPIResponse';

describe('Recipe API ', () => {
    let mockAxios: MockAdapter;
    
    let searchResponse: any;
    let searchRecipeAPIResponse: any;

    let searchURL: string; 

    beforeAll(() => {
        mockAxios = new MockAdapter(axios);

        searchResponse = recipeResponse;
        searchRecipeAPIResponse = recipeAPIResponse;
        searchURL = process.env.SPOONACULAR_RECIPE_BASE_URL + '/complexSearch';
    });

    beforeEach(() => {
        mockAxios.reset();
    });

    it ('Search Recipe method returns correctly formatted response', async () => {
        mockAxios.onGet(searchURL).reply(200, searchResponse);
        mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

        let recipeAPI = new SpoonacularRecipeAPI(new SpoonacularFoodAPI());

        let response = await recipeAPI.SearchRecipe(new Map([
            ["query", "pasta"]
        ]));
        
        expect(response).toMatchObject(searchRecipeAPIResponse);
    });

    afterAll(() => {
        mockAxios.restore();
    })
});