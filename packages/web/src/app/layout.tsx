import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "./components/Nav";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StellarSearch — Pay-Per-Query Web Search on Stellar",
  description: "A pay-per-query search dashboard and docs site for x402-powered web search on Stellar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-slate-950 font-sans text-white antialiased`}>
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
