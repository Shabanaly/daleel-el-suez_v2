'use client';

import { usePathname } from 'next/navigation';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <main className={`w-full mx-auto ${isAuthPage ? '' : 'xl:px-72'}`}>
            {children}
        </main>
    );
}
