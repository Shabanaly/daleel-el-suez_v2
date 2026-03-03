import { Metadata } from 'next';
import { Info } from 'lucide-react';

export const metadata: Metadata = {
    title: 'عن الدليل | دليل السويس',
    description: 'تعرف على مشروع دليل السويس، أهدافنا، ورؤيتنا لتسهيل الوصول للخدمات في مدينتك.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-primary-hover flex items-center justify-center glow-primary shadow-lg">
                        <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary">عن الدليل</h1>
                        <p className="text-text-muted mt-1">مشروع لربط أبناء السويس بخدمات مدينتهم</p>
                    </div>
                </div>

                <div className="bg-surface rounded-3xl p-8 border border-border-subtle shadow-sm space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">قصتنا</h2>
                        <p className="text-text-secondary leading-relaxed">
                            هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">رؤيتنا</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك المولد استخدام أكثر من فقرة لتلبية احتياجاتك.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">مهمتنا</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            تقديم منصة رقمية متطورة وسهلة الاستخدام تجمع كافة الأماكن الخدمية والتجارية في السويس.
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed">
                            <li>توفير معلومات دقيقة ومحدثة.</li>
                            <li>دعم الأعمال المحلية وتسهيل الوصول إليها.</li>
                            <li>خلق مجتمع متفاعل وداعم داخل المدينة.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
}
