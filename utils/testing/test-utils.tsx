import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes'; // If you are using a theme provider

// Add any providers that are commonly used in your app here
// This is just an example, adjust according to your actual providers
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withNextTheme?: boolean;
  // Add other provider options as needed
  // For example: withAuth?: boolean, withModal?: boolean, etc.
}

/**
 * Custom render function that includes common providers
 *
 * @param ui - The React component to render
 * @param options - Custom render options
 * @returns Rendered component with the utilities from @testing-library/react
 */
export function customRender(
  ui: ReactElement,
  {
    withNextTheme = false,
    // Add other provider defaults here
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Create a wrapper component that includes all providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    let wrappedChildren = children;

    // Wrap with theme provider if required
    if (withNextTheme) {
      wrappedChildren = (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {wrappedChildren}
        </ThemeProvider>
      );
    }

    // Wrap with other providers as needed
    // For example: Auth provider, Toast provider, etc.

    return <>{wrappedChildren}</>;
  };

  const utils = render(ui, { wrapper: AllTheProviders, ...renderOptions });

  return {
    ...utils,
    user: userEvent.setup(),
  };
}

// re-export everything from @testing-library/react
export * from '@testing-library/react';

// override render method
export { customRender as render };