import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { PRODUCT_NAME } from "@/components/site/brand";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: "Comparez vos réponses aux votes des groupes parlementaires de l'Assemblée nationale.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
