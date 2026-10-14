import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Motion AI – After Effects Plugin",
  description: "Professional motion design AI plugin for After Effects. Automate animations, generate keyframes, and create stunning motion graphics.",
  keywords: ["After Effects", "plugin", "motion design", "AI", "animation"],
  openGraph: {
    title: "Motion AI – After Effects Plugin",
    description: "Professional motion design AI plugin for After Effects.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-elevated)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: "var(--color-success)", secondary: "var(--color-success-bg)" } },
            error:   { iconTheme: { primary: "var(--color-error)",   secondary: "var(--color-error-bg)"   } },
          }}
        />
      </body>
    </html>
  );
}
