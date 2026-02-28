import { createServiceClient } from './src/lib/supabase/client-service';

async function checkCommunityTables() {
    const supabase = createServiceClient();

    console.log('--- Checking for posts table ---');
    const { data: posts, error: postsError } = await supabase.from('posts').select('*').limit(1);
    if (postsError) console.log('Posts table error:', postsError.message);
    else console.log('Posts table exists:', posts);

    console.log('--- Checking for comments table ---');
    const { data: comments, error: commentsError } = await supabase.from('comments').select('*').limit(1);
    if (commentsError) console.log('Comments table error:', commentsError.message);
    else console.log('Comments table exists:', comments);
}

checkCommunityTables();
