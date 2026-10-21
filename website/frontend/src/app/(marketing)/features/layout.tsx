import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features – Motion AI",
  description: "18 tools built for motion designers inside After Effects: easing curves, AI keyframes, Lottie import, auto captions, background removal, and more.",
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
