export declare class EmailService {
    private transporter;
    constructor();
    sendWelcomeEmail(email: string, firstName: string): Promise<void>;
    sendEmailVerification(email: string, firstName: string, token: string): Promise<void>;
    sendPasswordReset(email: string, firstName: string, token: string): Promise<void>;
    sendParticipationConfirmation(email: string, firstName: string, prizeName: string, prizeDescription: string): Promise<void>;
    sendPrizeWonNotification(email: string, firstName: string, prizeName: string, prizeValue: number): Promise<void>;
    sendNewsletterWelcome(email: string, firstName?: string): Promise<void>;
    private getWelcomeEmailTemplate;
    private getEmailVerificationTemplate;
    private getPasswordResetTemplate;
    private getParticipationConfirmationTemplate;
    private getPrizeWonTemplate;
    private getNewsletterWelcomeTemplate;
}
//# sourceMappingURL=email.service.d.ts.map