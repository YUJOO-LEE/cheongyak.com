/**
 * E2E coverage for the listing-detail share section.
 *
 * Critical user flow:
 *   1. From the public listings index, navigate into the first subscription
 *      detail page. (We don't pin a hard-coded id — the backend rotates.)
 *   2. The sidebar exposes "공유하기" with both URL-copy and KakaoTalk
 *      buttons. Cursor styling, accessibility names, and inline feedback
 *      all live here.
 *   3. URL-copy: click → clipboard holds the canonical absolute URL
 *      → button label flips to "복사됨" (under role=status) → reverts to
 *      "URL 복사" after the 2s timer.
 *   4. KakaoTalk button: clickable without JS error. Real Kakao SDK load /
 *      dialog is intentionally NOT asserted — Kakao's CDN + domain
 *      whitelist make a real send a flake risk in headless CI. The unit
 *      test in `share-actions.test.tsx` already pins the SDK call payload.
 *
 * Why this is in the `default` project (PR-gated):
 * — share is a public, always-rendered surface and the copy flow is the
 *   only browser-only UX in this PR (Clipboard API + 2s state machine).
 *   Catching a regression here costs ~10s; missing it ships broken share.
 */
import { test, expect } from '@playwright/test';

test.describe('listing detail — share section', () => {
  test('renders both share buttons and copies the page URL', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/listings');
    const firstCardLink = page.locator('a[href^="/listings/"]').first();
    await expect(firstCardLink).toBeVisible();
    const detailHref = await firstCardLink.getAttribute('href');
    expect(detailHref).toMatch(/^\/listings\/\d+$/);

    await firstCardLink.click();
    await page.waitForURL(`**${detailHref}`);

    const shareHeading = page.getByRole('heading', { name: '공유하기' });
    await expect(shareHeading).toBeVisible();

    const copyBtn = page.getByRole('button', { name: '이 페이지의 URL 복사' });
    const kakaoBtn = page.getByRole('button', { name: '카카오톡으로 공유' });
    await expect(copyBtn).toBeVisible();
    await expect(kakaoBtn).toBeVisible();

    // Share copies whatever NEXT_PUBLIC_SITE_URL is set to in the dev server
    // env. Local .env.local pins it to http://localhost:715 so dev testers
    // can paste a local URL and see their own changes. On Vercel
    // (production / preview / development) the env is https://cheongyak.com
    // so recipients always land on the canonical production page.
    const expectedUrl = `http://localhost:715${detailHref}`;

    await copyBtn.click();

    await expect(copyBtn).toContainText('복사됨');
    const status = page.getByRole('status');
    await expect(status).toContainText('URL이 복사되었습니다');

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(expectedUrl);

    // 2s reset timer in share-actions.tsx — give it a small buffer.
    await expect(copyBtn).toContainText('URL 복사', { timeout: 4000 });
  });

  test('kakao share button is clickable without throwing', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/listings');
    const firstCardLink = page.locator('a[href^="/listings/"]').first();
    await expect(firstCardLink).toBeVisible();
    await firstCardLink.click();

    const kakaoBtn = page.getByRole('button', { name: '카카오톡으로 공유' });
    await expect(kakaoBtn).toBeVisible();

    // The Kakao SDK is loaded via next/script lazyOnload from a CDN; in
    // headless CI without a key (or with key but no domain whitelist) the
    // click is a silent no-op by design. We only assert no uncaught
    // exception leaks into the page error stream.
    await kakaoBtn.click();
    await page.waitForTimeout(200);

    expect(pageErrors).toEqual([]);
  });
});
