import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "AG Fresh Eggs — Fresh Eggs Delivered in Danapur",
  description:
    "Order fresh eggs online from AG Fresh Eggs by AG Enterprises. Fast hyperlocal delivery within 3 KM of Danapur Canteen, Patna.",
  applicationName: "AG Fresh Eggs",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "AG Fresh Eggs — Fresh Eggs Delivered in Danapur",
    description:
      "Farm-fresh eggs delivered to your doorstep within 3 KM of Danapur Canteen, Patna.",
    siteName: "AG Fresh Eggs",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2E7D32",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
