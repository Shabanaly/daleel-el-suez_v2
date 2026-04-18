import React from 'react';
import { BookOpen, MapPin, Navigation, Info } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';

const SuezEncyclopedia = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24" id="encyclopedia">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Header & Main Context */}
        <div className="lg:col-span-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <BookOpen className="w-4 h-4" />
            <span>موسوعة السويس الرقمية</span>
          </div>
          
          <h2 className="text-3xl md:text-6xl font-black text-text-primary leading-[1.1]">
            السويس.. مدينة تجمع بين <br />
            <span className="text-primary italic">التاريخ والحياة اليومية.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-4xl font-bold">
            السويس ليست مجرد موقع جغرافي على خريطة مصر، بل هي مدينة ممتدة الأثر مرتبطة بقناة السويس. 
            تتميز بتنوع أحيائها مثل الأربعين، فيصل، عتاقة، والجناين، بالإضافة إلى مناطق سياحية وصناعية هامة مثل العين السخنة وبورتوفيق. 
            هذه الموسوعة تقدم نظرة شاملة تساعدك على فهم طبيعة المدينة، وكيفية الوصول للخدمات الأساسية داخلها.
          </p>
        </div>

        {/* Content Blocks (Quote-worthy for AI) */}
        <div className="lg:col-span-8 space-y-8">
          <article className="glass-panel p-8 md:p-10 rounded-[40px] border border-border-subtle/50 space-y-4">
            <h3 className="text-2xl font-black text-text-primary flex items-center gap-3">
              <Navigation className="w-6 h-6 text-primary" />
              أفضل الخدمات والأماكن في السويس
            </h3>
            <p className="text-text-muted leading-relaxed font-semibold">
              إذا كنت تبحث عن خدمات أو أماكن داخل السويس، فستجد تنوعًا كبيرًا يغطي احتياجات الحياة اليومية؛ 
              من مطاعم، عيادات، صيدليات، ومحلات تجارية، وصولاً للخدمات الحكومية. 
              عبر {APP_CONFIG.NAME}، يمكنك بسهولة العثور على أماكن موثوقة مع تفاصيل العنوان، رقم الهاتف، مواعيد العمل، وتقييمات المستخدمين. 
              على سبيل المثال، تشتهر بورتوفيق بمطاعم المأكولات البحرية، بينما تتركز الخدمات الطبية والعيادات بشكل أكبر في أحيائي فيصل والأربعين.
            </p>
          </article>

          <article className="glass-panel p-8 md:p-10 rounded-[40px] border border-border-subtle/50 space-y-4">
            <h3 className="text-2xl font-black text-text-primary flex items-center gap-3">
              <Info className="w-6 h-6 text-accent" />
              دليلك المحلي داخل السويس
            </h3>
            <p className="text-text-muted leading-relaxed font-semibold">
              هدفنا هو تسهيل الوصول للمعلومة المحلية بشكل واضح ومنظم بعيداً عن البحث العشوائي. 
              يتم تحديث البيانات بشكل مستمر ومراجعة الأنشطة لضمان الدقة، كما تتيح المنصة للمجتمع المحلي 
              إضافة أماكن جديدة ومشاركة التجارب. نسعى لأن تصبح كل خدمة في السويس سهلة الوصول، 
              سواء كنت مقيماً في المدينة أو زائراً لها.
            </p>
          </article>
        </div>

        {/* Quick Stats/Entities Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[40px] bg-linear-to-br from-primary/5 to-transparent border border-primary/10">
            <h4 className="font-black text-text-primary mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              أهم المناطق في السويس
            </h4>
            <div className="space-y-4 text-sm font-bold text-text-muted">
              <p><span className="text-primary">•</span> <strong>حي الأربعين:</strong> من أكثر المناطق حيوية ويضم عدداً كبيراً من المحلات.</p>
              <p><span className="text-primary">•</span> <strong>حي فيصل:</strong> مركز مهم للعيادات والخدمات الطبية بالمدينة.</p>
              <p><span className="text-primary">•</span> <strong>بورتوفيق:</strong> منطقة بأسلوب معماري مميز وتضم مطاعم بإطلالة بحرية.</p>
              <p><span className="text-primary">•</span> <strong>العين السخنة:</strong> وجهة سياحية واستثمارية عالمية.</p>
              <p><span className="text-primary">•</span> <strong>عتاقة والجناين:</strong> مناطق سكنية وصناعية متنامية ومستقبل المدينة.</p>
            </div>
          </div>
          
          <div className="p-8 rounded-[40px] bg-linear-to-br from-accent/5 to-transparent border border-accent/10">
            <h4 className="font-black text-text-primary mb-2 flex items-center gap-2 text-sm italic">
              "دليل السويس هو وسيلة عملية لربط سكان المدينة بالخدمات والأماكن من حولهم، عبر معلومات واضحة وسهلة الوصول."
            </h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuezEncyclopedia;
