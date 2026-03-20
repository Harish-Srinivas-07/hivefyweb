import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "Hivefy | Premium Ad-Free Music Streaming",
    template: "%s | Hivefy"
  },
  description: "A high-performance, open-source, and privacy-focused music streaming platform inspired by Spotify. Stream millions of songs ad-free.",
  applicationName: "Hivefy",
  authors: [{ name: "Harish Srinivas", url: "https://harishsrinivas.netlify.app" }],
  generator: "Next.js",
  keywords: ["music streaming", "ad-free music", "foss music app", "jiosaavn api", "hivefy", "spotify clone", "open source music", "hivefy music app", "hivefy music player", "hivefy music player app", "hivefy music player app download"],
  referrer: "origin-when-cross-origin",
  creator: "Harish Srinivas",
  publisher: "Harish Srinivas",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://hivefyweb.vercel.app"), 
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hivefy | Premium Ad-Free Music Streaming",
    description: "Stream your favorite music ad-free on Hivefy. A beautiful, open-source, and privacy-respecting music player.",
    url: "https://hivefyweb.vercel.app",
    siteName: "Hivefy",
    images: [
      {
        url: "/assets/icons/logo.png", 
        width: 512,
        height: 512,
        alt: "Hivefy Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hivefy | Premium Ad-Free Music Streaming",
    description: "The ultimate open-source music streaming experience. No ads. Just pure music.",
    creator: "@HarishSrinivas", 
    images: ["/assets/icons/logo.png"],
  },
  icons: {
    icon: "/assets/icons/logo.png",
    shortcut: "/assets/icons/logo.png",
    apple: "/assets/icons/logo.png",
  },
  manifest: "/manifest.json", 
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#1ed760",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional custom meta tags can go here */}
      </head>
      <body className="antialiased selection:bg-primary selection:text-black">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
