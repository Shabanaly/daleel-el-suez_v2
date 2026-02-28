'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { login, signup } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogin = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
                return { error: result.error };
            }
            return { success: true };
        } catch (err: any) {
            if (err.message !== 'NEXT_REDIRECT') {
                setError('حدث خطأ غير متوقع');
                setLoading(false);
                return { error: 'Unexpected error' };
            }
        }
    };

    const handleSignup = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await signup(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
                return { error: result.error };
            }
            return { success: true };
        } catch (err: any) {
            if (err.message !== 'NEXT_REDIRECT') {
                setError('حدث خطأ غير متوقع');
                setLoading(false);
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
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الاتصال');
            setSocialLoading(null);
        }
    };

    return {
        user,
        loading,
        error,
        socialLoading,
        handleLogin,
        handleSignup,
        handleSocialLogin,
        setError
    };
}
