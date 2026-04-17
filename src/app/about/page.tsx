import { Metadata } from 'next';
import { Info } from 'lucide-react';

export const metadata: Metadata = {
    title: 'قصتنا ورؤيتنا - تعرف على دليل السويس',
    description: 'اكتشف قصة دليل السويس، أهدافنا، ورؤيتنا لتطوير الخدمات الرقمية في مدينة السويس. دليلك الأول لكل ما تحتاجه في السويس.',
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
                            بدأت فكرة &quot;دليل السويس&quot; من حاجة بسيطة ولكن ملحة: كيف يمكننا الوصول إلى أفضل الخدمات والأماكن في مدينتنا الجميلة بسهولة وبثقة؟ اليوم، تحول هذا الحلم إلى منصة رقمية متكاملة تهدف إلى أن تكون الرفيق الأول لكل سويسي، سواء كان يبحث عن مطعم مميز، طبيب ماهر، أو حتى مكاناً للاستجمام.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">رؤيتنا</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            نطمح لأن نكون المحرك الرقمي الأول في السويس، حيث نجمع بين التكنولوجيا الحديثة وروح المجتمع المحلي. رؤيتنا هي جعل كل ركن في السويس &quot;على بُعد لمسة واحدة&quot;، مما يسهل الحياة اليومية ويدعم الاقتصاد المحلي للمدينة.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">مهمتنا</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            نلتزم بتقديم منصة ذكية، شفافة، وسهلة الاستخدام تجمع كافة الأماكن الخدمية والتجارية، مع ضمان دقة المعلومات وتوفير مساحة آمنة للمجتمع لمشاركة تجاربه.
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed pr-4 border-r-2 border-primary/20">
                            <li>توفير قاعدة بيانات شاملة ومحدثة لكل أماكن السويس.</li>
                            <li>دعم أصحاب الأعمال المحلية عبر وصلهم بجمهورهم المستهدف.</li>
                            <li>بناء مجتمع متفاعل يتبادل الخبرات والنصائح بكل صدق.</li>
                            <li>تمكين التجارة المحلية عبر &quot;سوق السويس&quot; لبيع وشراء المنتجات بسهولة.</li>
                            <li>استخدام الذكاء الاصطناعي (البحث الذكي) لتسهيل العثور على ما تحتاجه بدقة.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
}
