# Design System - دليل السويس

> هذا الملف هو المرجع الوحيد للتصميم. أي AI يشتغل على المشروع لازم يلتزم بيه.

---

## 🎨 الألوان (Colors)

### اللون الرئيسي - Sapphire Sky (أزرق)
```css
--color-primary-50:  #e6f2fe;
--color-primary-100: #cee5fd;
--color-primary-200: #9ccafc;
--color-primary-300: #6bb0fa;
--color-primary-400: #3996f9;
--color-primary-500: #087cf7;  /* اللون الرئيسي */
--color-primary-600: #0663c6;  /* hover */
--color-primary-700: #054a94;
--color-primary-800: #033163;
--color-primary-900: #021931;
--color-primary-950: #011123;
```

### ألوان الخلفية - Dark Mode
```css
--color-bg-background:    #0a0f1e;   /* خلفية الصفحة الرئيسية */
--color-bg-surface: #111827;   /* خلفية الكاردات */
--color-bg-elevated:#1e2a3a;   /* كاردات أعلى */
```

### ألوان النصوص
```css
--color-text-primary:   #f0f4f8;  /* النص الرئيسي */
--color-text-secondary: #94a3b8;  /* النص الثانوي */
--color-text-muted:     #475569;  /* نص خافت */
```

### ألوان الحالات
```css
--color-success: #22c55e;  /* نجاح */
--color-warning: #f59e0b;  /* تحذير / مميز */
--color-error:   #ef4444;  /* خطأ */
--color-info:    #087cf7;  /* معلومة */
```

---

## ✍️ الخطوط (Typography)

```css
/* من Google Fonts */
--font-arabic: 'Cairo', sans-serif;   /* كل النصوص العربية */
--font-latin:  'Inter', sans-serif;   /* الأرقام والإنجليزي */
```

### أحجام النصوص
```css
--text-xs:   0.75rem;   /* 12px - ملاحظات */
--text-sm:   0.875rem;  /* 14px - نص ثانوي */
--text-base: 1rem;      /* 16px - نص عادي */
--text-lg:   1.125rem;  /* 18px - نص كبير */
--text-xl:   1.25rem;   /* 20px - عنوان صغير */
--text-2xl:  1.5rem;    /* 24px - عنوان متوسط */
--text-3xl:  1.875rem;  /* 30px - عنوان كبير */
--text-4xl:  2.25rem;   /* 36px - hero */
```

---

## 📐 المسافات (Spacing)

```css
/* كل حاجة مضاعفة من 4px */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-6:  24px;
--space-8:  32px;
--space-12: 48px;
--space-16: 64px;
```

---

## 🔲 الحواف (Border Radius)

```css
--radius-sm:   8px;   /* أزرار صغيرة */
--radius-md:   12px;  /* كاردات */
--radius-lg:   16px;  /* modal / sheets */
--radius-xl:   24px;  /* hero sections */
--radius-full: 9999px; /* badges / pills */
```

---

## 🌟 التأثيرات (Effects)

```css
/* ظل الكاردات */
--shadow-card: 0 4px 24px rgba(8, 124, 247, 0.08);

/* ظل hover */
--shadow-hover: 0 8px 32px rgba(8, 124, 247, 0.2);

/* Glassmorphism للعناصر المهمة */
--glass-bg:     rgba(17, 24, 39, 0.8);
--glass-border: rgba(8, 124, 247, 0.2);
```

---

## 🧩 قواعد المكونات (Component Rules)

### الكارت (Card)
- خلفية: `--color-bg-surface`
- حواف: `--radius-md` (12px)
- border: `1px solid rgba(8, 124, 247, 0.15)`
- hover: يرفع لفوق مع `--shadow-hover`

### الأزرار (Buttons)
- Primary: خلفية `--color-primary-500`، نص أبيض
- Secondary: border `--color-primary-500`، خلفية شفافة
- حجم min: `height: 40px`، `padding: 0 16px`

### النافبار (Navbar)
- خلفية: Glassmorphism (`--glass-bg`)
- Sticky في أعلى الصفحة
- ارتفاع: `64px`

---

## 📱 Breakpoints

```css
--bp-mobile:  640px;
--bp-tablet:  768px;
--bp-desktop: 1024px;
--bp-wide:    1280px;
```

---

## ⚡ قواعد عامة للـ AI

1. **لا تغير الألوان** - استخدم المتغيرات دايماً
2. **Dark Mode دايماً** - الخلفية dark، النصوص فاتحة
3. **الخط Cairo** للعناصر العربية
4. **الحركة subtle** - transitions بـ 200ms-300ms بس
5. **لا placeholder images** - استخدم gradient أو icon
