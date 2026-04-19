/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import { useState } from "react";
import { sendPasswordResetEmail, updatePassword } from "../actions/auth.server";
import { ForgotPasswordInput, ResetPasswordInput } from "../schemas/authSchemas";

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleForgotPassword = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      const result = await sendPasswordResetEmail(data.email);
      if (result.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      const result = await updatePassword(data.password);
      if (result.error) {
        setError(result.error);
        return { error: result.error };
      } else {
        setIsSuccess(true);
        return { success: true };
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
      return { error: "Unexpected error" };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleForgotPassword,
    handleUpdatePassword,
    isLoading,
    error,
    isSuccess,
  };
}
