import bcrypt from 'bcrypt';

export default class Encryptor {
    async encrypt(data: string): Promise<string> {
        // Arbitrarily uses 10 rounds to generate the salt for the hash.
        return bcrypt.hash(data, 10);
    }

    async compare(data: string, encryptedData: string): Promise<boolean> {
        return bcrypt.compare(data, encryptedData);
    }
}
