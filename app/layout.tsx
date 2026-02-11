import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "KILLER",
  description: "Personne n'est à l'abri. Le jeu du Killer entre amis.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KILLER",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-white min-h-dvh`}
      >
        {children}
      </body>
    </html>
  );
}
