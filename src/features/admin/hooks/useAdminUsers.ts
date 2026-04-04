'use client';

import { useState, useCallback } from 'react';
import { getAdminUsers, updateUserRole, deleteUser, AdminUser, AdminUserRole } from '@/features/admin/actions/users';

export function useAdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (searchTerm: string = '', role?: AdminUserRole, page: number = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const limit = 20;
            const result = await getAdminUsers(page, limit, searchTerm, role);
            if (result.error) {
                setError(result.error);
            } else {
                setUsers(result.users || []);
                setTotalCount(result.totalCount || 0);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateRole = async (userId: string, role: AdminUserRole) => {
        try {
            const result = await updateUserRole(userId, role);
            if (result.success) {
                // Optimistic update
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (err: unknown) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    };

    const removeUser = async (userId: string) => {
        try {
            const result = await deleteUser(userId);
            if (result.success) {
                // Optimistic update
                setUsers(prev => prev.filter(u => u.id !== userId));
                setTotalCount(prev => Math.max(0, prev - 1));
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (err: unknown) {
            return { success: false, error: err instanceof Error ? err.message : 'فشل الحذف. يرجى المحاولة مرة أخرى.' };
        }
    };

    return {
        users,
        totalCount,
        isLoading,
        error,
        fetchUsers,
        updateRole,
        removeUser
    };
}
