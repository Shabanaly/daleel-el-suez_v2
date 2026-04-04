import { NotificationEvent, NotificationPayload, EventData } from './types';

export const NotificationTemplates: {
  [K in NotificationEvent]: (data: EventData[K]) => Partial<NotificationPayload>
} = {
  [NotificationEvent.COMMENT_ADDED]: (data) => ({
    userId: data.recipientId,
    actorId: data.actorId,
    actorName: data.actorName,
    title: 'تعليق جديد 💬',
    message: `قام ${data.actorName} بالتعليق على منشورك: "${(data.postTitle || '').substring(0, 30)}..."`,
    type: 'COMMUNITY',
    link: `/community/posts/${data.postId}`,
    metadata: { contentId: data.postId, type: 'COMMENT' }
  }),

  [NotificationEvent.COMMENT_REPLIED]: (data) => ({
    userId: data.recipientId,
    actorId: data.actorId,
    actorName: data.actorName,
    title: 'رد جديد على تعليقك 💬',
    message: `قام ${data.actorName} بالرد على تعليقك في: "${(data.postTitle || '').substring(0, 30)}..."`,
    type: 'COMMUNITY',
    link: `/community/posts/${data.postId}`,
    metadata: { contentId: data.postId, type: 'COMMENT_REPLY' }
  }),

  [NotificationEvent.POST_LIKED]: (data) => ({
    userId: data.recipientId,
    actorId: data.actorId,
    actorName: data.actorName,
    title: 'إعجاب جديد ❤️',
    message: `أعجب ${data.actorName} بمنشورك: "${(data.postContent || '').substring(0, 30)}..."`,
    type: 'COMMUNITY',
    link: `/community/posts/${data.postId}`,
    metadata: { contentId: data.postId, type: 'LIKE' }
  }),

  [NotificationEvent.PLACE_FAVORITED]: (data) => ({
    userId: data.recipientId,
    actorId: data.actorId,
    actorName: data.actorName,
    title: 'إضافة للمفضلة ⭐',
    message: `قام ${data.actorName} بإضافة "${data.placeName}" إلى مفضلته`,
    type: 'DIRECTORY',
    link: `/places/${data.placeSlug || data.placeId}`,
    metadata: { contentId: data.placeId, type: 'FAVORITE' }
  }),

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

  [NotificationEvent.COMMUNITY_INVITE]: (data) => ({
    userId: data.recipientId,
    title: 'شاركنا رأيك! 🗣️',
    message: 'اهل السويس بانتظارك! انضم للمجتمع الآن وشاركنا استفساراتك أو خبراتك.',
    type: 'COMMUNITY',
    link: '/community',
  }),

  [NotificationEvent.ADD_PLACE_INVITE]: (data) => ({
    userId: data.recipientId,
    title: 'أضف نشاطك مجاناً 🏗️',
    message: 'هل تعرف مكاناً مميزاً بالسويس؟ أضفه الآن في الدليل ليصل للجميع بسهولة.',
    type: 'DIRECTORY',
    link: '/places/add',
  }),

  [NotificationEvent.APP_SHARE_REMINDER]: (data) => ({
    userId: data.recipientId,
    title: 'ادعم مجتمعك 🤝',
    message: 'هل أعجبك دليل السويس؟ شاركه مع أصدقائك وساعدنا نكبر ونوصل لكل بيت.',
    type: 'SYSTEM',
    link: '/',
  }),

  [NotificationEvent.GENERAL_RETENTION]: (data) => ({
    userId: data.recipientId,
    title: 'اشتقنا لك! 🌟',
    message: 'هناك الكثير بانتظارك في دليل السويس. استكشف آخر المستجدات والأماكن الآن.',
    type: 'DIRECTORY',
    link: '/',
  }),

  [NotificationEvent.SYSTEM_BROADCAST]: (data) => ({
    userId: 'all',
    title: data.title,
    message: data.message,
    type: 'SYSTEM',
    link: data.link || '/',
  }),
  [NotificationEvent.MILESTONE_REACHED]: (data) => ({
    userId: data.recipientId,
    title: 'مبروك! وصول جديد 🚀',
    message: `وصل "${data.contentName}" إلى ${data.milestone} مشاهدة. استمر في التألق!`,
    type: 'MILESTONE',
    link: data.link,
  }),
  [NotificationEvent.DAILY_RECAP]: (data) => ({
    userId: data.recipientId,
    title: 'ملخص نشاطك اليومي 📊',
    message: `حصلت منشوراتك على ${data.newViews} مشاهدة جديدة${data.newLikes > 0 ? ` و ${data.newLikes} إعجاب` : ''} خلال الـ 24 ساعة الماضية.`,
    type: 'RECAP',
    link: '/profile',
  }),
  [NotificationEvent.CONTENT_RETENTION]: (data) => ({
    userId: data.recipientId,
    title: 'اشتقنا لك في دليل السويس! 👋',
    message: `شوف رائج اليوم وما فاتك من أخبار: "${data.trendingTitle}"`,
    type: 'RETENTION',
    link: data.trendingLink,
  }),
  [NotificationEvent.FRIDAY_BLESSING]: (data) => ({
    userId: data.recipientId,
    title: 'جمعة مباركة! ✨',
    message: 'نتمنى لك يوماً سعيداً ومليئاً بالخير في بلدنا الحبيبة.',
    type: 'BLESSING',
    link: '/',
  }),
};
