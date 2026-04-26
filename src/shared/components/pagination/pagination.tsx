import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseHref: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseHref,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const separator = baseHref.includes('?') ? '&' : '?';

  function pageHref(page: number) {
    return page === 1 ? baseHref : `${baseHref}${separator}page=${page}`;
  }

  return (
    <nav aria-label="페이지 탐색" className={['flex items-center justify-center gap-0.5 sm:gap-1', className].join(' ')}>
      <PaginationLink
        href={currentPage > 1 ? pageHref(currentPage - 1) : undefined}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </PaginationLink>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-text-tertiary text-body-md">
            ...
          </span>
        ) : (
          <PaginationLink
            key={page}
            href={pageHref(page as number)}
            active={page === currentPage}
            aria-label={`${page}페이지`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </PaginationLink>
        ),
      )}

      <PaginationLink
        href={currentPage < totalPages ? pageHref(currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </PaginationLink>
    </nav>
  );
}

interface PaginationLinkProps {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}

function PaginationLink({
  href,
  active,
  disabled,
  children,
  ...props
}: PaginationLinkProps) {
  const baseClass = [
    'inline-flex items-center justify-center',
    'min-w-8 h-8 sm:min-w-10 sm:h-10 rounded-md',
    'text-body-md transition-all duration-fast ease-default',
  ].join(' ');

  if (disabled || !href) {
    return (
      <span className={[baseClass, 'text-text-disabled cursor-not-allowed'].join(' ')} {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      // Pagination is a list of entry links into the same paginated route.
      // Default prefetch would fan out one RSC request per visible page
      // number, each one re-running the route's Server Component and
      // hitting the backend for that page's data. See CLAUDE.md §14.
      prefetch={false}
      className={[
        baseClass,
        active
          ? 'bg-brand-primary-500 text-text-inverse font-semibold scale-[1.05]'
          : 'text-text-secondary hover:bg-bg-hover hover:scale-105 active:scale-95',
      ].join(' ')}
      {...props}
    >
      {children}
    </Link>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export type { PaginationProps };
