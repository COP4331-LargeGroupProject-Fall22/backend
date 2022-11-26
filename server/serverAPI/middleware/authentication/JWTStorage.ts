import UserToken from "../../model/internal/userToken/UserToken";

export default class JWTStorage {
    private static instance?: JWTStorage;

    private map: Map<string, UserToken>;

    private constructor() {
        this.map = new Map();
    }

    /**
     * Retrieves current instance of the JWTStorage if such exists.
     * 
     * @returns JWTStorage object or undefined.
     */
    static getInstance<T>(): JWTStorage {
        if (JWTStorage.instance === undefined) {
            JWTStorage.instance = new JWTStorage();
        }

        return JWTStorage.instance;
    }
    
    hasJWT(key: string): boolean {
        return this.map.has(key);
    }

    getJWT(key: string): UserToken | undefined {
        return this.map.get(key);
    }

    deleteJWT(key: string): boolean {
        return this.map.delete(key);
    }

    addJWT(key:string, token: UserToken) {
        this.map.set(key, token);
    }
}
