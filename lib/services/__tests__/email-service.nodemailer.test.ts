/**
 * @jest-environment node
 *
 * Regression tests for GHSA-v53p-9fqp-m79j (Nodemailer addressparser quadratic
 * backtracking, fixed in 10.0.6). Nothing here talks to the network: every
 * transport is jsonTransport, which only serialises the message in memory.
 */
import nodemailer from 'nodemailer';
import addressparser from 'nodemailer/lib/addressparser';

// Keep the wrapper test off Resend and off real SMTP.
jest.mock('../resend', () => ({
  resend: { emails: { send: async () => ({ data: { id: 'unused' }, error: null }) } },
}));
jest.mock('nodemailer', () => {
  const actual = jest.requireActual('nodemailer');
  const real = actual.default ?? actual;
  const patched = {
    ...real,
    createTransport: () => real.createTransport({ jsonTransport: true }),
  };
  return { __esModule: true, ...patched, default: patched };
});

import { EmailService } from '../email-service';

// A free-text string with no "@": 7.0.3 needs about 6s for 40k characters.
const PATHOLOGICAL = 'x.'.repeat(20_000);
const BUDGET_MS = 1_000;

function timed<T>(fn: () => T): { value: T; ms: number } {
  const start = performance.now();
  const value = fn();
  return { value, ms: performance.now() - start };
}

describe('nodemailer address parsing', () => {
  it('parses normal addresses', () => {
    expect(addressparser('Ada <ada@example.com>, bob@example.org')).toEqual([
      { name: 'Ada', address: 'ada@example.com' },
      { name: '', address: 'bob@example.org' },
    ]);
  });

  it('parses free text that pathological input would be mistaken for in linear time', () => {
    const { ms } = timed(() => addressparser(PATHOLOGICAL));
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it.each([
    ['unclosed angle brackets', '<'.repeat(20_000)],
    ['unclosed quotes', '"'.repeat(20_000)],
    ['unclosed comments', '('.repeat(20_000)],
    ['at signs only', '@'.repeat(20_000)],
    ['dotted local part with no domain', 'a.'.repeat(20_000)],
  ])('does not hang on %s', (_label, input) => {
    const { value, ms } = timed(() => addressparser(input));
    expect(Array.isArray(value)).toBe(true);
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it('does not throw on empty or whitespace-only input', () => {
    expect(() => addressparser('')).not.toThrow();
    expect(() => addressparser('   ')).not.toThrow();
  });
});

describe('nodemailer jsonTransport send path', () => {
  const transport = nodemailer.createTransport({ jsonTransport: true });

  it('serialises a normal message', async () => {
    const info = await transport.sendMail({
      from: 'WithMe Travel <notifications@withme.travel>',
      to: 'ada@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
    });
    const message = JSON.parse(info.message);
    expect(message.to).toEqual([{ address: 'ada@example.com', name: '' }]);
    expect(message.subject).toBe('Hello');
  });

  it('finishes a send to a pathological recipient inside the budget', async () => {
    const start = performance.now();
    await transport.sendMail({
      from: 'notifications@withme.travel',
      to: PATHOLOGICAL,
      subject: 'x',
      text: 'x',
    });
    expect(performance.now() - start).toBeLessThan(BUDGET_MS);
  });
});

describe('EmailService.sendEmail (SMTP fallback, jsonTransport)', () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    process.env.SMTP_HOST = 'smtp.invalid';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it('sends a normal message and returns the serialised result', async () => {
    const result = await EmailService.sendEmail({
      to: 'ada@example.com',
      subject: 'Welcome',
      html: '<p>Hi</p>',
    });
    expect(result.success).toBe(true);
    const message = JSON.parse((result as { data: { message: string } }).data.message);
    expect(message.to).toEqual([{ address: 'ada@example.com', name: '' }]);
    expect(message.subject).toBe('Welcome');
  });

  it('does not hang on a pathological recipient', async () => {
    const start = performance.now();
    const result = await EmailService.sendEmail({
      to: PATHOLOGICAL,
      subject: 'x',
      html: '<p>x</p>',
    });
    expect(typeof result.success).toBe('boolean');
    expect(performance.now() - start).toBeLessThan(BUDGET_MS);
  });

  it('reports failure instead of throwing for a malformed recipient', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(
      EmailService.sendEmail({ to: '<<<"((@@', subject: 'x', html: '<p>x</p>' })
    ).resolves.toEqual(expect.objectContaining({ success: expect.any(Boolean) }));
  });
});
