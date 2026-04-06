import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-bg-sunken mt-auto">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-label-lg text-text-secondary">청약닷컴</span>
          </div>

          <nav className="flex items-center gap-6" aria-label="푸터 링크">
            <Link
              href="/about"
              className="text-body-sm text-text-tertiary hover:text-text-secondary transition-colors duration-fast"
            >
              소개
            </Link>
            <Link
              href="/terms"
              className="text-body-sm text-text-tertiary hover:text-text-secondary transition-colors duration-fast"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-body-sm text-text-tertiary hover:text-text-secondary transition-colors duration-fast"
            >
              개인정보처리방침
            </Link>
          </nav>
        </div>

        <p className="mt-4 text-caption text-text-tertiary">
          © {new Date().getFullYear()} 청약닷컴. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
