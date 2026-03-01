'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CommentsSheet from './CommentsSheet';

interface CommentsWrapperProps {
    forcedOpenPostId?: string;
}

export default function CommentsWrapper({ forcedOpenPostId }: CommentsWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = forcedOpenPostId || searchParams.get('postId');

    const handleClose = () => {
        if (forcedOpenPostId) {
            // If forced open, maybe we just don't close or we go back
            // For now, let's just do nothing or hide it if we had a state
            return;
        }
        const params = new URLSearchParams(searchParams.toString());
        params.delete('postId');
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    return (
        <CommentsSheet
            postId={postId}
            onClose={handleClose}
        />
    );
}
