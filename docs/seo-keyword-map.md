# SEO Keyword Map — cheongyak.com

**Owner:** Dewey (`.claude/agents/dewey.md`)
**Domain reviewer:** Kim Jeong-ho (`.claude/agents/kimjeongho.md`)
**Last updated:** 2026-04-18

This document maps target search queries to the routes that should rank for them. Use it when writing copy, `generateMetadata()` values, headings, and internal links so different routes do not compete for the same intent.

## Query intent taxonomy

| Intent | Meaning | Example | Primary surface |
|---|---|---|---|
| Informational | Learn how 청약 works | "청약 가점 계산법", "특공 조건" | Detail pages, FAQ (future), llms.txt |
| Navigational | Find a specific listing/area | "래미안원베일리 청약", "서울 강남 분양" | Listing detail, listings filter |
| Transactional | Check open listings to apply | "이번주 청약", "접수중 아파트" | Home, listings (status filter) |
| Reference | Compare trade prices | "서울 실거래가", "아파트 시세" | `/trades` (coming soon) |

## Route → target queries

| Route | Primary queries | Secondary queries | Notes |
|---|---|---|---|
| `/` (Home) | 청약닷컴, 이번주 청약, 이번주 분양 일정 | 청약 일정, 청약 정보 사이트 | Brand + transactional hub. Title should stay short — most queries are brand/short-tail |
| `/listings` | 아파트 청약 목록, 분양 일정, 청약 검색, 전국 청약 | 지역별 청약, 공공분양 목록, 민간분양 목록 | Filterable list — expose filter state to bots via URL (nuqs) |
| `/listings/[id]` | `{아파트명} 청약`, `{지역} 분양`, `{건설사} 청약` | 가점, 특공 조건, 입주자모집공고 | Long-tail capture. Title pattern locked: `{아파트명} 청약 일정 및 정보` |
| `/trades` | 아파트 실거래가, 실거래가 조회, 국토부 실거래가 | 지역별 시세, 단지 시세 | Pre-launch: indexable with coming-soon copy to capture brand + generic queries |

## Korean term normalization

Kim Jeong-ho's ruling — these are the forms that drive search volume. Use the **Preferred** column in visible copy; mention **Also search as** only in supporting paragraphs or FAQ.

| Preferred | Also search as | Why |
|---|---|---|
| 청약통장 | 주택청약종합저축 | "청약통장" is everyday usage and dominant in search |
| 특별공급 | 특공 | "특별공급" for headers; "특공" acceptable in body |
| 일반공급 가점제 | 가점제 | Always pair "일반공급" on first mention for clarity |
| 무주택기간 | 무주택 기간 | Stick to no-space form |
| 입주자모집공고 | 모집공고 | Full form on first mention for legal accuracy |
| 분양가상한제 | 상한제 | Full form for SEO; abbreviation only in context |
| 청약홈 | 한국부동산원 청약홈 | Brand name; do not translate |

## Seasonal patterns

- **Spring (3–5월)** and **Fall (9–11월)**: peak 청약 season; search volume for 청약 일정, 분양 일정 roughly 2× baseline
- **연말 (11–12월)**: 정부 정책 발표 → 가점제, 공공분양 관련 검색 급증
- **월 초·중순**: 모집공고 발표 → specific 단지명 쿼리 급증 (long-tail window)

Recommendation: home 및 listings의 `lastModified`를 ISR 주기(60s)와 일치시키고, sitemap의 `changeFrequency`를 peak 기간엔 `hourly`로 일시 상향 고려 (현재는 `daily` 유지).

## Cannibalization risks

- **Home vs `/listings`**: 둘 다 "청약 일정"을 타겟. **Home**은 "이번주 청약", "대표 분양지" 같은 시의성·브랜드 쿼리, **`/listings`**는 "청약 목록", "전국 청약 검색" 같은 탐색 쿼리로 분리.
- **`/listings` vs `/listings/[id]`**: 필터 URL(`?sido=서울`)이 목록 쿼리를 흡수할 수 있음. canonical은 항상 필터 없는 `/listings`로 수렴 — 필터 페이지는 `robots meta`의 `index`를 유지하되 내부 링크 다이어트 필요(추후 점검).
- **`/trades`**: 현재 coming soon. 출시 전까지 "실거래가" 단독 long-tail을 `/trades`가 독점.

## Metadata copy checklist (per page)

- [ ] Title 60자 이내, 핵심 키워드 앞쪽 배치
- [ ] Description 150–160자, 구체적 혜택·범위 명시
- [ ] OG title = 검색 스니펫과 동일하거나 더 명료하게
- [ ] Keywords array는 5–8개, 단일 단어보다는 롱테일 2어절 조합 우선
- [ ] Canonical은 반드시 절대 URL(`SITE_URL` 기반)
- [ ] 상세 페이지의 경우 OG 이미지 `?subtitle=` 에 "{시도} {구군}"

## Audit cadence

- 월 1회: Google Search Console 쿼리 분석 → 이 문서의 "Primary/Secondary queries" 갱신
- 분기 1회: Kim Jeong-ho과 용어 정규화 재검토
- 새 라우트 추가 시: 이 문서에 행 추가 후 PR 머지

## Related docs

- SEO 오너십: `CLAUDE.md` §11
- 기술 아키텍처: `ARCHITECTURE.md` §7
- hreflang 전략: `docs/seo-i18n-plan.md`
