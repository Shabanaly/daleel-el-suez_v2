"use client";

import { usePathname } from "next/navigation";
import { ROUTES, AUTH_ROUTES } from "@/constants";
import AdSlot from "@/components/common/AdSlot";
import { Vertical160x600 } from "@/components/common/ThirdPartyAds";

export default function LeftSidebar() {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const isAdminPage = pathname?.startsWith(ROUTES.ADMIN);

  if (isAuthPage || isAdminPage) return null;

  return (
    <aside className="hidden lg:flex sticky top-16 z-40 w-72 h-[calc(100vh-64px)] flex-col bg-surface/50 dark:bg-background/50 backdrop-blur-2xl border-r border-border-subtle shadow-[20px_0_50px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col items-center justify-center p-4 h-full overflow-y-auto hide-scrollbar">
        <AdSlot
          className="mt-0"
          device="desktop"
          prefixPaths={[
            ROUTES.PLACES,
            ROUTES.MARKET,
            ROUTES.COMMUNITY,
            ROUTES.BEST,
            ROUTES.CATEGORIES,
            ROUTES.BLOG,
          ]}
          exactPaths={[ROUTES.HOME]}
          excludeExactPaths={[
            ROUTES.PLACES_ADD,
            ROUTES.MARKET_CREATE,
            ROUTES.MARKET_MY_ADS,
          ]}
          excludePrefixPaths={[ROUTES.MARKET_EDIT, ROUTES.MANAGE]}
        >
          <Vertical160x600 containerId="ad-sidebar-vertical" />
        </AdSlot>
      </div>
    </aside>
  );
}
