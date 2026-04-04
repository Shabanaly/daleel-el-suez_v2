'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { UsersFilter } from '@/features/admin/components/users/UsersFilter';
import { UsersTable } from '@/features/admin/components/users/UsersTable';
import { UserDetailsModal } from '@/features/admin/components/users/UserDetailsModal';
import { AdminUser, AdminUserRole } from '@/features/admin/actions/users';
import { UserPlus, Download } from 'lucide-react';

export default function AdminUsersPage() {
    const { users, totalCount, isLoading, error, fetchUsers, updateRole, removeUser } = useAdminUsers();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminUserRole | undefined>();
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const handleFilterChange = useCallback((search: string, role?: AdminUserRole) => {
        setSearchTerm(search);
        setRoleFilter(role);
        setPage(1);
    }, []);

    useEffect(() => {
        fetchUsers(searchTerm, roleFilter, page);
    }, [fetchUsers, searchTerm, roleFilter, page]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">إدارة المستخدمين</h1>
                    <p className="text-text-muted text-sm mt-1 font-medium">تحكم في صلاحيات المستخدمين وراقب نشاطهم في النظام</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-elevated/50 border border-border-subtle rounded-xl text-xs font-bold text-text-secondary hover:bg-elevated hover:text-text-primary transition-all duration-300">
                        <Download className="w-4 h-4" />
                        تصدير البيانات
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-all duration-300 shadow-lg shadow-primary/20">
                        <UserPlus className="w-4 h-4" />
                        إضافة مستخدم
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-error/10 text-error p-4 rounded-2xl border border-error/20 flex items-center gap-3 animate-in shake duration-500">
                    <div className="p-2 bg-error/20 rounded-lg">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <span className="font-bold text-sm">{error}</span>
                </div>
            )}

            {/* Filter Bar */}
            <UsersFilter onFilterChange={handleFilterChange} />

            {/* Stats Summary (Mini) */}
            <div className="flex items-center gap-2 text-sm font-bold text-text-muted mb-2 px-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                إجمالي المسجلين في النظام: <span className="text-primary">{totalCount}</span>
            </div>

            {/* Main Table */}
            <UsersTable
                users={users}
                isLoading={isLoading}
                onUpdateRole={async (id, role) => { await updateRole(id, role); }}
                onDelete={async (id) => { await removeUser(id); }}
                onViewDetails={setSelectedUser}
                page={page}
                totalPages={Math.ceil(totalCount / 20)}
                onPageChange={handlePageChange}
            />

            {/* Details Modal */}
            <UserDetailsModal 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
            />
        </div>
    );
}
