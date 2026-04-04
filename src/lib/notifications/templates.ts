import { NotificationEvent, NotificationPayload, EventData } from './types';

/**
 * 📝 قائمة الإشعارات المدارة بالكامل عبر قاعدة البيانات (Supabase SQL):
 * هذه الإشعارات لا تحتاج لقوالب برمجية هنا لأنها تُرسل تلقائياً عبر Triggers أو Cron Jobs:
 * 
 * [تلقائي - Triggers]:
 * - COMMENT_ADDED / POST_LIKED / PLACE_FAVORITED
 * - MILESTONE_REACHED (عبر handle_view_milestones)
 * 
 * [مجدول - Cron Jobs]:
 * - FRIDAY_BLESSING / DAILY_RECAP 
 * - GENERAL_RETENTION / COMMUNITY_INVITE / ADD_PLACE_INVITE / APP_RECOMMENDATION
 */

// نوع مخصص للقوالب التي تدار برمجياً فقط
type CodeManagedEvents = NotificationEvent.PLACE_STATUS_UPDATED | NotificationEvent.SYSTEM_BROADCAST;

export const NotificationTemplates: {
  [K in CodeManagedEvents]: (data: EventData[K]) => Partial<NotificationPayload>
} = {
  // 1- إشعار تحديث حالة المكان (يتم استدعاؤه عند موافقة/رفض الأدمن للمكان)
  [NotificationEvent.PLACE_STATUS_UPDATED]: (data) => ({
    userId: data.recipientId,
    actorId: data.actorId,
    actorName: data.actorName,
    title: data.status === 'approved' ? 'تم قبول مكانك 🎉' : 'عذراً، تم رفض مكانك',
    message: data.status === 'approved' 
        ? `تمت الموافقة على نشر "${data.placeName}" بنجاح مـن قبل ${data.actorName}.` 
        : `لم تتم الموافقة على نشر "${data.placeName}" مـن قبل ${data.actorName}.`,
    type: 'SYSTEM',
    link: data.status === 'approved' && data.slug ? `/places/${data.slug}` : '#',
  }),

  // 2- إشعار البث العام (يتم استدعاؤه يدوياً لإرسال رسالة لكل المستخدمين)
  [NotificationEvent.SYSTEM_BROADCAST]: (data) => ({
    userId: 'all',
    title: data.title,
    message: data.message,
    type: 'SYSTEM',
    link: data.link || '/',
  }),
};
