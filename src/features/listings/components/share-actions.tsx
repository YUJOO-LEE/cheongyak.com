'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { AlertCircle, Check, Link2 } from 'lucide-react';

type CopyState = 'idle' | 'copied' | 'error';

const RESET_AFTER_MS = 2000;
// Pinned Kakao SDK version. Update both URL and integrity together when bumping.
// TODO: add SRI integrity hash from https://developers.kakao.com/docs/latest/ko/javascript/getting-started
const KAKAO_SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';

interface ShareActionsProps {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoSDK {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (payload: {
      objectType: 'feed';
      content: {
        title: string;
        description: string;
        imageUrl: string;
        imageWidth?: number;
        imageHeight?: number;
        link: KakaoShareLink;
      };
      buttons?: Array<{ title: string; link: KakaoShareLink }>;
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

async function copyText(value: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall through to legacy fallback
    }
  }
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    return ok;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

let warnedMissingKey = false;

function initKakao() {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn(
        '[share] NEXT_PUBLIC_KAKAO_JS_KEY is missing — Kakao share is disabled.',
      );
    }
    return;
  }
  const sdk = window.Kakao;
  if (!sdk) return;
  if (!sdk.isInitialized()) sdk.init(key);
}

export function ShareActions({
  url,
  title,
  description,
  imageUrl,
}: ShareActionsProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // The Script tag below also calls initKakao via onLoad. This effect
    // covers the (rare) case where the SDK is already on the page from a
    // previous mount — re-init is a no-op once isInitialized() is true.
    initKakao();
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setCopyState('idle');
    }, RESET_AFTER_MS);
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(url);
    setCopyState(ok ? 'copied' : 'error');
    scheduleReset();
  }, [url, scheduleReset]);

  const handleKakao = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
      // Already warned once at mount; silent no-op per click.
      return;
    }
    const sdk = typeof window !== 'undefined' ? window.Kakao : undefined;
    if (!sdk?.isInitialized?.()) {
      // Race: button clicked before Script onLoad fired. Try once more.
      initKakao();
      if (!sdk?.isInitialized?.()) {
        console.warn('[share] kakao SDK still loading — try again shortly.');
        return;
      }
    }
    try {
      sdk.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl,
          // Match the 1:1 canvas served by `/og?ratio=kakao` so Kakao renders
          // the card without its own aspect-fit cropping.
          imageWidth: 800,
          imageHeight: 800,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: '청약 정보 보기',
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      });
    } catch (err) {
      console.warn('[share] kakao sendDefault failed', err);
    }
  }, [url, title, description, imageUrl]);

  const copyLabel =
    copyState === 'copied'
      ? '복사됨'
      : copyState === 'error'
        ? '복사 실패'
        : 'URL 복사';

  const CopyIcon =
    copyState === 'copied'
      ? Check
      : copyState === 'error'
        ? AlertCircle
        : Link2;

  const rowClassName = [
    'group flex items-center gap-3 px-4 py-3 rounded-lg w-full cursor-pointer',
    'transition-all duration-fast ease-default',
    'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm',
    'bg-button-secondary hover:bg-button-secondary-hover',
  ].join(' ');

  return (
    <div className="flex flex-col gap-2">
      <Script
        id="kakao-sdk"
        src={KAKAO_SDK_SRC}
        strategy="lazyOnload"
        crossOrigin="anonymous"
        onLoad={initKakao}
      />
      <button
        type="button"
        onClick={handleCopy}
        className={[
          rowClassName,
          copyState === 'idle' ? 'text-text-primary' : 'text-text-secondary',
        ].join(' ')}
        aria-label="이 페이지의 URL 복사"
      >
        <CopyIcon size={20} aria-hidden="true" className="shrink-0" />
        <span className="text-label-lg truncate">{copyLabel}</span>
      </button>

      <button
        type="button"
        onClick={handleKakao}
        // TODO: [DESIGN_TOKEN_NEEDED] vendor-kakao-yellow / vendor-kakao-yellow-hover
        // — Kakao 브랜드 가이드 색상. DESIGN.md 토큰 시스템 확장 필요.
        className={[
          'group flex items-center gap-3 px-4 py-3 rounded-lg w-full cursor-pointer',
          'transition-all duration-fast ease-default',
          'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm',
          'bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919]',
        ].join(' ')}
        aria-label="카카오톡으로 공유"
      >
        <KakaoTalkIcon />
        <span className="text-label-lg truncate">카카오톡으로 공유</span>
      </button>

      <span className="sr-only" aria-live="polite" role="status">
        {copyState === 'copied'
          ? 'URL이 복사되었습니다'
          : copyState === 'error'
            ? 'URL 복사에 실패했습니다'
            : ''}
      </span>
    </div>
  );
}

function KakaoTalkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.86 5.33 4.66 6.74-.2.7-.74 2.6-.84 3-.13.5.18.5.38.36.16-.11 2.52-1.71 3.54-2.4.74.1 1.5.16 2.26.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    </svg>
  );
}
