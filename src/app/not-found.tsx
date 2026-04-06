import CustomLink from '@/components/customLink/customLink';

export default function NotFound() {
  return (
    <main className="grid min-h-[80vh] place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-text-primary sm:text-7xl">
          الصفحة غير موجودة
        </h1>
        <p className="mt-6 text-lg font-medium text-text-muted sm:text-xl/8">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون حذفت أو تم نقلها.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xs hover:scale-105 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
          >
            العودة للرئيسية
          </a>
          <a href="/contact" className="text-sm font-bold text-text-primary hover:text-primary transition-colors">
            تواصل مع الدعم <span aria-hidden="true">&larr;</span>
          </a>
        </div>
      </div>
    </main>
  )
}

