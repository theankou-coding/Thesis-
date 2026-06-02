import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";

export const metadata: Metadata = {
  title: "JOB CV",
  description: "Professional CV builder and AI job matching platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
