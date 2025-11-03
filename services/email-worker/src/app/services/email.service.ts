import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (this.isProduction && process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      console.log('Running in development mode - emails will be logged to console');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.SMTP_FROM || '"Task Management" <noreply@taskmanagement.local>',
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        console.log('Email sent successfully:', info.messageId);
      } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
      }
    } else {
      console.log('\n📧 [EMAIL] =====================================');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:');
      console.log(options.html);
      console.log('==============================================\n');
    }
  }

  async sendWelcomeEmail(name: string, email: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Task Management!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering with us. We're excited to have you on board!</p>
        <p>You can now start managing your tasks efficiently.</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0;"><strong>Your account details:</strong></p>
          <p style="margin: 10px 0;">Email: ${email}</p>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>Task Management Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Task Management!',
      html,
    });
  }

  async sendProfileUpdateEmail(name: string, email: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Profile Updated</h1>
        <p>Hi ${name},</p>
        <p>Your profile has been successfully updated.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>Task Management Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Profile Updated - Task Management',
      html,
    });
  }

  async sendAccountDeletionEmail(name: string, email: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Account Deleted</h1>
        <p>Hi ${name},</p>
        <p>Your account has been successfully deleted.</p>
        <p>We're sorry to see you go. If you change your mind, you can always create a new account.</p>
        <p>Thank you for using Task Management.</p>
        <p>Best regards,<br>Task Management Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Account Deleted - Task Management',
      html,
    });
  }
}

export const emailService = new EmailService();

