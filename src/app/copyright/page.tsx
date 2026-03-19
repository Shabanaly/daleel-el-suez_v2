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
                            تعتبر جميع العناصر المكونة لمنصة "دليل السويس" - بما في ذلك النصوص، الجرافيكس، التصميمات البرمجية، الشعارات، وقاعدة بيانات الأماكن والخدمات - ملكية حصريّة وفكرية للمنصة أو الجهات المرخصة لها. هذا المحتوى محمي بموجب قوانين حقوق النشر والملكية الفكرية المعمول بها محلياً ودولياً.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">الاستخدام المسموح به</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            نحن نشجع على نشر الخير والمعرفة في مدينتنا، لذا نسمح بالتالي:
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed pr-4 border-r-2 border-primary/20">
                            <li>الاستخدام الشخصي والاطلاع على المعلومات للأغراض غير التجارية.</li>
                            <li>مشاركة روابط الأماكن والمنشورات على وسائل التواصل الاجتماعي لغرض النفع العام.</li>
                            <li>الاقتباس المحدود للأغراض الصحفية أو التوعوية بشرط ذكر "دليل السويس" كمصدر واضح.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">الإبلاغ عن التجاوزات</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نحن نحترم حقوق الآخرين تماماً. إذا كنت تعتقد أن أي محتوى على منصتنا ينتهك حقوق الملكية الخاصة بك، يرجى تزويدنا بالتفاصيل عبر قنوات التواصل الرسمية لدينا. سنقوم بمراجعة البلاغ واتخاذ الإجراءات اللازمة، والتي قد تشمل إزالة المحتوى المخالف في أسرع وقت ممكن.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
