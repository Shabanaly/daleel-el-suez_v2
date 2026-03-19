import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            content,
            category:category_id ( name, icon )
        `)
        .eq('status', 'active')
        .ilike('content', `%a%`)
        .order('likes_count', { ascending: false })
        .limit(6);
    console.log("Error:", error);
    console.log("Data length:", data?.length);
}
run();
