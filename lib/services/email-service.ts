/**
 * Email Service using Plunk
 * Handles all transactional emails sent from the application
 */

import Plunk from '@plunk/node';

// Initialize Plunk client
const plunk = new Plunk(process.env.PLUNK_API_KEY || '');

// Email types
export enum EmailType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  TRIP_INVITATION = 'trip-invitation',
  TRIP_UPDATE = 'trip-update',
  COMMENT_NOTIFICATION = 'comment-notification',
}

// Base email data interface
interface BaseEmailData {
  to: string;
  name?: string;
}

// Password reset email data
interface PasswordResetEmailData extends BaseEmailData {
  resetUrl: string;
  expiresInHours?: number;
}

// Email verification data
interface EmailVerificationData extends BaseEmailData {
  verificationUrl: string;
}

// Trip invitation data
interface TripInvitationData extends BaseEmailData {
  inviterName: string;
  tripName: string;
  invitationUrl: string;
}

// Trip update data
interface TripUpdateData extends BaseEmailData {
  tripName: string;
  updateType: 'new_item' | 'itinerary_change' | 'member_joined';
  message: string;
  tripUrl: string;
}

// Comment notification data
interface CommentNotificationData extends BaseEmailData {
  commenterName: string;
  tripName: string;
  commentText: string;
  tripUrl: string;
}

// Suspicious login notification data
interface SuspiciousLoginData extends BaseEmailData {
  ipAddress: string;
  browser: string;
  location?: string;
  loginTime: string;
  supportEmail?: string;
}

/**
 * Email Service class for sending various types of emails
 */
export class EmailService {
  /**
   * Send a welcome email to new users
   */
  static async sendWelcomeEmail(data: BaseEmailData): Promise<boolean> {
    try {
      const welcomeTemplate = `
        <h1>Welcome to WithMe Travel!</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>Thank you for joining WithMe Travel. We're excited to help you plan your next adventure!</p>
        <p>Start exploring destinations and creating trips with friends.</p>
        <p>Happy travels!</p>
        <p>The WithMe Travel Team</p>
      `;

      await plunk.emails.send({
        to: data.to,
        subject: 'Welcome to WithMe Travel',
        body: welcomeTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    try {
      const resetTemplate = `
        <h1>Reset Your Password</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>You recently requested to reset your password for your WithMe Travel account.</p>
        <p>Please click the button below to reset your password:</p>
        <p><a href="${data.resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in ${data.expiresInHours || 24} hours.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>The WithMe Travel Team</p>
      `;

      await plunk.emails.send({
        to: data.to,
        subject: 'Reset Your WithMe Travel Password',
        body: resetTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(data: EmailVerificationData): Promise<boolean> {
    try {
      const verificationTemplate = `
        <h1>Verify Your Email</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>Thank you for signing up with WithMe Travel. Please verify your email address by clicking the button below:</p>
        <p><a href="${data.verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>If you did not create an account with WithMe Travel, please ignore this email.</p>
        <p>The WithMe Travel Team</p>
      `;

      await plunk.emails.send({
        to: data.to,
        subject: 'Verify Your Email - WithMe Travel',
        body: verificationTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send email verification:', error);
      return false;
    }
  }

  /**
   * Send trip invitation
   */
  static async sendTripInvitation(data: TripInvitationData): Promise<boolean> {
    try {
      const invitationTemplate = `
        <h1>You're Invited to a Trip!</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>${data.inviterName} has invited you to join "${data.tripName}" on WithMe Travel.</p>
        <p>Click the button below to view and accept this invitation:</p>
        <p><a href="${data.invitationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invitation</a></p>
        <p>We can't wait to help you plan this trip together!</p>
        <p>The WithMe Travel Team</p>
      `;

      await plunk.emails.send({
        to: data.to,
        subject: `${data.inviterName} invited you to "${data.tripName}" on WithMe Travel`,
        body: invitationTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send trip invitation:', error);
      return false;
    }
  }

  /**
   * Send trip update notification
   */
  static async sendTripUpdate(data: TripUpdateData): Promise<boolean> {
    try {
      let updateTitle = '';
      switch (data.updateType) {
        case 'new_item':
          updateTitle = 'New Item Added to Your Trip';
          break;
        case 'itinerary_change':
          updateTitle = 'Trip Itinerary Updated';
          break;
        case 'member_joined':
          updateTitle = 'New Member Joined Your Trip';
          break;
      }

      const updateTemplate = `
        <h1>${updateTitle}</h1>
        <p>Hello ${data.name || 'there'},</p>
        <p>There's been an update to your trip "${data.tripName}":</p>
        <p>${data.message}</p>
        <p>View the latest trip details here:</p>
        <p><a href="${data.tripUrl}" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Trip</a></p>
        <p>The WithMe Travel Team</p>
      `;

      await plunk.emails.send({
        to: data.to,
        subject: `${updateTitle} - ${data.tripName}`,
        body: updateTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send trip update notification:', error);
      return false;
    }
  }

  /**
   * Send comment notification
   */
  static async sendCommentNotification(data: CommentNotificationData): Promise<boolean> {
    try {
      const commentTemplate = `
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

      await plunk.emails.send({
        to: data.to,
        subject: `${data.commenterName} commented on "${data.tripName}"`,
        body: commentTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send comment notification:', error);
      return false;
    }
  }

  /**
   * Send suspicious login notification
   */
  static async sendSuspiciousLoginNotification(data: SuspiciousLoginData): Promise<boolean> {
    try {
      const supportEmail = data.supportEmail || 'support@withme.travel';
      const suspiciousTemplate = `
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
        <p>If this was you, you can ignore this email.</p>
        <p>If you didn't log in at this time, your account may have been compromised. Please change your password immediately and contact our support team.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password" style="display: inline-block; background-color: #4F46E5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Change Password</a></p>
        <p>For security assistance, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
        <p>The WithMe Travel Team</p>
      `;

      await plunk.emails.send({
        to: data.to,
        subject: 'Suspicious Login Activity Detected',
        body: suspiciousTemplate,
        type: 'html',
      });
      return true;
    } catch (error) {
      console.error('Failed to send suspicious login notification:', error);
      return false;
    }
  }

  /**
   * Generic method to send any type of email
   */
  static async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = true
  ): Promise<boolean> {
    try {
      await plunk.emails.send({
        to,
        subject,
        body,
        type: isHtml ? 'html' : 'markdown',
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}
