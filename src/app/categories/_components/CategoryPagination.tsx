'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Pagination } from '@/components/common/Pagination';

interface CategoryPaginationProps {
    currentPage: number;
    totalPages: number;
}

export function CategoryPagination({ currentPage, totalPages }: CategoryPaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) {
            params.set('page', page.toString());
        } else {
            params.delete('page');
        }
        
        // This will correctly trigger a navigation to the new URL
        router.push(`${pathname}?${params.toString()}`, { scroll: true });
    };

    return (
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
        />
    );
}
