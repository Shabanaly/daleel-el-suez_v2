"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import CustomLink from "@/components/customLink/customLink";
import { resetPasswordSchema, ResetPasswordInput } from "../schemas/authSchemas";
import { usePasswordReset } from "../hooks/usePasswordReset";
import { AuthInput } from "./AuthInput";
import { AuthHeader } from "./AuthHeader";
import { AuthCard } from "./AuthCard";
import { AppBar } from "@/components/ui/AppBar";
import { ROUTES } from "@/constants";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { handleUpdatePassword, isLoading, error, isSuccess } = usePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    await handleUpdatePassword(data);
  };

  if (isSuccess) {
    return (
      <>
        <AppBar title="تعيين كلمة السر" transparent={true} />
        <AuthCard>
          <div className="flex flex-col items-center text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <AuthHeader
              title="تَم التحديث بنجاح!"
              subtitle="يمكنك الآن تسجيل الدخول بكلمة السر الجديدة"
            />
            <CustomLink
              href={ROUTES.LOGIN}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              تسجيل الدخول الآن
            </CustomLink>
          </div>
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <AppBar title="تعيين كلمة السر" transparent={true} />
      <AuthCard>
        <AuthHeader
          title="تعيين كلمة سر جديدة"
          subtitle="أدخل كلمة السر الجديدة لحماية حسابك"
        />

        <form className="w-full space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <AuthInput
            label="كلمة المرور الجديدة"
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

          <AuthInput
            label="تأكيد كلمة المرور"
            register={register("confirmPassword")}
            error={errors.confirmPassword?.message}
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
              <Lock className="w-5 h-5" />
            )}
            <span>{isLoading ? "جاري التحديث..." : "حفظ كلمة السر"}</span>
          </button>
        </form>
      </AuthCard>
    </>
  );
}
