-- 1. إضافة عمود الحالة إلى جدول الأماكن بقيمة افتراضية "معلق"
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 2. تحديث جميع الأماكن القديمة لتصبح حالتها "مقبولة" كما طلبت
UPDATE public.places
SET status = 'approved'
WHERE status = 'pending' OR status IS NULL;

-- 3. إنشاء الفهرس (Index) لعمود الحالة لتسريع عملية الفلترة والبحث
CREATE INDEX IF NOT EXISTS idx_places_status ON public.places(status);

-- 4. (اختياري) إضافة قيد للتأكد من أن الحالات المدخلة صحيحة فقط
ALTER TABLE public.places 
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'));
