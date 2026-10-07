import { z } from 'zod';

/** RFC 5321 limit for a whole address; also keeps oversized input away from the mail parser. */
export const MAX_EMAIL_LENGTH = 254;

/** Most recipients accepted in a single invite request. */
export const MAX_INVITE_EMAILS = 50;

/** One address. Pass a message to replace the default email error; the email check is added once. */
export const emailAddress = (message?: string) => z.string().email(message).max(MAX_EMAIL_LENGTH);

export const emailAddressSchema = emailAddress();

export const emailListSchema = z.array(emailAddressSchema).max(MAX_INVITE_EMAILS);
