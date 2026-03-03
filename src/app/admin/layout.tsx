import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-background text-text-primary" dir="rtl">
                <AdminSidebar />
                <main className="lg:pr-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
                    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
