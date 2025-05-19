import { ThemeProvider } from '@/components/ui/theme-provider';
import { ClientSideProviders } from '@/components/features/layout/organisms/ClientSideProviders';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <ClientSideProviders>{children}</ClientSideProviders>
    </ThemeProvider>
  );
}
