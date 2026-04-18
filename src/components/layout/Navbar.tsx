"use client";

import { ROUTES, AUTH_ROUTES, APP_CONFIG } from "@/constants";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  User,
  Map as MapIcon,
  Search,
  Store,
  Users,
  FileText,
} from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import CustomLink from "@/components/customLink/customLink";
import { ThemeToggle } from "../ui/ThemeToggle";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const isAdminPage = pathname?.startsWith(ROUTES.ADMIN);

  // Pages where we render the AppBar (Custom Native Header on Mobile)
  const isPlaceDetailsPage =
    pathname?.startsWith(ROUTES.PLACES + "/") &&
    pathname.split("/").length === 3;
  const isPostDetailsPage = pathname?.startsWith(ROUTES.COMMUNITY + "/posts/");
  const isMarketInside =
    pathname !== ROUTES.MARKET && pathname?.startsWith(ROUTES.MARKET);
  const isProfileSection = pathname?.startsWith(ROUTES.PROFILE);
  const isSettings = pathname?.startsWith(ROUTES.SETTINGS);
  const isFavorites = pathname?.startsWith(ROUTES.FAVORITES);
  const isBlogDetailsPage =
    pathname?.startsWith(ROUTES.BLOG + "/") && pathname.split("/").length === 3;
  const isBlogListingPage = pathname === ROUTES.BLOG;

  const hideMobileNavbar =
    isPlaceDetailsPage ||
    isPostDetailsPage ||
    isMarketInside ||
    isProfileSection ||
    isSettings ||
    isFavorites ||
    isBlogDetailsPage ||
    isBlogListingPage;

  if (isAuthPage || isAdminPage) return null;

  return (
    <>
      {/* ───────── Mobile Navbar ───────── */}
      {!hideMobileNavbar && (
        <header className="lg:hidden sticky top-0 w-full h-14 z-50 bg-background border-b border-border-subtle flex justify-center">
          <div className="flex items-center justify-between w-full max-w-sm md:max-w-2xl lg:max-w-4xl h-full px-4">
            {/* Logo */}
            <CustomLink href={ROUTES.HOME} className="flex items-center gap-2">
              <Image
                src={APP_CONFIG.LOGO_PATH}
                alt={APP_CONFIG.NAME}
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <span className="font-semibold text-base text-text-primary">
                {APP_CONFIG.NAME}
              </span>
            </CustomLink>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <NotificationBell />
                <CustomLink
                  href={user ? ROUTES.PROFILE : ROUTES.LOGIN}
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
      <nav className="hidden lg:flex sticky top-0 w-full h-16 z-50 bg-background border-b border-border-subtle">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8">
          {/* Logo */}
          <CustomLink href={ROUTES.HOME} className="flex items-center gap-2">
            <Image
              src={APP_CONFIG.LOGO_PATH}
              alt={APP_CONFIG.NAME}
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="font-semibold text-lg text-text-primary tracking-tight">
              {APP_CONFIG.NAME}
            </span>
          </CustomLink>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <NavLink
              href={ROUTES.HOME}
              active={pathname === ROUTES.HOME}
              label="الرئيسية"
              icon={<MapIcon className="w-4 h-4" />}
            />
            <NavLink
              href={ROUTES.PLACES}
              active={pathname?.startsWith(ROUTES.PLACES)}
              label="الأماكن"
              icon={<Search className="w-4 h-4" />}
            />
            <NavLink
              href={ROUTES.MARKET}
              active={pathname?.startsWith(ROUTES.MARKET)}
              label="السوق"
              icon={<Store className="w-4 h-4" />}
            />
            <NavLink
              href={ROUTES.COMMUNITY}
              active={pathname?.startsWith(ROUTES.COMMUNITY)}
              label="المجتمع"
              icon={<Users className="w-4 h-4" />}
            />
            <NavLink
              href={ROUTES.BLOG}
              active={pathname?.startsWith(ROUTES.BLOG)}
              label="المدونة"
              icon={<FileText className="w-4 h-4" />}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <CustomLink
              href={user ? ROUTES.PROFILE : ROUTES.LOGIN}
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
  active,
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
        ${
          active
            ? "text-primary border-b-2 border-primary"
            : "text-text-muted hover:text-text-primary border-b-2 border-transparent"
        }`}
    >
      {icon}
      <span>{label}</span>
    </CustomLink>
  );
}
