import { Metadata } from 'next';
import { Copyright as CopyIcon } from 'lucide-react';

export const metadata: Metadata = {
    title: 'حقوق النشر | دليل السويس',
    description: 'معلومات حول حقوق النشر والملكية الفكرية لمحتوى دليل السويس.',
};

export default function CopyrightPage() {
    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-primary-hover flex items-center justify-center glow-primary shadow-lg">
                        <CopyIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary">حقوق النشر</h1>
                        <p className="text-text-muted mt-1">آخر تحديث: مارس 2026</p>
                    </div>
                </div>

                <div className="bg-surface rounded-3xl p-8 border border-border-subtle shadow-sm space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">ملكية المحتوى</h2>
                        <p className="text-text-secondary leading-relaxed">
                            هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.
                        </p>
                        <p className="text-text-secondary leading-relaxed mt-2">
                            جميع المحتويات المنشورة على دليل السويس، بما في ذلك النصوص، الجرافيكس، التصميمات، الشعارات والبيانات هي مملوكة بالكامل لدليل السويس أو للمرخصين لها، ومحمية بموجب قوانين حقوق النشر المحلية والدولية.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">الاستخدام المسموح</h2>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed mb-4">
                            <li>الاستخدام الشخصي وغير التجاري.</li>
                            <li>مشاركة الروابط الأصلية على وسائل التواصل الاجتماعي بحسن نية.</li>
                        </ul>
                        <p className="text-text-secondary leading-relaxed">
                            يتطلب أي استخدام آخر إذنًا كتابيًا صريحًا من إدارة دليل السويس.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">الإبلاغ عن الانتهاكات</h2>
                        <p className="text-text-secondary leading-relaxed">
                            إذا كنت تعتقد أن هناك محتوى متوفر على المنصة ينتهك حقوق الملكية الفكرية الخاصة بك، يُرجى التواصل معنا عبر البريد الإلكتروني الرسمي لكي يتم اتخاذ الإجراء المناسب في أقرب وقت.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
