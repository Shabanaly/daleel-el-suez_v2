'use client';

import { AdminUser, AdminUserRole, updateUserRole, deleteUser } from '@/features/admin/actions/users';
import { RoleBadge } from './RoleBadge';
import { User, Mail, Calendar, LogIn, MoreVertical, Shield, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UsersTableProps {
    users: AdminUser[];
    isLoading: boolean;
    onUpdateRole: (userId: string, role: AdminUserRole) => Promise<void>;
    onDelete: (userId: string) => Promise<void>;
    onViewDetails: (user: AdminUser) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function UsersTable({
    users,
    isLoading,
    onUpdateRole,
    onDelete,
    onViewDetails,
    page,
    totalPages,
    onPageChange
}: UsersTableProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { showConfirm } = useDialog();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const handleRoleChange = async (userId: string, role: AdminUserRole) => {
        setActionLoading(userId);
        await onUpdateRole(userId, role);
        setActionLoading(null);
    };

    const handleDelete = (userId: string) => {
        showConfirm({
            title: 'حذف المستخدم نهائياً',
            message: 'هل أنت متأكد من حذف هذا المستخدم وكل بياناته؟ لا يمكن التراجع عن هذا الإجراء.',
            type: 'confirm',
            confirmLabel: 'حذف نهائي',
            cancelLabel: 'إلغاء',
            onConfirm: async () => {
                setActionLoading(userId);
                await onDelete(userId);
                setActionLoading(null);
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const toggleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    if (isLoading) {
        return (
            <div className="glass-card rounded-2xl p-12 flex justify-center items-center backdrop-blur-xl border-border-subtle/50">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin glow-primary absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-16 text-center backdrop-blur-xl border-border-subtle/50 shadow-xl overflow-hidden group">
                <div className="relative mx-auto w-24 h-24 mb-6 transition-transform group-hover:scale-110 duration-500">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25"></div>
                    <div className="relative bg-primary/5 rounded-full p-6 border border-primary/20">
                        <User className="w-12 h-12 text-primary/50" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">لا يوجد مستخدمين</h3>
                <p className="text-text-muted max-w-xs mx-auto">لم نعثر على أي مستخدم يطابق معايير البحث الحالية.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
                <div className="glass-card px-6 py-3 rounded-2xl flex items-center justify-between bg-primary/10 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">{selectedUsers.length}</span>
                        <span className="text-sm font-bold text-primary">مستخدمين محددين</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-background border border-primary/20 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all">تغيير الرتبة</button>
                        <button className="px-4 py-2 bg-error text-white rounded-xl text-xs font-bold hover:bg-error-hover transition-all shadow-lg shadow-error/20">حذف المحدد</button>
                    </div>
                </div>
            )}

            <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-border-subtle/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-elevated/30 text-text-secondary border-b border-border-subtle">
                            <tr>
                                <th className="px-4 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary/20 accent-primary"
                                    />
                                </th>
                                <th className="px-4 py-4 font-black">المستخدم</th>
                                <th className="px-4 py-4 font-black hidden md:table-cell">البريد الإلكتروني</th>
                                <th className="px-4 py-4 font-black">الرتبة</th>
                                <th className="px-4 py-4 font-black hidden lg:table-cell">آخر ظهور</th>
                                <th className="px-4 py-4 font-black text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {users.map((user) => (
                                <tr key={user.id} className={cn(
                                    "hover:bg-primary/5 transition-all duration-300 group",
                                    selectedUsers.includes(user.id) && "bg-primary/5"
                                )}>
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => toggleSelectUser(user.id)}
                                            className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary/20 accent-primary"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => onViewDetails(user)}
                                            className="flex items-center gap-3 text-right group/user"
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-elevated border border-border-subtle group-hover/user:border-primary/50 transition-colors">
                                                    {user.avatar_url ? (
                                                        <Image src={user.avatar_url} alt={user.username || 'user'} width={40} height={40} className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                {user.is_confirmed && (
                                                    <div className="absolute -bottom-1 -left-1 bg-background rounded-full p-0.5 border border-border-subtle">
                                                        <CheckCircle2 className="w-3 h-3 text-success" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-text-primary group-hover/user:text-primary transition-colors">{user.full_name || user.username || 'بدون اسم'}</div>
                                                <div className="text-xs text-text-muted font-medium">@{user.username || 'no_username'}</div>
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Mail className="w-3.5 h-3.5 opacity-50" />
                                            <span className="font-medium truncate max-w-[180px]">{user.email || 'غير متاح'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell text-text-muted">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                                <LogIn className="w-3 h-3 opacity-50" />
                                                {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd MMM HH:mm', { locale: ar }) : 'لم يسجل دخول'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                                                <Calendar className="w-3 h-3" />
                                                انضم {format(new Date(user.created_at), 'dd MMM yyyy', { locale: ar })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {actionLoading === user.id ? (
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onViewDetails(user)}
                                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                    <div className="relative group/actions">
                                                        <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                        <div className="absolute left-0 top-full mt-1 hidden group-hover/actions:block z-50 min-w-[140px] glass-card rounded-xl shadow-2xl border-border-subtle p-1 animate-in fade-in zoom-in duration-200">
                                                            <div className="text-[10px] font-bold text-text-muted px-2 py-1 select-none">تغيير الرتبة</div>
                                                            <button onClick={() => handleRoleChange(user.id, 'admin')} className="w-full text-right px-3 py-2 text-xs font-bold text-error hover:bg-error/10 rounded-lg transition-colors">مدير نظام</button>
                                                            <button onClick={() => handleRoleChange(user.id, 'moderator')} className="w-full text-right px-3 py-2 text-xs font-bold text-warning hover:bg-warning/10 rounded-lg transition-colors">مشرف</button>
                                                            <button onClick={() => handleRoleChange(user.id, 'user')} className="w-full text-right px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">مستخدم عادي</button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all"
                                                        title="حذف المستخدم"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t border-border-subtle bg-elevated/10 overflow-hidden relative">
                        <div className="text-sm font-bold text-text-muted relative z-10">
                            الصفحة <span className="text-primary">{page}</span> من <span className="text-primary">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1 || isLoading}
                                className="px-6 py-2.5 rounded-xl border border-border-subtle bg-background/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 font-bold text-xs"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page === totalPages || isLoading}
                                className="px-6 py-2.5 rounded-xl border border-border-subtle bg-background/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 font-bold text-xs"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
