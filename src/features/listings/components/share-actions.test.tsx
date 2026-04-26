/**
 * Pins the listing-detail share section behavior:
 *   1. Two buttons render (URL copy + KakaoTalk).
 *   2. Click on URL copy invokes navigator.clipboard.writeText with the
 *      exact URL prop, swaps the label to "복사됨" + role=status, then
 *      reverts to "URL 복사" after RESET_AFTER_MS (2s).
 *   3. Clipboard rejection swaps the label to "복사 실패".
 *   4. KakaoTalk button is a stub in Phase 1 — clicking it does not throw
 *      and does not navigate.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { ShareActions } from './share-actions';

const SAMPLE_URL = 'https://cheongyak.com/listings/123';
const SAMPLE_TITLE = '테스트 청약';
const SAMPLE_DESCRIPTION = '서울 강남구 · 2026.05.01–05.05';
const SAMPLE_IMAGE = 'https://cheongyak.com/og?title=test';

const sampleProps = {
  url: SAMPLE_URL,
  title: SAMPLE_TITLE,
  description: SAMPLE_DESCRIPTION,
  imageUrl: SAMPLE_IMAGE,
};

describe('ShareActions', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders both share buttons', () => {
    render(<ShareActions {...sampleProps} />);

    expect(
      screen.getByRole('button', { name: '이 페이지의 URL 복사' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '카카오톡으로 공유' }),
    ).toBeTruthy();
  });

  it('copies the URL prop and swaps to the success state, then reverts after 2s', async () => {
    render(<ShareActions {...sampleProps} />);

    const copyBtn = screen.getByRole('button', { name: '이 페이지의 URL 복사' });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeText).toHaveBeenCalledWith(SAMPLE_URL);
    expect(screen.getByText('복사됨')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain(
      'URL이 복사되었습니다',
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('URL 복사')).toBeTruthy();
    expect(screen.getByRole('status').textContent ?? '').toBe('');
  });

  it('shows the error state when clipboard.writeText rejects and the legacy fallback also fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const execSpy = vi.fn(() => false);
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      writable: true,
      value: execSpy,
    });

    render(<ShareActions {...sampleProps} />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: '이 페이지의 URL 복사' }),
      );
    });

    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(screen.getByText('복사 실패')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain(
      'URL 복사에 실패했습니다',
    );
  });

  it('invokes Kakao.Share.sendDefault with the feed payload when SDK is initialized', async () => {
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY = 'test-key';
    const sendDefault = vi.fn();
    Object.defineProperty(window, 'Kakao', {
      configurable: true,
      writable: true,
      value: {
        init: vi.fn(),
        isInitialized: () => true,
        Share: { sendDefault },
      },
    });

    render(<ShareActions {...sampleProps} />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: '카카오톡으로 공유' }),
      );
    });

    expect(sendDefault).toHaveBeenCalledTimes(1);
    expect(sendDefault.mock.calls[0][0]).toMatchObject({
      objectType: 'feed',
      content: {
        title: SAMPLE_TITLE,
        description: SAMPLE_DESCRIPTION,
        imageUrl: SAMPLE_IMAGE,
        link: { mobileWebUrl: SAMPLE_URL, webUrl: SAMPLE_URL },
      },
    });
    expect(writeText).not.toHaveBeenCalled();

    delete (window as { Kakao?: unknown }).Kakao;
    delete process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  });

  it('kakao click is a silent no-op when the JS key is missing', async () => {
    delete process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    const sendDefault = vi.fn();
    Object.defineProperty(window, 'Kakao', {
      configurable: true,
      writable: true,
      value: {
        init: vi.fn(),
        isInitialized: () => false,
        Share: { sendDefault },
      },
    });

    render(<ShareActions {...sampleProps} />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: '카카오톡으로 공유' }),
      );
    });

    expect(sendDefault).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();

    delete (window as { Kakao?: unknown }).Kakao;
  });
});
