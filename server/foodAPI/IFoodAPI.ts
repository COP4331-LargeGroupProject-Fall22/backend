import IFood from "../serverAPI/model/food/IFood";

export default interface IFoodAPI {
    GetFood(parameters?: Map<String, any>): Promise<IFood[]>;
}
