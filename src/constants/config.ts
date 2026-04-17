export const APP_CONFIG = {
  NAME: "دليل السويس",
  NAME_EN: "Suez Guide",
  TAGLINE: "اكتشف مدينتك بكل تفاصيلها",
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || "https://daleel-al-suez.com",
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://daleel-al-suez.com",
  LOGO_PATH: "/favicon-circular.ico",
  OG_IMAGE: "/og-image.png",
  GOOGLE_ADS_CLIENT: "ca-pub-5152627364584775",
  GA_ID: "G-CYWJ3TSSFF",
  DESCRIPTION:
    "دليل السويس هو رفيقك الأول لاستكشاف محافظة السويس. اكتشف أفضل الأماكن، الخدمات، والمطاعم، وتابع نبض المدينة يومياً.",
  THEME_COLOR: "#0066FF",
  // Contact Info
  CONTACT_EMAIL: "daleel_suez@gmail.com",
  CONTACT_WHATSAPP: "+201019979315",
  CONTACT_WHATSAPP_URL: "https://wa.me/+201019979315",
  // Social Media
  FACEBOOK_URL: "https://www.facebook.com/daleel.al.suez",
  INSTAGRAM_URL: "https://www.instagram.com/daleel_al_suez/",
  // External Tools
  TOOLS_URL: "https://tools.daleel-al-suez.com",
} as const;
