import { LucideIcon } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";

interface AuthInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  icon: LucideIcon;
  error?: string;
  register: UseFormRegisterReturn;
  action?: React.ReactNode;
  innerAction?: React.ReactNode;
}

export function AuthInput({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  error,
  register,
  action,
  innerAction,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-semibold text-text-secondary block">
          {label}
        </label>
        {action}
      </div>
      <div className="relative group/input">
        <input
          {...register}
          type={type}
          placeholder={placeholder}
          className={`w-full h-12 pr-12 ${innerAction ? 'pl-12' : 'pl-4'} rounded-xl bg-background/50 border ${
            error ? "border-error" : "border-border-subtle"
          } text-text-primary font-medium placeholder:text-text-muted transition-all outline-hidden text-base focus:border-primary/60 focus:ring-4 focus:ring-primary/10`}
        />
        <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
          error ? "text-error" : "text-text-muted group-focus-within/input:text-primary"
        }`} />
        
        {innerAction && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {innerAction}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-bold text-error mr-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
