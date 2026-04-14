import { getCommunityPosts } from "@/features/community/actions/posts.server";
import { createClient } from "@/lib/supabase/server";
import CommunityTeaser from "./CommunityTeaser";

export default async function CommunityTeaserWrapper() {
    // 🔥 We fetch the user here to isolate the dynamic part (cookies)
    // and keep the rest of the Home page cacheable.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const posts = await getCommunityPosts(undefined, undefined, 1, 3, user?.id);

    return <CommunityTeaser posts={posts} />;
}
