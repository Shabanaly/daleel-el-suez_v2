import { useState, useCallback } from 'react';
import { getAdminCommunityPosts, deletePostAdmin, updatePostStatusAdmin } from '@/features/admin/actions/community';
import { toast } from 'react-hot-toast';

export function useAdminCommunity() {
    const [posts, setPosts] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (search?: string, page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAdminCommunityPosts(page, 50, search);
            setPosts(result.posts);
            setTotalCount(result.total);
        } catch (err) {
            console.error('fetchPosts error:', err);
            setError('تعذر جلب منشورات المجتمع. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const result = await updatePostStatusAdmin(id, status);
            if (result.success) {
                setPosts(prev => prev.map(post => post.id === id ? { ...post, status } : post));
                toast.success('تم تحديث حالة المنشور');
                return { success: true };
            }
            toast.error(result.error || 'فشل تحديث الحالة');
            return { success: false, error: result.error };
        } catch (err) {
            toast.error('حدث خطأ أثناء التحديث');
            return { success: false, error: 'Internal Error' };
        }
    };

    const removePost = async (id: string) => {
        try {
            const result = await deletePostAdmin(id);
            if (result.success) {
                setPosts(prev => prev.filter(post => post.id !== id));
                setTotalCount(prev => prev - 1);
                toast.success('تم حذف المنشور بنجاح');
                return { success: true };
            }
            toast.error(result.error || 'فشل الحذف');
            return { success: false, error: result.error };
        } catch (err) {
            toast.error('حدث خطأ أثناء الحذف');
            return { success: false, error: 'Internal Error' };
        }
    };

    return {
        posts,
        totalCount,
        isLoading,
        error,
        fetchPosts,
        updateStatus,
        removePost
    };
}
