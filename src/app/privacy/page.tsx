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
                            في "دليل السويس"، نعتبر خصوصيتك أمانة غالية. تهدف هذه السياسة إلى توضيح كيف نجمع ونستخدم ونحمي بياناتك الشخصية عند استخدامك لمنصتنا. التزامنا هو الحفاظ على أعلى معايير الشفافية والأمان لضمان تجربة مستخدم آمنة وموثوقة لجميع أبناء السويس.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">2. البيانات التي نجمعها</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            نحن نجمع فقط البيانات الضرورية لتقديم خدمة متميزة لك وتسهيل وصولك للمعلومات:
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed pr-4 border-r-2 border-primary/20">
                            <li>بيانات الحساب: مثل الاسم، البريد الإلكتروني، أو رقم الهاتف عند التسجيل.</li>
                            <li>بيانات السوق (الماركت): المعلومات والصور التي ترفعها لعرض منتجاتك للبيع.</li>
                            <li>معلومات الموقع: نستخدم موقعك الجغرافي (بموافقتك) لنقترح عليك أقرب الأماكن والمنتجات.</li>
                            <li>إشعارات الدفع: نجمع "توكن" الجهاز لإرسال تنبيهات هامة حول منشوراتك أو تحديثات الأماكن القريبة.</li>
                            <li>بيانات الاستخدام: معلومات تقنية حول كيفية تفاعلك مع التطبيق لتحسين أدائه.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">3. كيف نستخدم بياناتك</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نستخدم المعلومات التي نجمعها لتخصيص تجربتك، وتوفير نتائج بحث ذكية دقيقة، وإرسال تنبيهات تهمك، بالإضافة إلى تحسين جودة المحتوى والخدمات المقدمة في الدليل بناءً على تفضيلات المستخدمين.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">4. حماية ومشاركة البيانات</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نلتزم بصرامة بعدم بيع أو تأجير بياناتك الشخصية لأطراف ثالثة. يرجى العلم أن المعلومات التي تختار نشرها في "سوق السويس" أو "المجتمع" (مثل تفاصيل المنتج أو اسمك العلني) ستكون متاحة للجمهور لتمكين التواصل معك. قد نشارك معلومات مجهولة الهوية لغرض التحليل الإحصائي، أو المعلومات الضرورية مع مزودي الخدمات المعتمدين لضمان جودة الخدمة.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
