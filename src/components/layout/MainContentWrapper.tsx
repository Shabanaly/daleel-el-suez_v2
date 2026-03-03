'use client';

import { usePathname } from 'next/navigation';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isAdminPage = pathname?.startsWith('/admin');

    return (
        <main className={`w-full mx-auto ${isAuthPage || isAdminPage ? '' : 'lg:pl-72 lg:pr-20'}`}>
            {children}
        </main>
    );
}
