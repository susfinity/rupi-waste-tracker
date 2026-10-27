import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saahas Waste Tracker | ತ್ಯಾಜ್ಯ ರೆಕಾರ್ಡರ್",
  description: "Daily field waste recorder for Saahas on-field workers and coordinators",
  applicationName: "Saahas Waste Tracker",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4C9F38",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9F5] text-[#192613] selection:bg-[#D8EDB9]">
        {children}
      </body>
    </html>
  );
}
