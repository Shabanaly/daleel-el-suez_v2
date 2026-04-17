"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  MapPin,
  Store,
  Users,
  Settings,
  LogOut,
  Info,
  Heart,
  Share2,
  User,
  FileText,
  ShieldCheck,
  ShoppingBag,
  Copyright as CopyIcon,
} from "lucide-react";
import ShareButton from "@/components/ui/ShareButton";
import CustomLink from "@/components/customLink/customLink";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthModal } from "@/features/auth/hooks/useAuthModal";
import { ROUTES, APP_CONFIG } from "@/constants";

interface QuickActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionsDrawer({
  isOpen,
  onClose,
}: QuickActionsDrawerProps) {
  // const pathname = usePathname();
  const { user, handleLogout } = useAuth();
  const { openModal } = useAuthModal();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const router = useRouter();

  const handleProtectedAction = (href: string) => {
    if (!user) {
      onClose();
      openModal();
    } else {
      onClose();
      router.push(href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-surface rounded-t-[32px] pb-safe z-101 border-t border-border-subtle shadow-2xl max-h-[75vh] flex flex-col"
          >
            <div className="bg-surface/90 dark:bg-background/95 backdrop-blur-2xl rounded-[32px] border border-border-subtle shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col h-full overflow-hidden">
              {/* Handle Bar */}
              <div className="flex justify-center py-4">
                <div className="w-12 h-1.5 bg-text-muted/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-8 pb-6 border-b border-border-subtle/50">
                <h3 className="text-xl font-black text-text-primary tracking-tight">
                  الوصول السريع
                </h3>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-elevated/50 border border-border-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto custom-scrollbar flex-1 pb-6">
                {/* Actions Grid */}
                <div className="p-6 grid grid-cols-3 gap-4">
                  <ActionItem
                    href={ROUTES.PLACES_ADD}
                    icon={<Plus className="w-6 h-6" />}
                    label="أضف مكان"
                    color="bg-primary"
                    onClick={() => handleProtectedAction(ROUTES.PLACES_ADD)}
                    isButton
                  />
                  <ActionItem
                    href={ROUTES.PLACES}
                    icon={<MapPin className="w-6 h-6" />}
                    label="استكشف"
                    color="bg-primary"
                    onClick={onClose}
                  />
                  <ActionItem
                    href={ROUTES.FAVORITES}
                    icon={<Heart className="w-6 h-6" />}
                    label="المفضلة"
                    color="bg-accent"
                    onClick={() => handleProtectedAction(ROUTES.FAVORITES)}
                    isButton
                  />
                  <ActionItem
                    href={ROUTES.MARKET_CREATE}
                    icon={<Plus className="w-6 h-6" />}
                    label="أضف إعلان"
                    color="bg-primary"
                    onClick={() => handleProtectedAction(ROUTES.MARKET_CREATE)}
                    isButton
                  />
                  <ActionItem
                    href={ROUTES.MARKET}
                    icon={<Store className="w-6 h-6" />}
                    label="سوق السويس"
                    color="bg-primary"
                    onClick={onClose}
                  />
                  <ActionItem
                    href={ROUTES.MARKET_MY_ADS}
                    icon={<ShoppingBag className="w-6 h-6" />}
                    label="إعلاناتي"
                    color="bg-primary"
                    onClick={() => handleProtectedAction(ROUTES.MARKET_MY_ADS)}
                    isButton
                  />
                  <ActionItem
                    href={ROUTES.COMMUNITY}
                    icon={<Users className="w-6 h-6" />}
                    label="المجتمع"
                    color="bg-primary"
                    onClick={onClose}
                  />
                  <ActionItem
                    href={ROUTES.BLOG}
                    icon={<FileText className="w-6 h-6" />}
                    label="المدونة"
                    color="bg-primary"
                    onClick={onClose}
                  />
                  <ShareButton
                    title={APP_CONFIG.NAME}
                    text={`${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`}
                    url={
                      typeof window !== "undefined"
                        ? window.location.origin
                        : APP_CONFIG.BASE_URL
                    }
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white border border-white/20 shadow-lg shadow-black/5 group-hover:scale-110 active:scale-95 transition-all duration-300">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black text-text-primary tracking-tight">
                      مشاركة
                    </span>
                  </ShareButton>
                </div>

                {/* Bottom Links List */}
                <div className="px-6 pt-2 space-y-2">
                  <ListLink
                    icon={<User className="w-5 h-5" />}
                    label="البروفايل"
                    href={ROUTES.PROFILE}
                    onClick={() => handleProtectedAction(ROUTES.PROFILE)}
                    isButton
                  />
                  <ListLink
                    icon={<Settings className="w-5 h-5" />}
                    label="الإعدادات"
                    href={ROUTES.SETTINGS}
                    onClick={() => handleProtectedAction(ROUTES.SETTINGS)}
                    isButton
                  />

                  <div className="h-px bg-border-subtle/50 my-2" />

                  <ListLink
                    icon={<Info className="w-5 h-5" />}
                    label={`عن ${APP_CONFIG.NAME}`}
                    href={ROUTES.ABOUT}
                    onClick={onClose}
                  />
                  <ListLink
                    icon={<FileText className="w-5 h-5" />}
                    label="الشروط والأحكام"
                    href={ROUTES.TERMS}
                    onClick={onClose}
                  />
                  <ListLink
                    icon={<ShieldCheck className="w-5 h-5" />}
                    label="سياسة الخصوصية"
                    href={ROUTES.PRIVACY}
                    onClick={onClose}
                  />
                  <ListLink
                    icon={<CopyIcon className="w-5 h-5" />}
                    label="حقوق النشر"
                    href={ROUTES.COPYRIGHT}
                    onClick={onClose}
                  />
                  {user && (
                    <button
                      onClick={async () => {
                        await handleLogout();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/5 hover:bg-accent/10 border border-accent/10 text-accent transition-all font-bold group cursor-pointer mt-4"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>تسجيل الخروج</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ActionItem({
  href,
  icon,
  label,
  color,
  onClick,
  isButton,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: (e: React.MouseEvent) => void;
  isButton?: boolean;
}) {
  if (isButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-2 group w-full appearance-none outline-none bg-transparent"
      >
        <div
          className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white border border-white/20 shadow-lg shadow-black/5 group-hover:scale-110 active:scale-95 transition-all duration-300`}
        >
          {icon}
        </div>
        <span className="text-[11px] font-black text-text-primary tracking-tight">
          {label}
        </span>
      </button>
    );
  }

  return (
    <CustomLink
      href={href}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white border border-white/20 shadow-lg shadow-black/5 group-hover:scale-110 active:scale-95 transition-all duration-300`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-black text-text-primary tracking-tight">
        {label}
      </span>
    </CustomLink>
  );
}

function ListLink({
  icon,
  label,
  href,
  onClick,
  isButton,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: (e: React.MouseEvent) => void;
  isButton?: boolean;
}) {
  if (isButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-elevated hover:bg-elevated/80 border border-border-subtle text-text-primary hover:shadow-lg transition-all font-bold group appearance-none outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <span>{label}</span>
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border-subtle group-hover:bg-primary group-hover:text-white transition-all">
          <Plus className="w-4 h-4 rotate-45" />
        </div>
      </button>
    );
  }

  return (
    <CustomLink
      href={href}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-elevated hover:bg-elevated/80 border border-border-subtle text-text-primary hover:shadow-lg transition-all font-bold group"
    >
      <div className="flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border-subtle group-hover:bg-primary group-hover:text-white transition-all">
        <Plus className="w-4 h-4 rotate-45" />
      </div>
    </CustomLink>
  );
}
