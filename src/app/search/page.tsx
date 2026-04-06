import type { Metadata } from 'next';
import { SearchPageClient } from '@/features/search/components/search-page-client';

export const metadata: Metadata = {
  title: '검색',
  description: '청약 정보와 뉴스를 검색하세요.',
};

export default function SearchPage() {
  return <SearchPageClient />;
}
