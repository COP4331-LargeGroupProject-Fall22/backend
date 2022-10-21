import IUser from "../serverAPI/model/user/IUser";

/**
 * Database interface describing full CRUD operations of the User.
 */
export default interface IUserDatabase {
    GetUsers(parameters?: Map<String, any>): Promise<Partial<IUser>[] | null>;

    GetUser(parameters: Map<String, any>): Promise<IUser | null>;
    
    CreateUser(user: IUser): Promise<IUser | null>;
    
    UpdateUser(id: string, user:IUser): Promise<IUser | null>;
    
    DeleteUser(id: string): Promise<boolean>;
}
