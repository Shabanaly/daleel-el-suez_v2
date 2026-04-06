'use client';

import CustomLink from '@/components/customLink/customLink';
import { usePathname } from 'next/navigation';
import { User, Search, Store, Users, Map } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

import Image from 'next/image';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname?.startsWith('/admin');

  // Pages where we render the AppBar (Custom Native Header on Mobile)
  const isPlaceDetailsPage = pathname?.startsWith('/places/') && pathname.split('/').length === 3;
  const isPostDetailsPage = pathname?.startsWith('/community/posts/');
  const isMarketInside = pathname !== '/market' && pathname?.startsWith('/market');
  const isProfileSection = pathname?.startsWith('/profile');
  const isSettings = pathname?.startsWith('/settings');
  const isFavorites = pathname?.startsWith('/favorites');

  const hideMobileNavbar = isPlaceDetailsPage || isPostDetailsPage || isMarketInside || isProfileSection || isSettings || isFavorites;

  if (isAuthPage || isAdminPage) return null;

  return (
    <>
      {/* ───────── Mobile Navbar ───────── */}
      {!hideMobileNavbar && (
        <header className="lg:hidden fixed top-0 w-full h-14 z-50 bg-background border-b border-border-subtle flex justify-center">
        <div className="flex items-center justify-between w-full max-w-sm md:max-w-2xl lg:max-w-4xl h-full px-4">

          {/* Logo */}
          <CustomLink href="/" className="flex items-center gap-2">
            <Image 
              src="/favicon-circular.ico" 
              alt="Logo" 
              width={24} 
              height={24} 
              className="w-6 h-6 object-contain"
            />
            <span className="font-semibold text-base text-text-primary">
              دليل السويس
            </span>
          </CustomLink>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <CustomLink
                href={user ? "/profile" : "/login"}
                className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden border border-border-subtle hover:border-primary/50 transition-all bg-elevated"
              >
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <User className="w-5 h-5 text-text-muted" />
                )}
              </CustomLink>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* ───────── Desktop Navbar ───────── */}
      <nav className="hidden lg:flex fixed top-0 w-full h-16 z-50 bg-background border-b border-border-subtle">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8">

          {/* Logo */}
          <CustomLink href="/" className="flex items-center gap-2">
            <Image 
              src="/favicon-circular.ico" 
              alt="Logo" 
              width={28} 
              height={28} 
              className="w-7 h-7 object-contain"
            />
            <span className="font-semibold text-lg text-text-primary tracking-tight">
              دليل السويس
            </span>
          </CustomLink>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <NavLink href="/" active={pathname === '/'} label="الرئيسية" icon={<Map className="w-4 h-4" />} />
            <NavLink href="/places" active={pathname?.startsWith('/places')} label="الأماكن" icon={<Search className="w-4 h-4" />} />
            <NavLink href="/market" active={pathname?.startsWith('/market')} label="السوق" icon={<Store className="w-4 h-4" />} />
            <NavLink href="/community" active={pathname?.startsWith('/community')} label="المجتمع" icon={<Users className="w-4 h-4" />} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <CustomLink
                href={user ? "/profile" : "/login"}
                className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden border border-border-subtle hover:border-primary/50 transition-all bg-elevated"
              >
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <User className="w-5 h-5 text-text-muted" />
                )}
            </CustomLink>
          </div>

        </div>
      </nav>
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
  active
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <CustomLink
      href={href}
      className={`flex items-center gap-2 pb-1 text-sm font-medium transition
        ${active
          ? 'text-primary border-b-2 border-primary'
          : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'
        }`}
    >
      {icon}
      <span>{label}</span>
    </CustomLink>
  );
}