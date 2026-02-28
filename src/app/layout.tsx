import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
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

  title: "دليل السويس | Suez Guide",
  description: "دليلك الشامل للأماكن والخدمات في السويس - كل مكان في السويس في مكان واحد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';


  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased font-sans min-h-screen pb-[72px] xl:pb-0`}
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
                <Navbar />
                <DesktopSidebar />
                <LeftSidebar />
                <MainContentWrapper>
                  {children}
                  {/* Show Footer only on desktop, balanced between sidebars */}
                  <div className="hidden xl:block">
                    <Footer />
                  </div>
                </MainContentWrapper>

                <BottomNav />
              </DialogProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
