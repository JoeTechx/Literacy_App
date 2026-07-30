import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('SMTP credentials not configured, skipping email delivery.');
      return;
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const verifyUrl = `${backendUrl}/api/v1/auth/verify?token=${token}`;

    const mailOptions = {
      from: `"Literacy App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Verify your Literacy App account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 12px;">
          <h2 style="color: #60a5fa; margin-bottom: 8px;">Welcome to Literacy App, ${name}!</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">You have been invited as a staff member. Click the button below to verify your email address and activate your account.</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ✅ Verify My Email
          </a>
          <p style="margin-top: 28px; font-size: 13px; color: #475569;">This link is single-use and will expire once clicked. If you did not expect this invitation, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <p style="font-size: 12px; color: #334155;">Literacy App &mdash; School Portal</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      throw error; // Or handle silently depending on requirements
    }
  }
}
