import { ExternalLink } from 'lucide-react';
import { formatRelativeDate } from '@/shared/lib/format';
import type { RelatedNewsItem } from '@/shared/types/api';

interface RelatedNewsProps {
  items: RelatedNewsItem[];
}

export function RelatedNews({ items }: RelatedNewsProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="mb-8"
      aria-labelledby="related-news-heading"
      data-testid="related-news"
    >
      <h2
        id="related-news-heading"
        className="text-headline-lg text-text-primary mb-4"
      >
        관련 뉴스
      </h2>
      <div className="bg-bg-card rounded-lg p-3 md:p-4">
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.outlet} – ${item.title} (새 창에서 열림)`}
                className="group flex items-start gap-3 px-3 py-3 rounded-md transition-all duration-fast ease-default hover:bg-bg-sunken active:bg-bg-active active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-caption text-text-tertiary">
                    <span className="inline-flex items-center gap-0.5">
                      <span>{item.outlet}</span>
                      {/* Touch devices: small inline new-tab cue tucked
                          next to the outlet — keeps the row visually
                          quiet while still signalling external nav,
                          since `:hover` never fires on coarse pointers
                          to surface the right-side icon. */}
                      <ExternalLink
                        size={12}
                        aria-hidden="true"
                        className="hidden pointer-coarse:inline-block shrink-0 -translate-y-px text-text-tertiary group-hover:text-brand-primary-500 transition-colors duration-fast"
                      />
                    </span>
                    {item.publishedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <time dateTime={item.publishedAt}>
                          {formatRelativeDate(item.publishedAt)}
                        </time>
                      </>
                    )}
                  </div>
                  <p className="text-body-md text-text-primary line-clamp-2 mt-0.5 group-hover:text-brand-primary-500 transition-colors duration-fast">
                    {item.title}
                  </p>
                </div>
                {/* Hover-capable devices: full-size icon at the row's
                    right edge revealed only on hover/focus-visible. */}
                <ExternalLink
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 mt-1 text-text-tertiary group-hover:text-brand-primary-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:hidden transition-all duration-fast"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
