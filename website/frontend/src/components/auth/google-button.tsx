"use client";
import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "@/lib/config";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

export const GOOGLE_ENABLED = Boolean(GOOGLE_CLIENT_ID);

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Could not load Google sign-in."));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/** Renders Google's official sign-in button. Renders nothing when no client id is configured. */
export function GoogleButton({
  text,
  onCredential,
  onError,
}: {
  text: "signin_with" | "signup_with" | "continue_with";
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cbRef = useRef({ onCredential, onError });

  useEffect(() => {
    cbRef.current = { onCredential, onError };
  });

  useEffect(() => {
    if (!GOOGLE_ENABLED || !ref.current) return;
    let cancelled = false;
    const el = ref.current;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => cbRef.current.onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: Math.min(el.offsetWidth || 352, 400),
        });
      })
      .catch((err: Error) => cbRef.current.onError?.(err.message));

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_ENABLED) return null;
  return <div ref={ref} className="w-full flex justify-center min-h-[44px]" />;
}
