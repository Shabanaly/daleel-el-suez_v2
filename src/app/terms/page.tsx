import { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'الشروط والأحكام | دليل السويس',
    description: 'اقرأ الشروط والأحكام الخاصة باستخدام منصة دليل السويس.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-primary-hover flex items-center justify-center glow-primary shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary">الشروط والأحكام</h1>
                        <p className="text-text-muted mt-1">آخر تحديث: مارس 2026</p>
                    </div>
                </div>

                <div className="bg-surface rounded-3xl p-8 border border-border-subtle shadow-sm space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">1. قبول الشروط</h2>
                        <p className="text-text-secondary leading-relaxed">
                            باستخدامك لمنصة &quot;دليل السويس&quot;، أنت تقر بموافقتك الكاملة على هذه الشروط والأحكام. تم تصميم هذه القواعد لضمان بيئة آمنة ومفيدة لجميع المستخدمين في مدينة السويس، وهي ملزمة لكل من يصل إلى الخدمة عبر الموقع أو التطبيق.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">2. حقوق الملكية الفكرية</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            تحترم المنصة الإبداع وتحمي حقوقها وحقوق الآخرين:
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed pr-4 border-r-2 border-primary/20">
                            <li>جميع محتويات المنصة من نصوص، تصميمات، وقاعدة بيانات الأماكن هي ملك حصري لـ &quot;دليل السويس&quot;.</li>
                            <li>يُمنع منعاً باتاً استنساخ أو كشط أو إعادة استخدام البيانات المنشورة لأغراض تجارية دون إذن كتابي مسبق.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">3. مسؤولية المحتوى والمجتمع</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نحن نشجع على التفاعل ولكن بمسؤولية. أنت مسؤول بالكامل عن أي محتوى (تعليقات، منشورات، صور) تنشره في المجتمع. يمنع نشر محتوى مضلل، مسيء للآخرين، أو ينتهك خصوصية أي فرد أو جهة. نحتفظ بالحق في إزالة أي محتوى يخالف هذه السياسة دون سابق إنذار.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">4. التعديلات وإخلاء المسؤولية</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نحن نسعى دائماً لتطوير &quot;دليل السويس&quot;، لذا قد نقوم بتعديل هذه الشروط في أي وقت لتناسب التحديثات الجديدة. كما نخلي مسؤوليتنا عن أي معلومات غير دقيقة يتم تقديمها من قبل أطراف ثالثة (مثل مراجعات المستخدمين)، ولكننا نلتزم بالتحقق وتصحيح أي بلاغات تصلنا.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">5. سوق السويس (الماركت)</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            يوفر &quot;دليل السويس&quot; مساحة للمستخدمين لعرض سلعهم، ولكن يرجى العلم بما يلي:
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed pr-4 border-r-2 border-primary/20">
                            <li>المنصة هي مجرد وسيط للعرض؛ أي عملية بيع أو شراء تتم هي مسؤولية كاملة بين البائع والمشتري.</li>
                            <li>يُمنع منعاً باتاً عرض سلع غير قانونية، مقلدة، أو مخالفة للآداب العامة والشرع.</li>
                            <li>ننصح دائماً بإتمام المعاملات في أماكن عامة ومعروفة في السويس لضمان أمان الطرفين.</li>
                            <li>نحتفظ بالحق في حذف أي إعلان نراه مضللاً أو مخالفاً لسياسة المنصة.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
}
