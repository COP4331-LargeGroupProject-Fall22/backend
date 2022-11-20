import IBaseIngredient from "../model/ingredient/IBaseIngredient";
import BaseUserController from "./BaseUserController";

export default class BaseIngredientController extends BaseUserController {
    protected sortByCategory<T extends IBaseIngredient>(collection: T[], isReverse: boolean): any {
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

    protected sortByLexicographicalOrder<T extends IBaseIngredient>(collections: T[], isReverse: boolean): any {
        collections.sort((a, b) => a.name.localeCompare(b.name));

        if (isReverse) {
            collections.reverse();
        }

        return collections;
    }
}
