import IVerificationCodeTemplate from "../serverAPI/model/internal/email/IVerificationCodeTemplate";

export default interface IEmailAPI {
    /**
     * Sends verification code to the email address.
     * 
     * @param to a recievers' email addresses.
     * @param from an outbound email address.
     * @param emailVerificationTemplate an object containing dynamic template properties.
     * 
     * @returns Promise filled with a boolean value indicating status of operation.
     */
    SendVerificationCode(to: string, from: string, emailVerificationTemplate: IVerificationCodeTemplate): Promise<boolean>;
}
