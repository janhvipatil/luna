"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * App theme provider. Light is the default (professional, content-first); users
 * can switch to dark. next-themes toggles the `.dark` class on <html>.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
