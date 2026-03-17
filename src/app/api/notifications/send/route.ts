import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title, body, link, secret } = await req.json();

    // 1. Security check
    if (secret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 2. Import Supabase Admin to fetch tokens
    // We use service role key for admin access
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Get user tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', userId);

    if (tokenError || !tokenData || tokenData.length === 0) {
        console.log('No tokens found for user:', userId);
        return NextResponse.json({ success: true, message: 'No tokens found' });
    }

    const tokens = tokenData.map(t => t.token);

    // 4. Send Message via Firebase
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        click_action: link || '/',
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);

    return NextResponse.json({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
    });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
