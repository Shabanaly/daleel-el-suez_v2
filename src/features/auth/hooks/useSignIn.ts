import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { login } from "@/features/auth/actions/auth.server";
import { LoginInput } from "../schemas/authSchemas";

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);

  const handleSignIn = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return { error: result.error };
      }
      
      // Force a full reload so the browser picks up the new session cookie
      window.location.href = "/";
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(message);
      setIsLoading(false);
      return { error: message };
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء الاتصال";
      setError(message);
      setSocialLoading(null);
    }
  };

  return {
    handleSignIn,
    handleSocialLogin,
    isLoading,
    error,
    socialLoading,
    setError,
  };
}
