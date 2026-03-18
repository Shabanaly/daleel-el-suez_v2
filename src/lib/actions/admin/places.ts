'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type PlaceStatus = 'pending' | 'approved' | 'rejected';

// Helper: Check if current user is admin or moderator
async function checkAdminOrModerator() {
    const supabaseSession = await createClient();
    const { data: { user }, error: userError } = await supabaseSession.auth.getUser();

    if (userError || !user) {
        throw new Error('غير مصرح لك بالدخول.');
    }

    // Check users table for role
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !['admin', 'moderator'].includes(data?.role)) {
        throw new Error('ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء.');
    }

    return { user, role: data?.role };
}

// Fetch Places with dynamic filtering and pagination
export async function getAdminPlaces(params?: { search?: string, status?: PlaceStatus, page?: number, limit?: number }) {
    await checkAdminOrModerator(); // Secure the fetch action
    const supabase = createAdminClient();

    let query = supabase
        .from('places')
        .select(`
            id,
            name,
            address,
            phone,
            category:categories(name),
            area:areas(name, district:districts(name)),
            created_at,
            status
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

    if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.status) {
        query = query.eq('status', params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching admin places:', error);
        throw new Error('فشل جلب الأماكن. يرجى المحاولة مرة أخرى.');
    }

    // Map the relationships to match expected data types in the frontend
    const mappedPlaces = data.map((place: any) => ({
        ...place,
        category: place.category ? place.category : undefined,
        area: place.area?.name || 'غير محدد',
        district: place.area?.district?.name || 'غير محدد',
        rating: 0,
        reviews_count: 0
    }));

    return { places: mappedPlaces, totalCount: count || 0 };
}

// Update Place Status
export async function updatePlaceStatusAction(placeId: string, status: PlaceStatus) {
    await checkAdminOrModerator(); // Secure the update action
    const supabase = createAdminClient();

    // Fetch place added_by and slug before update to send notification
    const { data: placeData } = await supabase
        .from('places')
        .select('added_by, name, slug')
        .eq('id', placeId)
        .single();

    const { error } = await supabase
        .from('places')
        .update({ status })
        .eq('id', placeId);

    if (error) {
        console.error('Error updating place status:', error);
        throw new Error('فشل تحديث حالة المكان.');
    }
    
    // --- Notification Logic ---
    if (placeData && placeData.added_by && (status === 'approved' || status === 'rejected')) {
        const title = status === 'approved' ? 'تم قبول مكانك 🎉' : 'عذراً، تم رفض مكانك';
        const message = status === 'approved' 
            ? `تمت الموافقة على نشر "${placeData.name}" بنجاح في دليل السويس.` 
            : `لم تتم الموافقة على نشر "${placeData.name}". يرجى مراجعة الشروط.`;
            
        const { createNotification } = await import('@/lib/services/notifications');
        const { data: { user } } = await supabase.auth.getUser(); // Get current admin/actor

        const notificationResult = await createNotification({
            userId: placeData.added_by,
            actorId: user?.id,
            title: title,
            message: message,
            type: 'SYSTEM',
            link: status === 'approved' && placeData.slug ? `/places/${placeData.slug}` : '#'
        });

        if (!notificationResult.success) {
            console.error('[AdminAction] Failed to create notification for status update:', notificationResult.error);
        }
    }

    // Revalidate custom cache path
    revalidatePath('/admin/places');

    return { success: true };
}

// Delete Place
export async function deletePlaceAction(placeId: string) {
    const { role } = await checkAdminOrModerator();

    // Only admins can delete places, moderators can only update status
    if (role !== 'admin') {
        throw new Error('للأسف، المشرفين (Admins) فقط هم من يمكنهم الحذف النهائي.');
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId);

    if (error) {
        console.error('Error deleting place:', error);
        throw new Error('فشل حذف المكان.');
    }

    // Revalidate custom cache path
    revalidatePath('/admin/places');

    return { success: true };
}
