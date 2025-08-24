import nodemailer from 'nodemailer';
import { EMAIL_TEMPLATES } from '../config/constants';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@thetiptop.com',
        to: email,
        subject: 'Bienvenue chez Thé Tip Top !',
        html: this.getWelcomeEmailTemplate(firstName)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendEmailVerification(email: string, firstName: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@thetiptop.com',
        to: email,
        subject: 'Vérifiez votre adresse email - Thé Tip Top',
        html: this.getEmailVerificationTemplate(firstName, verificationUrl)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email verification sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send email verification:', error);
      throw error;
    }
  }

  async sendPasswordReset(email: string, firstName: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@thetiptop.com',
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Thé Tip Top',
        html: this.getPasswordResetTemplate(firstName, resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendParticipationConfirmation(
    email: string,
    firstName: string,
    prizeName: string,
    prizeDescription: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@thetiptop.com',
        to: email,
        subject: 'Félicitations ! Vous avez gagné un prix - Thé Tip Top',
        html: this.getParticipationConfirmationTemplate(firstName, prizeName, prizeDescription)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Participation confirmation sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send participation confirmation:', error);
      throw error;
    }
  }

  async sendPrizeWonNotification(
    email: string,
    firstName: string,
    prizeName: string,
    prizeValue: number
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@thetiptop.com',
        to: email,
        subject: `🎉 Vous avez gagné ${prizeName} !`,
        html: this.getPrizeWonTemplate(firstName, prizeName, prizeValue)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Prize won notification sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send prize won notification:', error);
      throw error;
    }
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenue chez Thé Tip Top</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5530;">Bienvenue chez Thé Tip Top, ${firstName} !</h1>
          
          <p>Nous sommes ravis de vous accueillir dans notre communauté d'amateurs de thé !</p>
          
          <p>Votre compte a été créé avec succès et votre adresse email a été vérifiée. Vous pouvez maintenant :</p>
          
          <ul>
            <li>Participer à notre grand jeu concours</li>
            <li>Découvrir nos thés d'exception</li>
            <li>Gagner des prix fantastiques</li>
          </ul>
          
          <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
          
          <p>Bonne dégustation !<br>
          L'équipe Thé Tip Top</p>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailVerificationTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vérification d'email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5530;">Vérifiez votre adresse email</h1>
          
          <p>Bonjour ${firstName},</p>
          
          <p>Merci de vous être inscrit chez Thé Tip Top ! Pour finaliser votre inscription, veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Vérifier mon email
            </a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          
          <p>Ce lien expirera dans 24 heures.</p>
          
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
          
          <p>Cordialement,<br>
          L'équipe Thé Tip Top</p>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation du mot de passe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5530;">Réinitialisation de votre mot de passe</h1>
          
          <p>Bonjour ${firstName},</p>
          
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          
          <p>Ce lien expirera dans 1 heure.</p>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          
          <p>Cordialement,<br>
          L'équipe Thé Tip Top</p>
        </div>
      </body>
      </html>
    `;
  }

  private getParticipationConfirmationTemplate(firstName: string, prizeName: string, prizeDescription: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Félicitations !</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5530;">🎉 Félicitations ${firstName} !</h1>
          
          <p>Excellente nouvelle ! Vous avez participé avec succès à notre grand jeu concours et vous avez gagné :</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #2c5530; margin: 0;">${prizeName}</h2>
            <p style="margin: 10px 0 0 0;">${prizeDescription}</p>
          </div>
          
          <p>Pour récupérer votre prix, rendez-vous dans l'une de nos boutiques avec une pièce d'identité. Notre équipe se fera un plaisir de vous remettre votre gain !</p>
          
          <p>Merci de votre participation et à bientôt chez Thé Tip Top !</p>
          
          <p>L'équipe Thé Tip Top</p>
        </div>
      </body>
      </html>
    `;
  }

  private getPrizeWonTemplate(firstName: string, prizeName: string, prizeValue: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Prix gagné !</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5530;">🎉 Bravo ${firstName} !</h1>
          
          <p>Nous avons le plaisir de vous confirmer que vous avez gagné :</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #2c5530; margin: 0;">${prizeName}</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">Valeur : ${prizeValue}€</p>
          </div>
          
          <p>Votre prix vous attend en boutique ! N'oubliez pas d'apporter une pièce d'identité pour le retirer.</p>
          
          <p>Félicitations encore une fois !</p>
          
          <p>L'équipe Thé Tip Top</p>
        </div>
      </body>
      </html>
    `;
  }
}
