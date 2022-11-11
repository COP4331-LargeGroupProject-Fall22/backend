import IEmailAPI from "../IEmailAPI";
import SendGrid, { MailDataRequired } from "@sendgrid/mail";
import IEmailVerificationTemplate from "../../serverAPI/model/emailVerification/IEmailVerificationTemplate";
import { isEmail } from "class-validator";

export default class SendGridAPI implements IEmailAPI {
    private readonly templateId = "d-41af78b6ace24a2b93e78678f06073f8";

    constructor(apiKey: string) {
        SendGrid.setApiKey(apiKey);
    }

    async SendVerificationCode(to: string, from: string, emailVerificationTemplate: IEmailVerificationTemplate): Promise<boolean> {
        if (!(isEmail(to) && isEmail(from))) {
            Promise.reject("Email addressed provided are invalid.");
        }

        let message: MailDataRequired = {
            to: to,
            from: from,
            templateId: this.templateId,
            dynamicTemplateData: emailVerificationTemplate
        };

        try {
            await SendGrid.send(message);
            return Promise.resolve(true);
        } catch(e) {
            return Promise.resolve(false);
        }
    }
}
