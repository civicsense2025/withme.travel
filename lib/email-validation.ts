import { z } from 'zod';

/** RFC 5321 limit for a whole address; also keeps oversized input away from the mail parser. */
export const MAX_EMAIL_LENGTH = 254;

/** Most recipients accepted in a single invite request. */
export const MAX_INVITE_EMAILS = 50;

export const emailAddressSchema = z.string().email().max(MAX_EMAIL_LENGTH);

export const emailListSchema = z.array(emailAddressSchema).max(MAX_INVITE_EMAILS);
