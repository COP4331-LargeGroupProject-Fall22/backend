import IBaseIngredient from "../../model/internal/ingredient/IBaseIngredient";

import BaseUserController from "./BaseUserController";

export default class BaseIngredientController extends BaseUserController {
    protected sortByCategory<T extends IBaseIngredient>(collection: T[], isReverse: boolean): [string, T[]][] {
        let itemMap = new Map<string, T[]>();

        // Divides collection on map where K,V => Category,T[]
        collection.forEach(item => {
            if (!itemMap.has(item.category)) {
                itemMap.set(item.category, []);
            }

            itemMap.get(item.category)?.push(item);
        });

        // Converts map to array and sorts it based on the category name in lexicographical order
        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        // Sorts each collection related to category in lexicographical order
        items.forEach(item => {
            item[1].sort((a, b) => a.name.localeCompare(b.name))
        });

        if (isReverse) {
            items.reverse();
        }

        return items;
    }

    protected sortByLexicographicalOrder<T extends IBaseIngredient>(collection: T[], isReverse: boolean): [string, T[]][] {
        let itemMap = new Map<string, T[]>();

        collection.forEach((item) => {
            let firstLetter = item.name.charAt(0).toLocaleUpperCase(); 
            
            if (!itemMap.has(firstLetter)) {
                itemMap.set(firstLetter, []);
            }

            itemMap.get(firstLetter)?.push(item);
        });

        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        items.forEach((item) => item[1].sort((a, b) => a.name.localeCompare(b.name)));
        
        if (isReverse) {
            items.reverse();
        }

        return items;
    }
}
