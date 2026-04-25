import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/shared/lib/seo';

/**
 * PWA manifest. Lets Android Chrome offer the "Install app" prompt and
 * gives any browser a `standalone` display target plus brand colors
 * for the system splash. iOS Safari already had "Add to Home Screen"
 * via `src/app/apple-icon.png`; this fills in the Android side and
 * adds correct theming on both.
 *
 * Theme color tracks `brand-primary-500` from DESIGN.md (#0356FF) so
 * the system status bar and splash match the in-app brand.
 *
 * Icons:
 *  - `public/logo.svg` is used as the only manifest icon for now —
 *    `src/app/icon.svg` and `apple-icon.png` get hashed URLs by Next's
 *    file-based metadata pipeline and can't be referenced verbatim
 *    from manifest.ts. Properly-sized PWA PNGs (192×192, 512×512,
 *    plus a maskable variant) are a deliberate follow-up; until then
 *    most Android installs will still work with the SVG, just with
 *    slightly less polished home-screen rendering.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#0356FF',
    lang: 'ko-KR',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
