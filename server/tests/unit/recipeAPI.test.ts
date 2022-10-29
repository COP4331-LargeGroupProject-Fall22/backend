import * as dotenv from 'dotenv';
dotenv.config();

import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import SpoonacularRecipeAPI from '../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI';
import SpoonacularFoodAPI from '../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI';

import { recipeSearchResponse } from './responses/recipeSearchResponse';
import { recipeSearchAPIResponse } from './responses/recipeSearchAPIResponse';

import { recipeGetResponse } from './responses/recipeGetResponse';
import { recipeGetAPIResponse } from './responses/recipeGetAPIResponse';

describe('Recipe API ', () => {
    let mockAxios: MockAdapter;
    
    let searchResponse: any;
    let searchRecipeAPIResponse: any;

    let getResponse: any;
    let getRecipeAPIResponse: any;

    let mockRecipeID: number;

    let searchURL: string; 
    let getURL: string;

    beforeAll(() => {
        mockAxios = new MockAdapter(axios);

        mockRecipeID = 532245;

        searchResponse = recipeSearchResponse;
        searchRecipeAPIResponse = recipeSearchAPIResponse;
        searchURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/complexSearch`;
    
        getResponse = recipeGetResponse;
        getRecipeAPIResponse = recipeGetAPIResponse;
        getURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/${mockRecipeID}/information`
    });

    beforeEach(() => {
        mockAxios.reset();
    });

    it ('Search Recipe method returns correctly formatted response', async () => {
        mockAxios.onGet(searchURL).reply(200, searchResponse);
        mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

        let recipeAPI = new SpoonacularRecipeAPI(
            "test",
            "test",
            new SpoonacularFoodAPI("test", "test"));

        let response = await recipeAPI.SearchRecipe(new Map([
            ["query", "pasta"]
        ]));
        
        expect(response).toMatchObject(searchRecipeAPIResponse);
    });

    it ('Get Recipe method returns correctly formatted response', async () => {
        mockAxios.onGet(getURL).reply(200, getResponse);
        mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

        let recipeAPI = new SpoonacularRecipeAPI(
            "test",
            "test",
            new SpoonacularFoodAPI("test", "test"));

        let response = await recipeAPI.GetRecipe(new Map([
            ["id", mockRecipeID]
        ]));

        expect(response).not.toBeNull();
        expect(response).toMatchObject(getRecipeAPIResponse);
    })

    afterAll(() => {
        mockAxios.restore();
    })
});
