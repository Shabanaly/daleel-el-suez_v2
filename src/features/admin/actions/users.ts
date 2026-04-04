'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type AdminUserRole = 'user' | 'admin' | 'moderator';

export interface AdminUser {
    id: string;
    email?: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    role: AdminUserRole;
    created_at: string;
    last_sign_in_at?: string;
    phone?: string;
    is_confirmed?: boolean;
    stats?: {
        places: number;
        listings: number;
        posts: number;
        reviews: number;
    };
}

export async function getAdminUsers(page: number = 1, limit: number = 20, search: string = '', role?: AdminUserRole) {
    const supabase = createAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        // 1. Fetch Users from Auth (Admin SDK)
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Fetch Profiles from Public Schema
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
        }

        if (role) {
            query = query.eq('role', role);
        }

        const { data: profiles, count, error: profileError } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (profileError) throw profileError;

        // 3. Merge Auth data with Profile data
        const mergedUsers: AdminUser[] = profiles.map(profile => {
            const authUser = authUsers.find(u => u.id === profile.id);
            return {
                id: profile.id,
                email: authUser?.email,
                full_name: profile.full_name,
                username: profile.username,
                avatar_url: profile.avatar_url,
                role: profile.role as AdminUserRole,
                created_at: profile.created_at,
                last_sign_in_at: authUser?.last_sign_in_at,
                phone: profile.phone || authUser?.phone,
                is_confirmed: !!authUser?.email_confirmed_at,
            };
        });

        return {
            users: mergedUsers,
            totalCount: count || 0,
        };
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return { users: [], totalCount: 0, error: 'Failed to fetch users' };
    }
}

export async function getUserStats(userId: string) {
    const supabase = createAdminClient();

    try {
        const [places, listings, posts, reviews] = await Promise.all([
            supabase.from('places').select('*', { count: 'exact', head: true }).eq('added_by', userId),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', userId),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
            supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        ]);

        return {
            places: places.count || 0,
            listings: listings.count || 0,
            posts: posts.count || 0,
            reviews: reviews.count || 0,
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { places: 0, listings: 0, posts: 0, reviews: 0 };
    }
}

export async function updateUserRole(userId: string, role: AdminUserRole) {
    const supabase = createAdminClient();

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient();

    try {
        // This will cascade delete profiles if the foreign key is set to CASCADE
        // Otherwise we'd need to manual delete profiles first.
        // Assuming profiles has a cascade delete on auth.users.id
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) throw error;
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}
