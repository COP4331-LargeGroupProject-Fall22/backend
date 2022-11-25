import Token from "../../model/internal/token/Token";

export default class JWTStorage {
    private static instance?: JWTStorage;

    private map: Map<string, Token>;

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

    getJWT(key: string): Token | undefined {
        return this.map.get(key);
    }

    deleteJWT(key: string): boolean {
        return this.map.delete(key);
    }

    addJWT(key:string, token: Token) {
        this.map.set(key, token);
    }
}
