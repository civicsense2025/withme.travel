import '@sentry/nextjs';

declare module '@sentry/nextjs' {
  namespace Sentry {
    /**
     * Start a new transaction for tracking.
     * 
     * @param options Transaction options including name, op, and data
     * @returns The created transaction object
     */
    function startTransaction(options: {
      name: string;
      op?: string;
      data?: Record<string, any>;
      tags?: Record<string, string>;
      sampled?: boolean;
    }): {
      setStatus: (status: string) => void;
      setTag: (key: string, value: string) => void;
      setData: (key: string, value: any) => void;
      finish: () => void;
    };
  }
}