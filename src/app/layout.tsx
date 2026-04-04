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
import { AuthModalProvider } from "@/features/auth/hooks/useAuthModal";
import { GoogleOneTap } from "@/features/auth/components/GoogleOneTap";
import { DialogProvider } from "@/components/providers/DialogProvider";
import { CommentsProvider } from "@/features/community/providers/CommentsProvider";
import { NotificationProvider } from "@/features/notifications/components/NotificationProvider";
import { ToastProvider } from "@/features/notifications/components/ToastProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import CookieConsent from "@/components/common/CookieConsent";
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

import { Suspense } from "react";
import MainContentWrapper from "@/components/layout/MainContentWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com'),
  title: {
    default: "دليل السويس | Suez Guide - دليلك الشامل",
    template: "%s | دليل السويس"
  },
  description: "اكتشف أفضل الأماكن، الخدمات، والمطاعم في محافظة السويس. دليل السويس هو الرفيق الأول لأهل السويس لاستكشاف مدينتهم والحصول على أفضل العروض والخدمات الموثوقة.",
  keywords: [
    "السويس", "دليل السويس", "سوق السويس", "أماكن السويس", "خدمات السويس", "عقارات السويس", 
    "وظائف السويس", "مطاعم السويس", "عيادات السويس", "بيع وشراء السويس", "مستعمل السويس", 
    "اعلانات السويس", "أخبار السويس", "مجتمع السويس", "محلات السويس", "خدمات حكومية السويس",
    "دليل ارقام تليفونات السويس", "افضل مطاعم السويس", "افضل اطباء السويس", "سويسي", "مدن القناة",
    "بورتوفيق", "الاربعين", "فيصل السويس", "حتا السويس", "الكبريت", "العين السخنة"
  ],
  authors: [{ name: "دليل السويس" }],
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
    siteName: "دليل السويس - Suez Guide",
    title: "دليل السويس | Suez Guide - دليلك الشامل",
    description: "كل ما تحتاجه في السويس في مكان واحد - أماكن، خدمات، وسوق تجاري متكامل.",
    locale: "ar_EG",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "دليل السويس - Suez Guide"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "دليل السويس | Suez Guide",
    description: "دليلك الشامل للأماكن والخدمات في السويس",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-circular.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents auto-zooming or accidental desktop-view scaling on iOS/Android
  themeColor: "#0066FF",
  interactiveWidget: "resizes-content",
};

import JsonLd from "@/components/seo/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased font-sans min-h-screen pb-28 lg:pb-0`}
        suppressHydrationWarning
      >
        {/* Raw scripts instead of next/script due to AdSense disliking data-nscript */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152627364584775" crossOrigin="anonymous"></script>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <JsonLd />
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>
                <Suspense fallback={null}>
                  <LoadingScreen />
                </Suspense>
                <PWAInstallPrompt />
                <CookieConsent />
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
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
