import { Place } from '../types/places';

export const ALL_PLACES: Place[] = [
    {
        id: '1',
        name: 'مطعم السي فود',
        category: 'مطاعم',
        rating: 4.8,
        reviews: 312,
        area: 'بورتوفيق',
        color: 'from-primary-600 to-primary-800',
        icon: '🍽️',
        tags: ['مأكولات بحرية', 'عائلي'],
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2000&auto=format&fit=crop',
        address: 'شارع الشهداء، أمام ممشى بورتوفيق، السويس',
        phoneNumber: '01012345678',
        isVerified: true,
        openHours: '12:00 PM - 02:00 AM',
        description: 'أفضل مطعم مأكولات بحرية في السويس، يتميز بإطلالة مباشرة على المجرى الملاحي لقناة السويس.'
    },
    {
        id: '2',
        name: 'كافيه الكورنيش',
        category: 'كافيهات',
        rating: 4.5,
        reviews: 187,
        area: 'الكورنيش الجديد',
        color: 'from-accent to-primary-600',
        icon: '☕',
        tags: ['كافيه', 'إطلالة بحرية'],
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2000&auto=format&fit=crop',
        address: 'طريق الكورنيش الجديد، السويس',
        phoneNumber: '01112223334',
        isVerified: true,
        openHours: '08:00 AM - 01:00 AM',
        description: 'مكان هادئ ومميز لتناول قهوتك المفضلة مع الاستمتاع بنسيم البحر.'
    },
    {
        id: '3',
        name: 'مساحة عمل كريتيف',
        category: 'خدمات',
        rating: 4.9,
        reviews: 94,
        area: 'الأربعين',
        color: 'from-primary-700 to-primary-900',
        icon: '🔧',
        tags: ['ورك سبيس', 'أعمال'],
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop',
        address: 'شارع الجيش، حي الأربعين، السويس',
        phoneNumber: '01223334445',
        isVerified: false,
        openHours: '09:00 AM - 10:00 PM',
        description: 'بيئة عمل محفزة للإبداع والابتكار، توفر كافة الخدمات اللوجستية للشركات الناشئة.'
    },
    {
        id: '4',
        name: 'هايبر السويس',
        category: 'سوبر ماركت',
        rating: 4.2,
        reviews: 543,
        area: 'السلام 1',
        color: 'from-emerald-600 to-teal-800',
        icon: '🛒',
        tags: ['تسوق', 'يومي'],
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2000&auto=format&fit=crop',
        address: 'مدينة السلام، خلف أكاديمية السويس، السويس',
        phoneNumber: '16555',
        isVerified: true,
        openHours: '24 ساعة',
        description: 'أكبر مركز للتسوق في مدينة السويس يوفر كافة السلع الاستهلاكية.'
    }
];

export const CATEGORIES = ['الكل', 'مطاعم', 'كافيهات', 'سوبر ماركت', 'صيدليات', 'بنوك', 'مستشفيات', 'ترفيه', 'خدمات'];
export const AREAS = ['كل المناطق', 'بورتوفيق', 'الكورنيش الجديد', 'الأربعين', 'حي فيصل', 'السلام 1', 'حي السويس', 'حي عتاقة', 'حي الجناين'];
export const SORT_OPTIONS = [
    { value: 'rating', label: 'الأعلى تقييماً' },
    { value: 'reviews', label: 'الأكثر تقييمات' },
    { value: 'name', label: 'أبجدياً' },
];
