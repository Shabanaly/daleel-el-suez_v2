import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { DialogProvider } from "@/components/providers/DialogProvider";
import { CommentsProvider } from "@/components/providers/CommentsProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import MainContentWrapper from "@/components/layout/MainContentWrapper";

export const metadata: Metadata = {
  title: {
    default: "دليل السويس | Suez Guide - دليلك الشامل",
    template: "%s | دليل السويس"
  },
  description: "اكتشف أفضل الأماكن، الخدمات، والمطاعم في محافظة السويس. دليل السويس هو رفيقك الموثوق لاستكشاف المدينة.",
  keywords: ["السويس", "دليل السويس", "أماكن في السويس", "خدمات السويس", "عقارات السويس", "وظائف السويس", "مطاعم السويس"],
  authors: [{ name: "Suez Guide Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "دليل السويس",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "دليل السويس",
    title: "دليل السويس | Suez Guide",
    description: "كل مكان في السويس في مكان واحد - دليل شامل للخدمات والأماكن",
    locale: "ar_EG",
  },
  twitter: {
    card: "summary_large_image",
    title: "دليل السويس | Suez Guide",
    description: "دليلك الشامل للأماكن والخدمات في السويس",
  },
  icons: {
    icon: "/favicon-circular.ico?v=5",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0066FF",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';


  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://daleel-al-suez.com/#website",
        "url": "https://daleel-al-suez.com",
        "name": "دليل السويس",
        "description": "اكتشف أفضل الأماكن، الخدمات، والمطاعم في محافظة السويس.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://daleel-al-suez.com/places?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://daleel-al-suez.com/#organization",
        "url": "https://daleel-al-suez.com",
        "name": "دليل السويس",
        "logo": "https://daleel-al-suez.com/icon.png"
      }
    ]
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CYWJ3TSSFF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-CYWJ3TSSFF');
          `}
        </Script>
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased font-sans min-h-screen pb-28 lg:pb-0`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {googleClientId && <GoogleOneTap clientId={googleClientId} />}
            <AuthModalProvider>
              <DialogProvider>
                <CommentsProvider>
                  <Navbar />
                  <DesktopSidebar />
                  <LeftSidebar />
                  <MainContentWrapper>
                    {children}
                    {/* Show Footer only on desktop, balanced between sidebars */}
                    <div className="hidden lg:block">
                      <Footer />
                    </div>
                  </MainContentWrapper>

                  <BottomNav />
                  <Analytics />
                  <SpeedInsights />
                </CommentsProvider>
              </DialogProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
