import Link from 'next/link';
import { Button } from '@/shared/components';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-display-lg text-text-primary mb-4">404</h1>
      <p className="text-body-lg text-text-secondary mb-8">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link href="/" prefetch={false}>
        <Button variant="primary" size="lg">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
