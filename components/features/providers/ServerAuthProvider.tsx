'use server';

export function ServerAuthProvider({ children }: { children: React.ReactNode }) {
  // This is a server component, so we can't use hooks
  // In a real implementation, this would check the auth state and provide it to children
  return <>{children}</>;
} 