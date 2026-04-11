"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import CustomLink from "@/components/customLink/customLink";
import { forgotPasswordSchema, ForgotPasswordInput } from "../schemas/authSchemas";
import { usePasswordReset } from "../hooks/usePasswordReset";
import { AuthInput } from "./AuthInput";
import { AuthHeader } from "./AuthHeader";
import { AuthCard } from "./AuthCard";
import { AppBar } from "@/components/ui/AppBar";
import { ROUTES } from "@/constants";

export function ForgotPasswordForm() {
  const { handleForgotPassword, isLoading, error, isSuccess } = usePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await handleForgotPassword(data);
  };

  if (isSuccess) {
    return (
      <>
        <AppBar title="استعادة كلمة السر" transparent={true} />
        <AuthCard>
          <div className="flex flex-col items-center text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <AuthHeader
              title="تحقق من بريدك!"
              subtitle="لقد أرسلنا رابطاً لاستعادة كلمة السر إلى بريدك الإلكتروني"
            />
            <p className="text-sm text-text-muted max-w-[280px]">
              يرجى التحقق من بريدك الإلكتروني والضغط على الرابط المخصص لإعادة تعيين كلمة السر.
            </p>
            <CustomLink
              href={ROUTES.LOGIN}
              className="flex items-center gap-2 text-primary font-bold hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </CustomLink>
          </div>
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <AppBar title="استعادة كلمة السر" transparent={true} />
      <AuthCard>
        <AuthHeader
          title="نسيت كلمة السر؟"
          subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة حسابك"
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

          <button
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group mt-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
            <span>{isLoading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}</span>
          </button>
        </form>

        <div className="text-center pt-8 relative z-10">
          <CustomLink
            href={ROUTES.LOGIN}
            className="text-sm font-bold text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لتسجيل الدخول
          </CustomLink>
        </div>
      </AuthCard>
    </>
  );
}
