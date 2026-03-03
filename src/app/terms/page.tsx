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
                            هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.
                        </p>
                        <p className="text-text-secondary leading-relaxed mt-2">
                            باستخدامك لمنصة دليل السويس، فإنك توافق التام على جميع الشروط والأحكام المذكورة هنا.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">2. حقوق الملكية الفكرية</h2>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك المولد استخدام أكثر من فقرة لتلبية احتياجاتك.
                        </p>
                        <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed">
                            <li>جميع المحتويات على هذا الموقع هي ملك حصري لدليل السويس.</li>
                            <li>يمنع استنساخ أو نقل أي جزء من الموقع بدون إذن صريح.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">3. استخدام الخدمة</h2>
                        <p className="text-text-secondary leading-relaxed">
                            يجب استخدام المنصة بشكل قانوني وللأغراض المخصصة لها فقط، وعدم التدخل بأي شكل يعطل أو يعيق الخدمات المقدمة للآخرين.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">4. التغييرات في الشروط</h2>
                        <p className="text-text-secondary leading-relaxed">
                            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. وسيتم نشر أي تعديلات على هذه الصفحة.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
