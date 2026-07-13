import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Salt",
  description: "Site da Juventude da Primeira Igreja Batista em Lagoa Santa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} bg-background text-foreground flex flex-col min-h-screen font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
