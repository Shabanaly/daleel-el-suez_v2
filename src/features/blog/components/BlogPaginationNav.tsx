import CustomLink from '@/components/customLink/customLink';

function buildPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function BlogPaginationNav({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 3),
    Math.max(5, currentPage + 2)
  );

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      <CustomLink
        href={buildPageHref(basePath, currentPage - 1)}
        className={`rounded-2xl border px-5 py-3 text-sm font-black transition-all ${
          currentPage === 1
            ? 'pointer-events-none border-border-subtle bg-elevated/40 text-text-muted/50'
            : 'border-border-subtle bg-surface hover:border-primary/30 hover:text-primary'
        }`}
      >
        السابق
      </CustomLink>

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <CustomLink
            key={page}
            href={buildPageHref(basePath, page)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-black transition-all ${
              isActive
                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                : 'border-border-subtle bg-surface text-text-secondary hover:border-primary/30 hover:text-primary'
            }`}
          >
            {page}
          </CustomLink>
        );
      })}

      <CustomLink
        href={buildPageHref(basePath, currentPage + 1)}
        className={`rounded-2xl border px-5 py-3 text-sm font-black transition-all ${
          currentPage >= totalPages
            ? 'pointer-events-none border-border-subtle bg-elevated/40 text-text-muted/50'
            : 'border-border-subtle bg-surface hover:border-primary/30 hover:text-primary'
        }`}
      >
        التالي
      </CustomLink>
    </div>
  );
}
