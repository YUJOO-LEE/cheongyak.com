import Image from 'next/image';

/**
 * Inline bootstrap layer rendered by `app/layout.tsx` before the app
 * hydrates. `<AppReadyMarker />` flips `body[data-app-ready]` on mount,
 * which triggers the fade-out defined in `globals.css`.
 */
export function AppSplash() {
  return (
    <div id="app-splash" role="status" aria-live="polite" aria-busy="true">
      <div
        className="flex items-center gap-2 animate-pulse-soft"
        aria-hidden="true"
      >
        <Image src="/logo.svg" alt="" width={32} height={28} priority />
        <span className="text-headline-lg text-brand-primary-500">
          청약닷컴
        </span>
      </div>
      <span className="sr-only">페이지를 불러오는 중입니다</span>
    </div>
  );
}
