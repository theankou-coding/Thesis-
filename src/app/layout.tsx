import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientProviders } from "./providers";

const themeInitScript = `
(() => {
  try {
    const theme = localStorage.getItem("theme");
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  } catch {
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export const metadata: Metadata = {
  title: "JOB CV",
  description: "Professional CV builder and AI job matching platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
