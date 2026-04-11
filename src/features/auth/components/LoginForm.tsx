"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import CustomLink from "@/components/customLink/customLink";
import { loginSchema, LoginInput } from "../schemas/authSchemas";
import { useSignIn } from "../hooks/useSignIn";
import { AuthInput } from "./AuthInput";
import { AuthHeader } from "./AuthHeader";
import { SocialButtons } from "./SocialButtons";
import { AuthCard } from "./AuthCard";
import { AppBar } from "@/components/ui/AppBar";
import { ROUTES, APP_CONFIG } from "@/constants";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { handleSignIn, handleSocialLogin, isLoading, error, socialLoading } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    await handleSignIn(data);
  };

  return (
    <>
      <AppBar title="تسجيل الدخول" transparent={true} />
      <AuthCard>
        <AuthHeader
        title="تسجيل الدخول"
        subtitle={`مرحباً بك مجدداً في ${APP_CONFIG.NAME}`}
      />

      <form className="w-full space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <AuthInput
          label="البريد الإلكتروني"
          register={register("email")}
          error={errors.email?.message}
          icon={Mail}
          placeholder="name@example.com"
          type="email"
        />

        <AuthInput
          label="كلمة المرور"
          register={register("password")}
          error={errors.password?.message}
          icon={Lock}
          placeholder="••••••••"
          type={showPassword ? "text" : "password"}
          innerAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-primary transition-all p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          action={
            <CustomLink
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
            >
              نسيت كلمة السر؟
            </CustomLink>
          }
        />

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 rounded border-border-subtle bg-background text-primary focus:ring-primary/20"
            />
            <span className="text-xs font-semibold text-text-muted">تذكرني</span>
          </label>
        </div>

        <button
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group mt-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          <span>{isLoading ? "جاري الدخول..." : "تسجيل الدخول"}</span>
        </button>
      </form>

      <SocialButtons
        onGoogleLogin={() => handleSocialLogin("google")}
        isLoading={isLoading}
        socialLoading={socialLoading}
      />

      <div className="text-center pt-8 relative z-10">
        <p className="text-sm font-medium text-text-muted">
          ليس لديك حساب بعد؟{" "}
          <CustomLink
            href={ROUTES.SIGNUP}
            className="text-primary hover:text-primary-hover font-bold transition-colors ml-1"
          >
            أنشئ حساباً
          </CustomLink>
        </p>
      </div>
    </AuthCard>
    </>
  );
}
