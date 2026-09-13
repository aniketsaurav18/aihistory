import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "AI History — A visual history of modern AI",
  description:
    "Explore 437 defining moments in artificial intelligence, from the Transformer to the frontier-model era.",
  metadataBase: new URL("https://aihistory.live"),
  openGraph: {
    title: "AI History — A visual history of modern AI",
    description:
      "A sourced, searchable field guide to the decade that remade intelligence.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI History — A visual history of modern AI",
    description:
      "A sourced, searchable field guide to the decade that remade intelligence.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
