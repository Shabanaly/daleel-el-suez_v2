import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // Initialize Firebase Admin lazily to avoid build-time errors
  if (!admin.apps.length) {
    try {
      const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (firebaseKey) {
        const serviceAccount = JSON.parse(firebaseKey);
        
        // Fix for private key newlines if they are escaped as literal '\n'
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } else {
          console.warn('[PushAPI] Firebase Service Account Key is missing required fields.');
        }
      } else {
        console.warn('[PushAPI] FIREBASE_SERVICE_ACCOUNT_KEY is not defined.');
      }
    } catch (error) {
      console.error('Firebase Admin init error:', error);
    }
  }

  let notificationLogId: string | null = null;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { userId, title, body, link, secret, notificationId } = await req.json();

    // 1. Security & Validation check
    if (!secret || secret !== process.env.API_SECRET) {
      console.warn(`[PushAPI] Unauthorized request! ${secret ? 'Secret mismatch' : 'Missing secret'}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title/body' }, { status: 400 });
    }

    // 2. Create initial audit log if notificationId is provided
    if (notificationId) {
      const { data: logData } = await supabaseAdmin
        .from('notification_logs')
        .insert({
          notification_id: notificationId,
          status: 'pending'
        })
        .select('id')
        .single();
      notificationLogId = logData?.id || null;
    }

    // 3. Get tokens (Specific user, Guest, or All)
    let query = supabaseAdmin.from('user_fcm_tokens').select('token');
    
    if (userId === 'all') {
      // Broadcast to everyone
    } else if (!userId || userId === 'null') {
      // Targeted for guests (though usually we need a specific token for that)
      // For now, we'll assume 'all' is used for general broadcasts and specific userId for targeted.
      query = query.is('user_id', null);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data: tokenData, error: tokenError } = await query;

    if (tokenError) {
        console.error('[PushAPI] Supabase token query error:', tokenError.message);
        if (notificationLogId) {
          await supabaseAdmin.from('notification_logs').update({ status: 'failed', error_message: tokenError.message }).eq('id', notificationLogId);
        }
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!tokenData || tokenData.length === 0) {
        console.log(`[PushAPI] No tokens found for target: ${userId}`);
        if (notificationLogId) {
          await supabaseAdmin.from('notification_logs').update({ status: 'sent', error_message: 'No tokens found' }).eq('id', notificationLogId);
        }
        return NextResponse.json({ success: true, message: 'No tokens found' });
    }

    const tokens = tokenData.map(t => t.token);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://daleel-al-suez.com';

    // 4. Build the Notification Payload (FCM v1)
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        url: link || '/',
        notification_id: notificationId || '',
      },
      android: {
        priority: 'high' as const,
        notification: {
          icon: 'stock_ticker_update',
          color: '#0070f3',
          sound: 'default',
          clickAction: link || '/',
        },
      },
      webpush: {
        headers: {
          TTL: '86400', // 24 hours
          Urgency: 'high',
        },
        notification: {
          icon: `${baseUrl}/favicon-circular.ico`,
          badge: `${baseUrl}/favicon-circular.ico`,
          timestamp: Date.now(),
          requireInteraction: true,
          tag: notificationId || `notif-${Date.now()}`,
          renotify: true,
          actions: [
            {
              action: 'open_url',
              title: 'فتح الآن',
            }
          ]
        },
        fcmOptions: {
          link: link || '/',
        },
      },
      tokens: tokens,
    };

    // 5. Send multicast message
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // 6. Audit Logging & Cleanup
    if (notificationLogId) {
      await supabaseAdmin.from('notification_logs').update({
        status: response.failureCount === tokens.length ? 'failed' : 'sent',
        response_payload: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          results: response.responses.map(r => ({ success: r.success, error: r.error?.code }))
        }
      }).eq('id', notificationLogId);
    }

    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
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
        console.log(`[PushAPI] Cleaned up ${failedTokens.length} invalid tokens`);
      }
    }

    return NextResponse.json({ 
        success: true, 
        successCount: response.successCount, 
        failureCount: response.failureCount 
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('CRITICAL: Error sending push notification:', err);
    if (notificationLogId) {
      await supabaseAdmin.from('notification_logs').update({ status: 'failed', error_message: err.message }).eq('id', notificationLogId);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
