export type AuthResult = {
  success?: boolean;
  error?: string;
  url?: string;
};

export type SocialProvider = "google" | "facebook";
