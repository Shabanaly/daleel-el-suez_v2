'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { login, signup, logout as logoutAction } from '@/lib/actions/auth';
import { useAuth as useAuthProvider } from '@/components/providers/AuthProvider';

export function useAuth() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthProvider();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
    const supabase = createClient();

    const handleLogin = async (formData: FormData) => {
        setActionLoading(true);
        setError(null);
        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
                setActionLoading(false);
                return { error: result.error };
            }
            
            window.location.href = '/';
            return { success: true };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.message !== 'NEXT_REDIRECT') {
                setError('حدث خطأ غير متوقع');
                setActionLoading(false);
                return { error: 'Unexpected error' };
            }
        }
    };

    const handleSignup = async (formData: FormData) => {
        setActionLoading(true);
        setError(null);
        try {
            const result = await signup(formData);
            if (result?.error) {
                setError(result.error);
                setActionLoading(false);
                return { error: result.error };
            }

            window.location.href = '/';
            return { success: true };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.message !== 'NEXT_REDIRECT') {
                setError('حدث خطأ غير متوقع');
                setActionLoading(false);
                return { error: 'Unexpected error' };
            }
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setSocialLoading(provider);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });
            if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الاتصال');
            setSocialLoading(null);
        }
    };

    const handleLogout = async () => {
        setActionLoading(true);
        try {
            await logoutAction();
            // Force a full page reload to clear all states and cache
            window.location.href = '/login?t=' + Date.now();
        } catch (err) {
            console.error('Logout error:', err);
            window.location.href = '/login';
        } finally {
            setActionLoading(false);
        }
    };

    return {
        user,
        loading: authLoading || actionLoading,
        error,
        socialLoading,
        handleLogin,
        handleSignup,
        handleSocialLogin,
        handleLogout,
        setError
    };
}
