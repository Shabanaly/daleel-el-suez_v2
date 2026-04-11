import { useState } from "react";
import { signup } from "@/features/auth/actions/auth.server";
import { SignupInput } from "../schemas/authSchemas";

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUp = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return { error: result.error };
      } else {
        setIsSuccess(true);
        setIsLoading(false);
        return { success: true };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(message);
      setIsLoading(false);
      return { error: message };
    }
  };

  return {
    handleSignUp,
    isLoading,
    error,
    isSuccess,
    setError,
  };
}
