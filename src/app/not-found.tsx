'use client';

import { MapPinOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, ErrorNotice } from '@/shared/components';

export default function NotFound() {
  const router = useRouter();
  // Avoid wrapping <Button> in <Link> — that produces invalid
  // <a><button>...</button></a> markup which breaks alignment.
  // router.push() preserves SPA navigation; the trade-off is no
  // middle-click open-in-new-tab, which is acceptable for a 404.
  return (
    <ErrorNotice
      title="요청하신 페이지를 찾을 수 없어요"
      description="주소가 정확한지 확인하시거나 홈에서 다시 탐색해 주세요."
      icon={MapPinOff}
      action={
        <Button
          variant="secondary"
          size="md"
          onClick={() => router.push('/')}
        >
          홈으로 돌아가기
        </Button>
      }
    />
  );
}
