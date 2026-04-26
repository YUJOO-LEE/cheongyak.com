import { fetchRelatedNewsSSR } from '../lib/related-news-query';
import { RelatedNews } from './related-news';

interface RelatedNewsSectionProps {
  listingId: number;
}

/**
 * Async server-component wrapper that owns the related-news fetch.
 *
 * Kept separate from `<RelatedNews>` (a pure render component) so the
 * detail page can wrap *only this fetch* in `<Suspense>`. The rest of
 * the detail page paints the moment `/apt-sales/{id}` resolves and the
 * news section streams in afterwards — news lives at the bottom of the
 * page, so a slower endpoint can't block the user's view of the
 * apartment data.
 */
export async function RelatedNewsSection({
  listingId,
}: RelatedNewsSectionProps) {
  const items = await fetchRelatedNewsSSR(listingId);
  return <RelatedNews items={items} />;
}
