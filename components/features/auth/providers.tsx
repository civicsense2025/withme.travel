"use client";

import React from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
// TODO: Verify these import paths are correct in your project structure
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SearchProvider } from "@/contexts/search-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnbordaProvider } from "onborda"

const queryClient = new QueryClient();

export function Providers({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  initialSession?: Session | null;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <OnbordaProvider>
          <SearchProvider>
            {children}
            <Toaster />
          </SearchProvider>
        </OnbordaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Providers;
