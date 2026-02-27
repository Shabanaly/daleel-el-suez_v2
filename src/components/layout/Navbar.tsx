'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Bell, User, Search, Store, Users, Map, LogOut, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/lib/actions/auth';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isAuthPage) return null;
    return (
        <>
            {/* 📱 Mobile Top Header */}
            <header className="md:hidden fixed top-0 w-full h-14 z-50 glass-panel border-b border-border-subtle bg-base/80">
                <div className="flex items-center justify-between h-full px-4 w-full">
                    {/* Right: Logo */}
                    <Link href="/" className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xl text-text-primary tracking-tight">دليل السويس</span>
                        <MapPin className="w-4 h-4 text-accent" />
                    </Link>

                    {/* Left: Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-elevated/50 hover:bg-elevated transition-colors">
                            <Bell className="w-5 h-5 text-text-secondary" />
                        </button>
                        {user ? (
                            <button
                                onClick={() => logout()}
                                className="w-8 h-8 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        ) : (
                            <Link href="/login" className="w-8 h-8 rounded-full border border-accent/50 flex items-center justify-center text-text-secondary hover:bg-accent/10 transition-colors">
                                <User className="w-4 h-4 text-accent" />
                            </Link>
                        )}
                        <Link
                            href="/places/add"
                            className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/25 hover:rotate-90 transition-transform duration-500"
                        >
                            <MapPin className="w-5 h-5 fill-current" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* 💻 Desktop Full-Width Navbar */}
            <div className="hidden md:flex fixed top-0 w-full z-50">
                <nav className="glass-panel w-full h-16 flex items-center justify-between px-8 bg-base/80 border-b border-border-subtle shadow-md">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.5)]">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-text-primary tracking-tight group-hover:text-primary-500 transition-colors drop-shadow-[0_0_8px_rgba(8,145,178,0.3)]">
                            دليل السويس
                        </span>
                    </Link>

                    {/* Center Links */}
                    <div className="flex items-center gap-1">
                        <NavLink href="/" icon={<Map className="w-4 h-4" />} label="الرئيسية" active={pathname === '/'} />
                        <NavLink href="/places" icon={<Search className="w-4 h-4" />} label="الأماكن" active={pathname?.startsWith('/places')} />
                        <NavLink href="/market" icon={<Store className="w-4 h-4" />} label="السوق" active={pathname?.startsWith('/market')} />
                        <NavLink href="/community" icon={<Users className="w-4 h-4" />} label="المجتمع" active={pathname?.startsWith('/community')} />
                    </div>

                    {/* Left Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </nav>
            </div>
        </>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${active
                ? 'bg-primary-600/15 text-primary-500 shadow-[inset_0_0_0_1px_rgba(8,145,178,0.3)]'
                : 'text-text-muted hover:text-text-primary hover:bg-elevated/50'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
