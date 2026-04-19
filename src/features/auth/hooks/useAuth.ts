"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout as logoutAction } from "@/features/auth/actions/auth.server";
import { useAuth as useAuthProvider } from "@/components/providers/AuthProvider";
import { useSignIn } from "./useSignIn";
import { useSignUp } from "./useSignUp";

/**
 * Shared Auth Hook
 * This hook provides a unified interface for auth state and actions across the app.
 * It remains compatible with existing components while using the new refactored hooks internally.
 */
export function useAuth() {
  const { user, isLoading: authLoading } = useAuthProvider();
  const [actionLoading, setActionLoading] = useState(false);

  // New specialized hooks for potential use
  const signIn = useSignIn();
  const signUp = useSignUp();

  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await logoutAction();
      window.location.href = "/login?t=" + Date.now();
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    } finally {
      setActionLoading(false);
    }
  };

  return {
    // State
    user,
    loading:
      authLoading || actionLoading || signIn.isLoading || signUp.isLoading,
    error: signIn.error || signUp.error,
    socialLoading: signIn.socialLoading,

    // Actions
    handleLogin: signIn.handleSignIn,
    handleSignup: signUp.handleSignUp,
    handleSocialLogin: signIn.handleSocialLogin,
    handleLogout,

    // Utils
    setError: signIn.setError,
  };
}
