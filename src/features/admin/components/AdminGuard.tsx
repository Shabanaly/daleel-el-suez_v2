'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        const checkAdminStatus = async () => {
            const supabase = createClient();
            try {
                // Assuming there's a 'users' table or similar where the 'role' is stored
                // If the user role is stored in auth.users user_metadata, we check there first

                // Method 1: Check user_metadata first (if role is synced there)
                if (['admin', 'moderator'].includes(user?.user_metadata?.role)) {
                    setIsAuthorized(true);
                    return;
                }

                // Method 2: Check standard users table
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user role:', error);
                    router.replace('/');
                    return;
                }

                if (['admin', 'moderator'].includes(data?.role)) {
                    setIsAuthorized(true);
                } else {
                    router.replace('/');
                }
            } catch (err) {
                console.error('Admin verification failed:', err);
                router.replace('/');
            }
        };

        checkAdminStatus();
    }, [user, isLoading, router]);

    if (isLoading || isAuthorized === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-text-muted font-medium animate-pulse">جاري التحقق من الصلاحيات...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
