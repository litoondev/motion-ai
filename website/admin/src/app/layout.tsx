import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { getAuthToken } from "@/app/actions/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motion AI Admin",
  description: "Admin panel for Motion AI plugin system",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getAuthToken();

  return (
    <html lang="en">
      <body>
        <AuthProvider token={token}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
                fontSize: "var(--font-size-sm)",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-elevated)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
