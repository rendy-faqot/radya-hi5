import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radya Hi5 - Recognition & Appreciation",
  description: "Spread positivity and recognize amazing work with Radya Hi5. A modern team recognition system.",
  keywords: ["Radya Hi5", "recognition", "appreciation", "kudos", "team", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  authors: [{ name: "Radya Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Radya Hi5 - Team Recognition",
    description: "Spread positivity and recognize amazing work",
    url: "https://highfive.radyalabs.com",
    siteName: "Radya Hi5",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radya Hi5 - Team Recognition",
    description: "Spread positivity and recognize amazing work",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
