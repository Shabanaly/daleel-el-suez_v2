import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import Footer from "@/components/layout/Footer";
import { AdsenseScript } from "@/components/common/AdsenseScript";
import { Banner728x90 } from "@/components/common/ThirdPartyAds";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/features/auth/hooks/useAuthModal";
import { GoogleOneTap } from "@/features/auth/components/GoogleOneTap";
import { GoogleIdScript } from "@/features/auth/components/GoogleIdScript";
import { DialogProvider } from "@/components/providers/DialogProvider";
import { CommentsProvider } from "@/features/community/providers/CommentsProvider";
import { NotificationProvider } from "@/features/notifications/components/NotificationProvider";
import { ToastProvider } from "@/features/notifications/components/ToastProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import CookieConsent from "@/components/common/CookieConsent";
import { APP_CONFIG, ROUTES } from "@/constants";
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
  metadataBase: new URL(APP_CONFIG.BASE_URL),
  title: {
    default: `${APP_CONFIG.NAME} | ${APP_CONFIG.TAGLINE}`,
    template: `%s | ${APP_CONFIG.NAME}`
  },
  description: APP_CONFIG.DESCRIPTION,
  keywords: [
    "السويس", "دليل السويس", "سوق السويس", "أماكن السويس", "خدمات السويس", "عقارات السويس", 
    "وظائف السويس", "مطاعم السويس", "عيادات السويس", "بيع وشراء السويس", "مستعمل السويس", 
    "اعلانات السويس", "أخبار السويس", "مجتمع السويس", "محلات السويس", "خدمات حكومية السويس",
    "دليل ارقام تليفونات السويس", "افضل مطاعم السويس", "افضل اطباء السويس", "سويسي", "مدن القناة",
    "بورتوفيق", "الاربعين", "فيصل السويس", "حتا السويس", "الكبريت", "العين السخنة"
  ],
  authors: [{ name: APP_CONFIG.NAME }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_CONFIG.NAME,
    title: `${APP_CONFIG.NAME} | ${APP_CONFIG.TAGLINE}`,
    description: APP_CONFIG.DESCRIPTION,
    locale: "ar_EG",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: APP_CONFIG.NAME
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.NAME} | ${APP_CONFIG.TAGLINE}`,
    description: APP_CONFIG.DESCRIPTION,
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
  other: {
    monetag: "ffdd26cc5e52c318066f057b9558dc99",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents auto-zooming or accidental desktop-view scaling on iOS/Android
  themeColor: APP_CONFIG.THEME_COLOR,
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
        {/* Third-party Scripts (Delayed) */}
        <AdsenseScript />
        
        <GoogleIdScript />
        
        <JsonLd />
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${APP_CONFIG.GA_ID}', {
              page_path: window.location.pathname,
            });
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
                        <div className="pt-14 lg:pt-16 px-4">
                          <Banner728x90 />
                        </div>
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
