'use client';

import { AdminUser, getUserStats } from '@/features/admin/actions/users';
import { X, MapPin, ShoppingBag, MessageSquare, Star, User, Mail, Calendar, Shield, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { RoleBadge } from './RoleBadge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserDetailsModalProps {
    user: AdminUser | null;
    onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
    const [stats, setStats] = useState<{ places: number; listings: number; posts: number; reviews: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Defer loading state to avoid cascading renders
            Promise.resolve().then(() => {
                setIsLoading(true);
                getUserStats(user.id).then(data => {
                    setStats(data);
                    setIsLoading(false);
                });
            });
        } else {
            Promise.resolve().then(() => setStats(null));
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg h-full bg-elevated/80 backdrop-blur-2xl border-r border-border-subtle shadow-2xl rounded-3xl overflow-y-auto animate-in slide-in-from-left duration-500 overflow-x-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-elevated/40 backdrop-blur-md z-10">
                    <h2 className="text-xl font-black text-text-primary">تفاصيل المستخدم</h2>
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-error/10 hover:text-error text-text-muted rounded-xl transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8 flex-1">
                    {/* User Profile Summary */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative group/avatar">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-background border-2 border-border-subtle shadow-xl group-hover/avatar:border-primary transition-all duration-500 relative">
                                {user.avatar_url ? (
                                    <Image src={user.avatar_url} alt={user.username || ''} width={128} height={128} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-background animate-bounce duration-3000">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-text-primary tracking-tight">{user.full_name || user.username}</h3>
                            <p className="text-text-muted font-medium">@{user.username || 'no_username'}</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <RoleBadge role={user.role} />
                                {user.is_confirmed && (
                                    <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full border border-success/20 flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" />
                                        موثق
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            icon={MapPin} 
                            label="الأماكن" 
                            count={stats?.places} 
                            isLoading={isLoading} 
                            color="text-primary"
                            bg="bg-primary/5"
                        />
                        <StatCard 
                            icon={ShoppingBag} 
                            label="الإعلانات" 
                            count={stats?.listings} 
                            isLoading={isLoading}
                            color="text-accent"
                            bg="bg-accent/5"
                        />
                        <StatCard 
                            icon={MessageSquare} 
                            label="المنشورات" 
                            count={stats?.posts} 
                            isLoading={isLoading}
                            color="text-secondary"
                            bg="bg-secondary/5"
                        />
                        <StatCard 
                            icon={Star} 
                            label="التقييمات" 
                            count={stats?.reviews} 
                            isLoading={isLoading}
                            color="text-warning"
                            bg="bg-warning/5"
                        />
                    </div>

                    {/* Contact & Meta Info */}
                    <div className="glass-card p-6 rounded-2xl space-y-4 border-border-subtle/50 shadow-inner">
                        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest border-b border-border-subtle pb-2 mb-4">معلومات الحساب</h4>
                        
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Mail className="w-4 h-4 opacity-50 group-hover:text-primary transition-colors" />
                                <span className="font-bold">البريد الإلكتروني</span>
                            </div>
                            <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">{user.email || 'غير متاح'}</span>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Calendar className="w-4 h-4 opacity-50 group-hover:text-primary transition-colors" />
                                <span className="font-bold">تاريخ الانضمام</span>
                            </div>
                            <span className="text-sm font-medium text-text-primary">
                                {format(new Date(user.created_at), 'dd MMMM yyyy', { locale: ar })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <span className="text-xs font-black opacity-40 group-hover:text-primary transition-colors">ID</span>
                                <span className="font-bold">رقم التعريف</span>
                            </div>
                            <code className="text-[10px] bg-background/50 px-2 py-1 rounded-md border border-border-subtle text-text-muted">{user.id}</code>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border-subtle bg-elevated/40 backdrop-blur-md flex gap-3">
                    <button className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
                        إرسال رسالة
                    </button>
                    <button className="flex-1 px-4 py-3 bg-error text-white rounded-xl text-sm font-black hover:bg-error-hover transition-all shadow-lg shadow-error/20 hover:-translate-y-0.5">
                        حظر المستخدم
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, count, isLoading, color, bg }: { icon: React.ElementType, label: string, count: number | undefined, isLoading: boolean, color: string, bg: string }) {
    return (
        <div className={cn("p-4 rounded-3xl border border-border-subtle/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group", bg)}>
            <div className="absolute -top-2 -left-2 p-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-700">
                <Icon className={cn("w-16 h-16", color)} />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
                <div className={cn("p-2 rounded-xl w-fit mb-1 border border-border-subtle", bg)}>
                    <Icon className={cn("w-4 h-4", color)} />
                </div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{label}</span>
                {isLoading ? (
                    <div className="h-8 w-12 bg-text-muted/10 animate-pulse rounded-md mt-1"></div>
                ) : (
                    <span className="text-2xl font-black text-text-primary tracking-tighter">{count || 0}</span>
                )}
            </div>
        </div>
    );
}
