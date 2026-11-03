import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fixora — trusted home-repair booking",
    template: "%s · Fixora",
  },
  description:
    "Book home repairs with clear estimates, technician progress and support in one place. Fixora is a frontend demo running on fictional data.",
  applicationName: "Fixora",
  appleWebApp: {
    capable: true,
    title: "Fixora",
    statusBarStyle: "default",
  },
  icons: {
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#143779",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand focus:shadow-md"
        >
          Skip to content
        </a>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
