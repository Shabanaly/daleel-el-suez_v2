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

    // 1. Security & Validation check
    if (secret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 2. Initialize Supabase Admin ONCE (using service role for admin access)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Get tokens (Specific user or Broadcast to 'all')
    let query = supabaseAdmin.from('user_fcm_tokens').select('token');
    
    if (userId !== 'all') {
      query = query.eq('user_id', userId);
    }

    const { data: tokenData, error: tokenError } = await query;

    if (tokenError || !tokenData || tokenData.length === 0) {
        console.log('No tokens found for target:', userId);
        return NextResponse.json({ success: true, message: 'No tokens found' });
    }

    const tokens = tokenData.map(t => t.token);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://daleel-al-suez.com';

    // 4. Build the Notification Payload
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        url: link || '/',
      },
      android: {
        priority: 'high' as const,
        notification: {
          icon: 'stock_ticker_update',
          color: '#0070f3',
          sound: 'default',
        },
      },
      webpush: {
        headers: {
          TTL: '86400', // 24 hours
        },
        notification: {
          // Use Absolute URLs for reliability outside the app
          icon: `${baseUrl}/favicon-circular.ico`,
          badge: `${baseUrl}/favicon-circular.ico`,
          timestamp: Date.now(),
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'عرض التفاصيل',
            },
          ],
          data: {
            url: link || '/',
          },
        },
        fcmOptions: {
          link: link || '/',
        },
      },
      tokens: tokens,
    };

    // 5. Send multicast message
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // 6. Intelligent Token Cleanup
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            // Only cleanup if the token is definitely invalid or expired
            if (errorCode === 'messaging/registration-token-not-registered' || 
                errorCode === 'messaging/invalid-registration-token') {
              return tokens[idx];
            }
          }
          return null;
        })
        .filter((token): token is string => token !== null);

      if (failedTokens.length > 0) {
        await supabaseAdmin
          .from('user_fcm_tokens')
          .delete()
          .in('token', failedTokens);
        console.log(`Cleaned up ${failedTokens.length} stale/invalid tokens`);
      }
    }

    console.log(`Push Notification: ${response.successCount} success, ${response.failureCount} failed.`);

    return NextResponse.json({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
    });

  } catch (error: any) {
    console.error('CRITICAL: Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
