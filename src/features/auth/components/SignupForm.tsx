"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, UserPlus, Eye, EyeOff, Loader2, User, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import CustomLink from "@/components/customLink/customLink";
import { signupSchema, SignupInput } from "../schemas/authSchemas";
import { useSignUp } from "../hooks/useSignUp";
import { useSignIn } from "../hooks/useSignIn";
import { AuthInput } from "./AuthInput";
import { AuthHeader } from "./AuthHeader";
import { SocialButtons } from "./SocialButtons";
import { AuthCard } from "./AuthCard";
import { AppBar } from "@/components/ui/AppBar";
import { ROUTES, APP_CONFIG } from "@/constants";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { handleSignUp, isLoading, error, isSuccess } = useSignUp();
  const { handleSocialLogin, socialLoading, isLoading: isSignInLoading } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    await handleSignUp(data);
  };

  if (isSuccess) {
    return (
      <>
        <AppBar title="إنشاء حساب" transparent={true} />
        <AuthCard>
          <div className="flex flex-col items-center text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <AuthHeader
              title="تم إنشاء حسابك!"
              subtitle="يرجى تأكيد بريدك الإلكتروني لتفعيل الحساب"
            />
            <p className="text-sm text-text-muted max-w-[280px]">
              لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني. يرجى الضغط عليه لتتمكن من تسجيل الدخول.
            </p>
            <CustomLink
              href={ROUTES.LOGIN}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              انتقل لتسجيل الدخول
            </CustomLink>
          </div>
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <AppBar title="إنشاء حساب" transparent={true} />
      <AuthCard>
        <AuthHeader
          title="إنشاء حساب جديد"
          subtitle={`انضم إلى مجتمع مستكشفي ${APP_CONFIG.NAME}`}
        />

        <form className="w-full space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

        <AuthInput
          label="الاسم بالكامل"
          register={register("full_name")}
          error={errors.full_name?.message}
          icon={User}
          placeholder="اكتب اسمك"
        />

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
        />

        <button
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group mt-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
          <span>{isLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}</span>
        </button>
      </form>

      <SocialButtons
        onGoogleLogin={() => handleSocialLogin("google")}
        isLoading={isLoading || isSignInLoading}
        socialLoading={socialLoading}
      />

      <div className="text-center pt-8 relative z-10">
        <p className="text-sm font-medium text-text-muted">
          لديك حساب بالفعل؟{" "}
          <CustomLink
            href={ROUTES.LOGIN}
            className="text-primary hover:text-primary-hover font-bold transition-colors ml-1"
          >
            سجل دخولك
          </CustomLink>
        </p>
      </div>
    </AuthCard>
    </>
  );
}
