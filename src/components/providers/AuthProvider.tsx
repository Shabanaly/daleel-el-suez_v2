'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Force aggressive refresh function
    const refreshSession = useCallback(async () => {
        // We do NOT set isLoading(true) here because this runs in the background on window focus.
        // Doing so would unmount the entire React Component Tree and destroy all local states!
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                setSession(null);
                setUser(null);
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(user ?? null);
        } catch (error) {
            console.error("Error refreshing session:", error);
        }
    }, [supabase]);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // getUser is more reliable than getSession for checking actual validity
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    if (mounted) {
                        setSession(null);
                        setUser(null);
                    }
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    setSession(session);
                    setUser(user ?? null);
                }
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: string, newSession: Session | null) => {
                if (mounted) {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    setIsLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    // Auto-refresh when window regains focus (helps with redirect flows)
    useEffect(() => {
        const handleFocus = () => {
            // Only aggressively refresh if we think we might be in auth flow
            if (document.visibilityState === 'visible') {
                refreshSession();
            }
        };
        window.addEventListener('visibilitychange', handleFocus);
        return () => window.removeEventListener('visibilitychange', handleFocus);
    }, [refreshSession]);

    const logout = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

