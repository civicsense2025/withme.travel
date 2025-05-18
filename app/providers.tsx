import { ThemeProvider } from '@/components/theme-provider';
import { ClientSideProviders } from '@/components/client-side-providers';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <ClientSideProviders>{children}</ClientSideProviders>
    </ThemeProvider>
  );
}
