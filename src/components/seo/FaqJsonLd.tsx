import React from 'react';

export default function FaqJsonLd() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ما هو دليل السويس؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "دليل السويس هو المنصة الأولى والشاملة لاكتشاف أفضل الأماكن، الخدمات، الأنشطة التجارية، والوظائف في محافظة السويس. يهدف لتسهيل الوصول للمعلومات الموثوقة لأهل السويس وزوارها."
        }
      },
      {
        "@type": "Question",
        "name": "كيف يمكنني إضافة نشاطي التجاري في دليل السويس؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "يمكنك إضافة نشاطك التجاري مجاناً من خلال النقر على زر 'أضف مكانك' في القائمة، وملء بيانات النشاط مثل الاسم، العنوان، ورقم الهاتف."
        }
      },
      {
        "@type": "Question",
        "name": "هل خدمات دليل السويس مجانية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، البحث عن الأماكن وتصفح الوظائف وإضافة الأنشطة التجارية الأساسية في الدليل هي خدمات مجانية تماماً لدعم المجتمع السويسي."
        }
      },
      {
        "@type": "Question",
        "name": "ما هي الأقسام المتوفرة في دليل السويس؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "يضم الدليل أقساماً متنوعة تشمل: المطاعم والكافيهات، الأطباء والعيادات، الخدمات الحكومية، المحلات التجارية، الوظائف، وسوق السويس للمستعمل."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
