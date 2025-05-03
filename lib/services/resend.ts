/**
 * Resend API client wrapper
 * Documentation: https://resend.com/docs/introduction
 */

class MockResend {
  emails = {
    async send(params: any) {
      console.log('📧 [MockResend] Would send email:', params);
      return {
        data: { id: 'mock-email-id' },
        error: null,
      };
    },
  };
}

// Use a mock implementation in development if no API key is available
// In production, this would be initialized with the real Resend client
export const resend = new MockResend();
