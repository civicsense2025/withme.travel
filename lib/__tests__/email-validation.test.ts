/** @jest-environment node */
import {
  MAX_EMAIL_LENGTH,
  MAX_INVITE_EMAILS,
  emailAddress,
  emailAddressSchema,
  emailListSchema,
} from '../email-validation';

const addressOfLength = (n: number) => `${'a'.repeat(n - '@example.com'.length)}@example.com`;

describe('emailAddressSchema', () => {
  it('accepts a normal address', () => {
    expect(emailAddressSchema.safeParse('ada@example.com').success).toBe(true);
  });

  it('accepts an address exactly at the length cap', () => {
    const address = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
    expect(address.length).toBe(MAX_EMAIL_LENGTH);
    expect(emailAddressSchema.safeParse(address).success).toBe(true);
  });

  it('rejects an address one character over the cap', () => {
    const result = emailAddressSchema.safeParse(addressOfLength(MAX_EMAIL_LENGTH + 1));
    expect(result.success).toBe(false);
  });

  it('rejects very long free text quickly', () => {
    const start = performance.now();
    expect(emailAddressSchema.safeParse('x.'.repeat(20_000)).success).toBe(false);
    expect(performance.now() - start).toBeLessThan(1_000);
  });
});

describe('emailListSchema', () => {
  it('accepts up to the recipient cap', () => {
    const list = Array.from({ length: MAX_INVITE_EMAILS }, (_, i) => `user${i}@example.com`);
    expect(emailListSchema.safeParse(list).success).toBe(true);
  });

  it('rejects more than the recipient cap', () => {
    const list = Array.from({ length: MAX_INVITE_EMAILS + 1 }, (_, i) => `user${i}@example.com`);
    expect(emailListSchema.safeParse(list).success).toBe(false);
  });

  it('rejects a list holding one over-length address', () => {
    expect(emailListSchema.safeParse(['ada@example.com', addressOfLength(300)]).success).toBe(
      false
    );
  });
});

describe('emailAddress with a custom message', () => {
  it('reports only the custom message for a malformed address', () => {
    const result = emailAddress('Please enter a valid email address').safeParse('nope');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.message)).toEqual(['Please enter a valid email address']);
  });
});
