import { SupabaseClient } from '@supabase/supabase-js';
import type { Transporter } from 'nodemailer';
// Using dynamic import for nodemailer
const nodemailer = async () => {
  return await import('nodemailer');
};
import { resend } from './resend';

// Support email address
const supportEmail = process.env.SUPPORT_EMAIL || 'support@withme.travel';

/**
 * Email service for sending various notifications
 */
export class EmailService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Send a welcome email to a new user
   */
  async sendWelcomeEmail(email: string, name?: string) {
    try {
      const htmlContent = `
        <h1>Welcome to WithMe Travel!</h1>
        <p>Hello ${name || 'there'},</p>
        <p>Thank you for joining WithMe Travel. We're excited to help you plan and organize your trips with friends and family.</p>
        <p>Get started by creating your first trip:</p>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/trips/create" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Create Trip</a></p>
        <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
        <p>Happy travels!</p>
        <p>The WithMe Travel Team</p>
      `;

      await EmailService.sendEmail({
        to: email,
        subject: 'Welcome to WithMe Travel',
        html: htmlContent,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send a comment notification email
   */
  async sendCommentNotificationEmail(data: {
    email: string;
    name?: string;
    commenterName: string;
    tripName: string;
    commentText: string;
    tripUrl: string;
  }) {
    try {
      const htmlContent = `
        <h1>New Comment on Your Trip</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>${data.commenterName} commented on your trip "${data.tripName}":</p>
        <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 1rem; margin-left: 0;">
          ${data.commentText}
        </blockquote>
        <p>View and reply to this comment:</p>
        <p><a href="${data.tripUrl}" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a></p>
        <p>The WithMe Travel Team</p>
      `;

      await EmailService.sendEmail({
        to: data.email,
        subject: `${data.commenterName} commented on ${data.tripName}`,
        html: htmlContent,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending comment notification email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send a security alert email
   */
  async sendSecurityAlertEmail(data: {
    email: string;
    name?: string;
    loginTime: string;
    ipAddress: string;
    browser: string;
    location?: string;
  }) {
    try {
      const htmlContent = `
        <h1>Suspicious Login Detected</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>We detected a login to your WithMe Travel account from a new device or location.</p>
        <p>Here are the details:</p>
        <ul>
          <li><strong>Time:</strong> ${data.loginTime}</li>
          <li><strong>IP Address:</strong> ${data.ipAddress}</li>
          <li><strong>Browser:</strong> ${data.browser}</li>
          ${data.location ? `<li><strong>Location:</strong> ${data.location}</li>` : ''}
        </ul>
        <p>If this was you, you can ignore this email. If you didn't log in at this time, please 
           <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings/security">secure your account</a> immediately.</p>
        <p>For security assistance, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
        <p>The WithMe Travel Team</p>
      `;

      await EmailService.sendEmail({
        to: data.email,
        subject: 'Security Alert: New Login Detected',
        html: htmlContent,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending security alert email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send email using the configured email provider
   */
  static async sendEmail({
    to,
    subject,
    html,
    from = `WithMe Travel <${process.env.EMAIL_FROM || 'notifications@withme.travel'}>`,
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    try {
      // Use Resend if configured
      if (process.env.RESEND_API_KEY) {
        const { data, error } = await resend.emails.send({
          from,
          to,
          subject,
          html,
        });

        if (error) {
          throw new Error(`Resend error: ${error.message}`);
        }

        return { success: true, data };
      }

      // Fall back to Nodemailer for development/testing
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html,
        });

        return { success: true, data: info };
      }

      // Log to console in development when no email provider is configured
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Email would be sent in production:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content:', html.substring(0, 200) + '...');
        return { success: true, data: { id: 'dev-email-mock' } };
      }

      throw new Error('No email provider configured');
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  }
}