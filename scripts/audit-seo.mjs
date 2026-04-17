#!/usr/bin/env node
// Post-build SEO audit — fails CI when a prerendered page is missing
// canonical, OG, Twitter, or JSON-LD markers. Run after `next build`.
//
// Owner: Dewey. Run with `npm run audit:seo`.

import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const BUILD_DIR = new URL('../.next/server/app/', import.meta.url).pathname;
const SITE_URL = 'https://cheongyak.com';

const REQUIRED_CHECKS = [
  {
    id: 'canonical',
    pattern: /<link\s+rel="canonical"\s+href="https:\/\/cheongyak\.com[^"]*"/,
  },
  { id: 'og:title', pattern: /<meta\s+property="og:title"\s+content="[^"]+"/ },
  {
    id: 'og:description',
    pattern: /<meta\s+property="og:description"\s+content="[^"]+"/,
  },
  { id: 'og:image', pattern: /<meta\s+property="og:image"\s+content="[^"]+"/ },
  { id: 'og:type', pattern: /<meta\s+property="og:type"\s+content="[^"]+"/ },
  { id: 'twitter:card', pattern: /<meta\s+name="twitter:card"\s+content="[^"]+"/ },
  {
    id: 'jsonld',
    pattern: /<script[^>]+type="application\/ld\+json"[^>]*>\s*{[^<]+@context[^<]+schema\.org[^<]+<\/script>/,
  },
];

async function collectHtmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) {
      out.push(...(await collectHtmlFiles(full)));
    } else if (entry.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function routeFromPath(file) {
  const rel = file.slice(BUILD_DIR.length).replace(/\.html$/, '');
  if (rel === 'index') return '/';
  return `/${rel}`;
}

async function main() {
  let files;
  try {
    files = await collectHtmlFiles(BUILD_DIR);
  } catch (err) {
    console.error(`[audit-seo] cannot read ${BUILD_DIR} — run \`npm run build\` first.`);
    console.error(err.message);
    process.exit(2);
  }

  const errors = [];
  for (const file of files) {
    const route = routeFromPath(file);
    // Internal framework routes — never indexed, skip.
    if (
      route.startsWith('/_not-found') ||
      route.startsWith('/_global-error') ||
      route.startsWith('/_error') ||
      route.startsWith('/icon') ||
      route.startsWith('/favicon')
    ) {
      continue;
    }

    const html = await readFile(file, 'utf-8');
    for (const check of REQUIRED_CHECKS) {
      if (!check.pattern.test(html)) {
        errors.push({ route, missing: check.id });
      }
    }

    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
    if (canonicalMatch && !canonicalMatch[1].startsWith(SITE_URL)) {
      errors.push({
        route,
        missing: `canonical host mismatch: ${canonicalMatch[1]}`,
      });
    }
  }

  if (errors.length) {
    console.error(`[audit-seo] FAIL — ${errors.length} issue(s) across ${files.length} prerendered pages:`);
    for (const e of errors) {
      console.error(`  ${e.route}: missing ${e.missing}`);
    }
    process.exit(1);
  }

  console.log(`[audit-seo] PASS — ${files.length} prerendered pages cleared all SEO checks.`);
}

main();
