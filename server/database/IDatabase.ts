/**
 * Database interface describing full CRUD operations of the object with generic type T.
 */
export default interface IDatabase<T> {
    GetUsers(parameters?: Map<String, any>): Promise<Partial<T>[] | null>;

    GetUser(parameters: Map<String, any>): Promise<T | null>;
    
    CreateUser(user: T): Promise<T | null>;
    
    UpdateUser(id: string, user:T): Promise<T | null>;
    
    DeleteUser(id: string): Promise<boolean>;
}
