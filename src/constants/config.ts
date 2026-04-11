export const APP_CONFIG = {
  NAME: "دليل السويس",
  NAME_EN: "Suez Guide",
  TAGLINE: "دليلك الشامل للأماكن والخدمات في السويس",
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || "https://daleel-al-suez.com",
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://daleel-al-suez.com",
  LOGO_PATH: "/favicon-circular.ico",
  OG_IMAGE: "/og-image.png",
  GOOGLE_ADS_CLIENT: "ca-pub-5152627364584775",
  GA_ID: "G-CYWJ3TSSFF",
  DESCRIPTION: "اكتشف أفضل الأماكن، الخدمات، والمطاعم في محافظة السويس. دليل السويس هو الرفيق الأول لأهل السويس لاستكشاف مدينتهم والحصول على أفضل العروض والخدمات الموثوقة.",
  THEME_COLOR: "#0066FF",
  // Contact Info
  CONTACT_EMAIL: "daleel_suez@gmail.com",
  CONTACT_WHATSAPP: "+201019979315",
  CONTACT_WHATSAPP_URL: "https://wa.me/+201019979315",
  // Social Media
  FACEBOOK_URL: "https://www.facebook.com/profile.php?id=61587358715645",
  // External Tools
  TOOLS_URL: "https://tools.daleel-al-suez.com",
} as const;
