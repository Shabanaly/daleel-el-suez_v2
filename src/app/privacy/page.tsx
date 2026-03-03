import { Metadata } from 'next';
import { ShieldCheck, Info, FileText, Copyright as CopyIcon } from 'lucide-react';

export const metadata: Metadata = {
    title: 'سياسة الخصوصية | دليل السويس',
    description: 'تعرف على سياسة الخصوصية وكيفية حماية بياناتك في منصة دليل السويس.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-primary-hover flex items-center justify-center glow-primary shadow-lg">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary">سياسة الخصوصية</h1>
                        <p className="text-text-muted mt-1">آخر تحديث: مارس 2026</p>
                    </div>
                </div>

                <div className="bg-surface rounded-3xl p-8 border border-border-subtle shadow-sm space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">1. مقدمة</h2>
                        <p className="text-text-secondary leading-relaxed">
                            هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">2. جمع البيانات</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك المولد استخدام أكثر من فقرة لتلبية احتياجاتك.
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed">
                            <li>البيانات الشخصية التي تقدمها طواعية.</li>
                            <li>بيانات الاستخدام ومعلومات الجهاز.</li>
                            <li>معلومات الموقع الجغرافي عند تفعيلها.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">3. استخدام البيانات</h2>
                        <p className="text-text-secondary leading-relaxed">
                            يتم استخدام البيانات المجمعة لتحسين تجربة المستخدم، وتوفير خدمات مخصصة، والتواصل معك بشأن التحديثات أو التغييرات في الخدمة.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">4. مشاركة البيانات</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نحن لا نقوم ببيع أو تأجير بياناتك الشخصية لأطراف ثالثة. قد نشارك بعض البيانات مع مقدمي خدمات معتمدين لغرض تشغيل المنصة.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
