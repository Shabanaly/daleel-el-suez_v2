'use client';

import { useComments } from '@/components/providers/CommentsProvider';
import CommentsSheet from './CommentsSheet';

interface CommentsWrapperProps {
    forcedOpenPostId?: string;
}

export default function CommentsWrapper({ forcedOpenPostId }: CommentsWrapperProps) {
    const { activePostId, closeComments } = useComments();
    const postId = forcedOpenPostId || activePostId;

    return (
        <CommentsSheet
            postId={postId}
            onClose={closeComments}
        />
    );
}
