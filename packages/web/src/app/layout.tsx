import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { wagmiAdapter } from "../aa/wagmiConfig";
import { Web3Providers } from "../aa/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Just Swap It — AI-Powered Cross-Chain DEX",
  description:
    "Describe your swap in natural language. AI finds the best route, you just sign.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig,
    (await headers()).get("cookie"),
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Providers initialState={initialState}>{children}</Web3Providers>
      </body>
    </html>
  );
}
