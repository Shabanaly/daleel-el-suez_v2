'use client';

import { usePathname } from 'next/navigation';
import { ROUTES, AUTH_ROUTES } from '@/constants';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = AUTH_ROUTES.includes(pathname);
    const isAdminPage = pathname?.startsWith(ROUTES.ADMIN);

    return (
        <main className={`w-full mx-auto ${isAuthPage || isAdminPage ? '' : 'lg:pl-72 lg:pr-20'}`}>
            {children}
        </main>
    );
}
