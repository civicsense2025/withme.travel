/**
 * @jest-environment node
 *
 * Route-level checks for the email input rules: the length caps are wired into the
 * invite and forgot-password handlers, and an invite list is de-duplicated and
 * compared to existing invitations case-insensitively. Supabase, rate limiting and
 * mail are all mocked; nothing here touches the network or sends email.
 */
import { NextRequest } from 'next/server';

const mockInsertSpy = jest.fn();
const mockExistingLookups: string[][] = [];
let mockExistingRows: { email: string }[] = [];
const mockForgotPassword = jest.fn();

jest.mock('@/utils/supabase/server', () => ({
  createRouteHandlerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
    from: (table: string) => {
      if (table === 'trip_members') {
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ single: async () => ({ data: { role: 'admin' }, error: null }) }) }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            in: async (_column: string, values: string[]) => {
              mockExistingLookups.push(values);
              return { data: mockExistingRows, error: null };
            },
          }),
        }),
        insert: (rows: unknown[]) => {
          mockInsertSpy(rows);
          return { select: async () => ({ data: rows, error: null }) };
        },
      };
    },
  }),
}));
jest.mock('@/lib/trip-access', () => ({ checkTripAccess: jest.fn() }));
jest.mock('@/lib/api/auth', () => ({ forgotPassword: (...args: unknown[]) => mockForgotPassword(...args) }));
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: { apply: (_request: unknown, _key: string, handler: () => Promise<unknown>) => handler() },
}));
jest.mock('@/lib/services/email-service', () => ({ EmailService: {} }));
jest.mock('@/app/lib/plunk', () => ({ __esModule: true, default: { events: { track: jest.fn() } } }));

import { POST as invite } from '@/app/api/trips/[tripId]/members/invite/route';
import { POST as forgot } from '@/app/api/auth/forgot-password/route';

const post = (body: unknown) =>
  new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify(body) });
const inviteTo = (emails: string[]) => invite(post({ emails }), { params: { tripId: 'trip-1' } });
const longAddress = (length: number) => `${'a'.repeat(length - '@example.com'.length)}@example.com`;

beforeEach(() => {
  mockInsertSpy.mockClear();
  mockForgotPassword.mockReset();
  mockExistingLookups.length = 0;
  mockExistingRows = [];
});

describe('invite route', () => {
  it('rejects more than 50 addresses before touching the database', async () => {
    const emails = Array.from({ length: 51 }, (_, i) => `user${i}@example.com`);
    const response = await inviteTo(emails);
    expect(response.status).toBe(400);
    expect(mockExistingLookups).toHaveLength(0);
    expect(mockInsertSpy).not.toHaveBeenCalled();
  });

  it('rejects an over-length address', async () => {
    const response = await inviteTo(['ada@example.com', longAddress(300)]);
    expect(response.status).toBe(400);
    expect(mockInsertSpy).not.toHaveBeenCalled();
  });

  it('creates one invitation per address, ignoring repeats and case variants', async () => {
    const response = await inviteTo(['Ada@Example.com', 'ada@example.com', 'bob@example.com', 'ADA@EXAMPLE.COM']);
    expect(response.status).toBe(200);
    const rows = mockInsertSpy.mock.calls[0][0] as { email: string }[];
    expect(rows.map((row) => row.email)).toEqual(['Ada@Example.com', 'bob@example.com']);
    const body = await response.json();
    expect(body.message).toBe('Created 2 invitation(s)');
  });

  it('skips an address whose invitation exists in a different case', async () => {
    mockExistingRows = [{ email: 'bob@example.com' }];
    const response = await inviteTo(['BOB@example.com', 'cy@example.com']);
    expect(response.status).toBe(200);
    const rows = mockInsertSpy.mock.calls[0][0] as { email: string }[];
    expect(rows.map((row) => row.email)).toEqual(['cy@example.com']);
    // The existing-row lookup asks for both the original and the lower-case spelling.
    expect(mockExistingLookups[0]).toEqual(expect.arrayContaining(['BOB@example.com', 'bob@example.com']));
  });
});

describe('forgot-password route', () => {
  it('answers 400 with the custom message for a malformed address', async () => {
    const response = await forgot(post({ email: 'nope' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.details.map((issue: { message: string }) => issue.message)).toEqual([
      'Please enter a valid email address',
    ]);
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it('rejects an over-length address before calling the auth API', async () => {
    const response = await forgot(post({ email: longAddress(300) }));
    expect(response.status).toBe(400);
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });
});
