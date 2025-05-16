import { ThemeProvider } from '@/components/theme-provider';
import { ClientSideProviders } from '@/components/client-side-providers';
import { ResearchProvider } from '@/components/research/ResearchProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <ResearchProvider>
        <ClientSideProviders>{children}</ClientSideProviders>
      </ResearchProvider>
    </ThemeProvider>
  );
} 