import IBaseIngredient from "../model/ingredient/IBaseIngredient";
import BaseUserController from "./BaseUserController";

export default class BaseIngredientController extends BaseUserController {
    protected sortByCategory<T extends IBaseIngredient>(collection: T[], isReverse: boolean): any {
        let itemMap = new Map<string, T[]>();

        collection.forEach(item => {
            if (!itemMap.has(item.category)) {
                itemMap.set(item.category, []);
            }

            itemMap.get(item.category)?.push(item);
        });

        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        items.forEach(item => {
            item[1].sort((a, b) => a.name.localeCompare(b.name))
        });

        if (isReverse) {
            items.reverse();
        }

        return Object.fromEntries(items);
    }

    protected sortByLexicographicalOrder<T extends IBaseIngredient>(collections: T[], isReverse: boolean): any {
        collections.sort((a, b) => a.name.localeCompare(b.name));

        if (isReverse) {
            collections.reverse();
        }

        return collections;
    }
}
