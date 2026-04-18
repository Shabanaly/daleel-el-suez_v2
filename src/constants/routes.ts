export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  AUTH_CALLBACK: "/auth/callback",

  // Admin
  ADMIN: "/admin",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_PLACES: "/admin/places",
  ADMIN_USERS: "/admin/users",
  ADMIN_MARKET: "/admin/market",
  ADMIN_COMMUNITY: "/admin/community",
  ADMIN_BLOG: "/admin/blog",

  // Profile
  PROFILE: "/profile",
  PROFILE_NOTIFICATIONS: "/profile/notifications",
  PROFILE_ACTIVITIES: "/profile/activities",

  // Settings
  SETTINGS: "/settings",

  // Content
  FAVORITES: "/favorites",
  PLACES: "/places",
  PLACES_ADD: "/places/add",

  // Market
  MARKET: "/market",
  MARKET_CREATE: "/market/create",
  MARKET_MY_ADS: "/market/my-ads",
  MARKET_CATEGORIES: "/market/categories",
  MARKET_EDIT: "/market/edit",

  // Manage (Business Dashboard)
  MANAGE: "/manage",

  // Community & Social
  COMMUNITY: "/community",
  BLOG: "/blog",
  BEST: "/best",
  CATEGORIES: "/categories",
  ABOUT: "/about",

  // Legal
  TERMS: "/terms",
  PRIVACY: "/privacy",
  COPYRIGHT: "/copyright",
} as const;

/** Helper functions for dynamic routes */
export const ROUTE_HELPERS = {
  PLACE: (slug: string) => `/places/${encodeURIComponent(slug)}`,
  PLACE_EDIT: (slug: string) => `/places/${encodeURIComponent(slug)}/edit`,
  MARKET_AD: (slug: string) => `/market/${encodeURIComponent(slug)}`,
  MARKET_AD_EDIT: (id: string) => `/market/edit/${encodeURIComponent(id)}`,
  COMMUNITY_POST: (id: string) => `/community/posts/${encodeURIComponent(id)}`,
  BLOG_POST: (slug: string) => `/blog/${encodeURIComponent(slug)}`,
  MANAGE_PLACE: (id: string) => `/manage/${encodeURIComponent(id)}`,
  BEST_CATEGORY: (slug: string) => `/best/${encodeURIComponent(slug)}`,
  PLACES_CATEGORY: (name: string) =>
    `/places?category=${encodeURIComponent(name)}`,
  PLACES_DISTRICT: (name: string) =>
    `/places?district=${encodeURIComponent(name)}`,
  MARKET_CATEGORY: (slug: string) =>
    `/market?category=${encodeURIComponent(slug)}`,
  PLACES_SORT: (sort: string) => `/places?sort=${encodeURIComponent(sort)}`,
} as const;

export const AUTH_ROUTES: string[] = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];
