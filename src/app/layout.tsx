import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JointHub Africa — Capstone AI Dashboard",
  description:
    "JointHub Africa Capstone II dashboard for opportunity matching, mentor assignment, dropout risk, and NLP goal analysis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const isPreviewEnvironment =
    process.env.NODE_ENV !== "development" &&
    (process.env.VERCEL_TARGET_ENV === "preview" || process.env.VERCEL_ENV === "preview");

  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <body className="min-h-screen">
        {isPreviewEnvironment ? (
          <Script src="https://app.cofounder.co/agentation/widget.js" strategy="afterInteractive" />
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
