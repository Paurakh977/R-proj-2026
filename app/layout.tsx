import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  DM_Mono,
  Dancing_Script,
} from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
  weight: ["300", "400", "500"],
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TrendSeer — AI-Powered Fashion Intelligence",
  description:
    "Explore fashion trends through intelligent, gender-inclusive prediction. Discover what's rising, fading, or trending in the world of style.",
  keywords:
    "fashion trends, AI prediction, style forecast, gender-inclusive fashion, trend intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${dancing.variable}`}
    >
      <body className="font-body antialiased overflow-x-hidden page-bg min-h-screen">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}