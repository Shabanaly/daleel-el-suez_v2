import CreatePostTrigger from './CreatePostTrigger';
import { createClient } from '@/lib/supabase/server';

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface CreatePostProps {
    categories: Category[];
}

export default async function CreatePost({ categories }: CreatePostProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <CreatePostTrigger
            categories={categories}
            userAvatar={user?.user_metadata?.avatar_url}
        />
    );
}
