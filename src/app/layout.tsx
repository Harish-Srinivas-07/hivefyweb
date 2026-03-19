import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Hivefy Web | Music Reimagined",
  description: "An open-source, ad-free, privacy-respecting music streaming platform.",
  applicationName: "Hivefy Web",
  authors: [{ name: "Harish-Srinivas-07", url: "https://github.com/Harish-Srinivas-07" }],
  keywords: ["music", "streaming", "jiosaavn", "ad-free", "hivefy"],
  icons: {
    icon: "/assets/icons/radio.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1ed760",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
