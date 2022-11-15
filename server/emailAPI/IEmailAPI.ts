import IEmailVerificationTemplate from "../serverAPI/model/emailVerification/IEmailVerificationTemplate";

export default interface IEmailAPI {
    /**
     * Sends verification code to the email address.
     * 
     * @param to list of recievers' email addresses.
     * @param from an outbound email address.
     * @param emailVerificationTemplate an object containing dynamic template properties.
     * 
     * @returns Promise filled with a boolean value indecating status of operation.
     */
    SendVerificationCode(to: string, from: string, emailVerificationTemplate: IEmailVerificationTemplate): Promise<boolean>;
}
