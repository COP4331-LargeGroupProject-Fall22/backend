/**
 * Database interface describing full CRUD operations of the object with generic type T.
 */
export default interface IDatabase<T> {
   /**
     * Retrieves general information about all T objects stored in the database. 
     * 
     * @param parameters query parameters used for searching.
     * @returns Promise filled with T or null if T objects weren't found.
     */    
    GetAll(parameters?: Map<String, any>): Promise<T[] | null>;

    /**
     * Retrieves complete information about specific user defined by T's _id.
     * 
     * @param parameters query parameters used for searching.
     * - _id - required parameter that defines user's _id.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with T object or null if T object wasn't found.
     */    
    Get(parameters: Map<String, any>): Promise<T | null>;

    /**
     * Creates T object in the database.
     * 
     * @param object T object filled with information about object.
     * 
     * @throws IncorrectSchema exception when T object doesn't have correct format.
     * @returns Promise filled with T object or null if T object wasn't created.
     */    
    Create(object: T): Promise<T | null>;

    /**
     * Updates T object in the database
     * 
     * @param id unique identifier of the T object that is used internally in the database.
     * @param object T object filled with information about object.
     * 
     * @throws IncorrectSchema exception when T object doesn't have correct format.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with updated T object or null if T object wasn't updated.
     */    
    Update(id: string, object: T): Promise<T | null>;

    /**
     * Deletes T object from database.
     * 
     * @param id unique identifier of the T object that is used internally in the database.
     * 
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with boolean value indication status of the operation.
     */    
    Delete(id: string): Promise<boolean>;
}
