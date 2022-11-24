import IEmailAPI from "../IEmailAPI";
import SendGrid, { MailDataRequired } from "@sendgrid/mail";
import IEmailVerification from "../../serverAPI/model/emailVerification/IEmailVerification";
import { isEmail } from "class-validator";

export default class SendGridAPI implements IEmailAPI {
    private readonly templateId = process.env.SENDGRID_VERIFICATION_EMAIL_TEMPLATEID;

    constructor(apiKey: string) {
        SendGrid.setApiKey(apiKey);
    }

    async SendVerificationCode(to: string, from: string, emailVerificationTemplate: IEmailVerification): Promise<boolean> {
        if (!(isEmail(to) && isEmail(from))) {
            return Promise.reject("Email addresses provided are invalid.");
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
            return Promise.reject(e);
        }
    }
}
