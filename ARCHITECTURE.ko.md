> 이 문서는 ARCHITECTURE.md의 한국어 번역입니다.

# 아키텍처 문서

## 1. 기술 스택

| 기술 | 버전 | 선정 근거 |
|---|---|---|
| **Next.js** | 16 (App Router) | SSR/SSG/ISR 유연성, 파일 기반 라우팅, React Server Components — SEO가 중요한 콘텐츠 사이트에 최적 |
| **React** | 19 | Server Components, 동시성 기능, 향상된 hydration |
| **TypeScript** | 5.x (strict mode) | 컴파일 타임에 오류 포착; strict mode로 암묵적 `any` 제거 |
| **Tailwind CSS** | 4.x | 유틸리티 우선 방식이 디자인 시스템의 토큰 기반 접근법과 부합; 미사용 CSS 제거로 최소 번들 달성 |
| **TanStack Query** | 5.x | 서버 상태 캐싱, 백그라운드 재요청, 목록 필터에 대한 낙관적 업데이트 |
| **Zustand** | 5.x | 경량 클라이언트 상태 (UI 토글, 모달 상태) + `persist` 미들웨어로 localStorage 환경설정 저장 |
| **nuqs** | 2.x | 타입 안전한 URL 검색 파라미터로 필터/정렬 상태가 페이지 이동과 공유 시에도 유지 |
| **next-intl** | 4.x | 다국어 지원 대비; 한국어 우선, 향후 영어 확장 가능 |
| **Zod** | 3.x | 경계 지점에서 API 응답의 런타임 검증; TypeScript와 결합하여 엔드투엔드 타입 안전성 확보 |
| **orval** | 7.x | OpenAPI → 타입이 지정된 TypeScript 클라이언트 + TanStack Query hooks 자동 생성 |
| **MSW** | 2.x | 백엔드 의존 없이 개발 및 테스트를 위한 API 모킹 |
| **Vitest** | 3.x | 네이티브 ESM 및 TypeScript를 지원하는 빠른 단위/통합 테스트. DOM 환경: `happy-dom` 20.x |
| **Playwright** | 1.x | 모바일 뷰포트를 포함한 크로스 브라우저 E2E 테스트 |

**의도적으로 미포함:**
- 인증 라이브러리 없음 — 사용자 로그인이 없는 완전 공개 정보 플랫폼
- 폼 라이브러리 없음 — 공개 UI는 nuqs를 활용한 네이티브 폼 요소 사용; 복잡한 폼 없음

---

## 2. 프로젝트 구조

```
src/
├── app/                        # Next.js App Router (라우트 + 레이아웃)
│   ├── page.tsx                # 홈 대시보드 (/)
│   ├── listings/
│   │   ├── page.tsx            # 청약 목록 (/listings)
│   │   └── [id]/
│   │       └── page.tsx        # 청약 상세 (/listings/:id)
│   ├── news/
│   │   ├── page.tsx            # 뉴스 피드 (/news)
│   │   └── [id]/
│   │       └── page.tsx        # 뉴스 기사 (/news/:id)
│   ├── layout.tsx              # 루트 레이아웃 (폰트, 메타데이터, providers)
│   ├── not-found.tsx
│   ├── error.tsx
│   └── sitemap.ts
├── features/                   # 기능 모듈 (관련 로직 집합)
│   ├── listings/
│   │   ├── components/         # 기능별 UI
│   │   ├── hooks/              # 기능별 hooks
│   │   ├── types.ts            # 기능별 타입
│   │   └── utils.ts
│   └── news/
├── shared/                     # 공통 코드
│   ├── components/             # 디자인 시스템 컴포넌트 (Button, Card, Chip 등)
│   ├── hooks/                  # 공유 hooks (useMediaQuery, useDebounce)
│   ├── stores/                 # Zustand stores
│   │   ├── use-ui-store.ts           # 일시적 UI 상태 (모달, 토스트)
│   │   ├── use-recent-views-store.ts # localStorage 저장 (최근 조회한 20개 목록)
│   │   └── use-filter-prefs-store.ts # localStorage 저장 (마지막 사용 필터)
│   ├── lib/                    # 유틸리티 (api-client, 날짜 포맷, 상수)
│   └── types/                  # 전역 타입, API 응답 타입
├── styles/
│   └── globals.css             # Tailwind 디렉티브 + 디자인 토큰 오버라이드
├── mocks/                      # MSW 핸들러 및 fixture
└── __tests__/                  # E2E 테스트 스펙
```

**규칙:**
- 기능 모듈은 다른 기능 모듈을 임포트하지 않음 — 공통 코드는 `shared/`에 배치.
- 라우트 파일 (`page.tsx`, `layout.tsx`)은 기능 컴포넌트를 조합하는 얇은 래퍼.
- 단위/통합 테스트는 소스 파일 옆에 배치 (`*.test.ts`); E2E는 `__tests__/`에.
- 라우트 그룹 불필요 — 모든 페이지가 공개이므로 평면 구조가 더 단순.

---

## 3. 렌더링 전략

| 페이지 | 전략 | 근거 |
|---|---|---|
| **홈 대시보드** | SSR + ISR (60s) | 최신 목록과 뉴스 표시; 신선하면서도 캐시 가능해야 함 |
| **청약 목록** | SSR | 필터/정렬 파라미터로 매 요청이 고유; 서버 렌더링으로 필터된 뷰의 SEO 보장 |
| **청약 상세** | SSG + ISR (300s) | 개별 청약 정보는 변경 빈도가 낮음; 알려진 ID는 사전 렌더링, 나머지는 ISR로 처리 |
| **뉴스 피드** | SSR + ISR (120s) | 자주 업데이트되는 피드; ISR로 신선도와 성능의 균형 |
| **뉴스 기사** | SSG + ISR (600s) | 게시된 기사는 거의 정적; ISR로 수정사항 반영 |

**통합 검색:** 별도 라우트 없이 오버레이 컴포넌트로 구현. 네비게이션 아이콘 또는 `⌘K`로 실행. 오버레이 내부는 CSR.

모든 페이지는 기본적으로 React Server Components를 사용. Client Components (`"use client"`)는 상호작용이 필요한 곳에서만 사용 (필터, 모달, 검색 입력).

---

## 4. 상태 관리

| 상태 유형 | 솔루션 | 범위 |
|---|---|---|
| **서버 상태** | TanStack Query | API 데이터 캐싱, 백그라운드 재요청, 페이지네이션, 낙관적 업데이트 |
| **URL 상태** | nuqs | 필터, 정렬 순서, 페이지네이션 파라미터 — 공유 및 북마크 가능 |
| **클라이언트 UI 상태** | Zustand | 모달 열기/닫기, 토스트 큐 — 최소한의 일시적 상태 |
| **저장된 환경설정** | Zustand + `persist` | 최근 조회 (마지막 20개 목록 ID), 마지막 사용 필터 설정 — localStorage에 저장 |
| **Server Component 데이터** | `async` 컴포넌트 + `fetch` | 초기 페이지 데이터를 Server Components에서 로드, 클라이언트 상태 불필요 |

**원칙:** Server Components에서의 서버 사이드 데이터 페칭을 우선. TanStack Query는 클라이언트 인터랙티브 패턴(필터 업데이트, 폴링)에서만 사용. Zustand store는 작고 기능 단위로 유지. 최대 3개.

### localStorage 기능 (비인증 개인화)

| 기능 | Store | 데이터 | 제한 |
|---|---|---|---|
| 최근 조회 | `use-recent-views-store` | 최근 조회한 20개 목록 ID + 타임스탬프 | 홈 대시보드에 표시 |
| 필터 환경설정 | `use-filter-prefs-store` | 마지막 사용 지역, 유형, 정렬 순서 | 재방문 시 자동 적용 |

**의도적으로 미구현:** 즐겨찾기/북마크 (브라우저 초기화 시 사라짐 — 없는 것보다 나쁜 UX). 대신 상세 페이지에 Web Share API를 활용한 "공유" 버튼 제공.

---

## 5. 데이터 페칭

### Server Components (초기 로드)
```
Server Component → fetch() with Next.js cache → API Server
```
- Next.js `fetch`에 `next.revalidate`를 사용하여 ISR 제어.
- 데이터를 props로 클라이언트 컴포넌트에 전달 — 워터폴 없음.

### Client Components (인터랙티브)
```
Client Component → TanStack Query hook → Typed API Client → API Server
```
- orval에서 생성된 query hooks로 엔드투엔드 타입 안전성 보장.
- `staleTime: 60_000` 기본값으로 불필요한 요청 감소.
- 상세 페이지 링크에 hover 시 prefetch (`queryClient.prefetchQuery`).

### API Client
- OpenAPI 스펙에서 orval을 통해 생성된 단일 타입 API 클라이언트.
- 환경 변수 (`NEXT_PUBLIC_API_URL`)에서 Base URL 설정.
- 요청/응답 인터셉터로 에러 정규화.
- 모든 API 타입은 자동 생성 — API 인터페이스를 수동으로 작성하지 않음.

---

## 6. API 계약

### 계약 기반 개발
1. 백엔드가 OpenAPI 3.1 스펙(JSON)을 알려진 URL에 게시하거나 레포에 체크인.
2. `orval`이 `npm run codegen` 실행 시 타입이 지정된 fetch 클라이언트 + TanStack Query hooks 생성.
3. 생성된 코드가 최신이 아니면 CI 실패 (스펙이 변경되었으나 codegen이 재실행되지 않은 경우).

### 에러 처리 패턴
```typescript
// API 에러를 일관된 형태로 정규화
interface ApiError {
  status: number;
  code: string;       // 기계 판독용: "LISTING_NOT_FOUND"
  message: string;    // 사용자용 한국어 메시지
}
```
- 4xx 에러는 에러 바운더리 또는 인라인 메시지를 통해 UI에 표시.
- 5xx 에러는 일반적인 폴백 UI + 에러 리포팅 트리거.
- 네트워크 에러는 TanStack Query 재시도로 처리 (3회, 지수 백오프).

### 개발 모킹 (MSW)
- MSW 핸들러가 OpenAPI 스펙을 미러링하여 프론트엔드 독립 개발 지원.
- fixture에 실제 한국 주택 데이터를 사용하여 시각적 테스트.
- MSW는 개발 환경과 Storybook에서 활성화; 프로덕션 빌드에서는 비활성화.

---

## 7. SEO & GEO 전략

### Metadata API
- 모든 라우트는 `src/shared/lib/seo.ts`의 `buildPageMetadata()`를 사용 — canonical, OG, Twitter, 한국어 meta description을 중앙 집중 관리.
- Root layout에서 `metadataBase`와 기본 OG/Twitter 설정. 페이지별 헬퍼가 라우트마다 override.
- 쿼리 스트링으로 인한 중복 콘텐츠를 막기 위해 모든 라우트에 canonical URL 명시.

### 구조화 데이터 (JSON-LD)
| 페이지 | Schema 유형 | 주요 속성 |
|---|---|---|
| 전역 | `Organization` | 이름, URL, 로고, 설명 (root layout에 주입) |
| 홈 | `WebSite` | 사이트 이름 + inLanguage. SearchAction은 `/listings`가 `?q=` 바인딩 후 재도입 |
| 목록 | `RealEstateListing` (항목별, 추후) | 이름, 위치, 가격 범위, datePosted |
| 청약 상세 | `RealEstateListing` + `BreadcrumbList` | 전체 매물 정보, 탐색 경로 |
| 실거래가 | `Dataset` + `Place` (데이터 연동 시 계획) | 지역별 거래 통계 |

### 기술적 SEO
- `sitemap.ts`로 모든 공개 URL을 포함한 동적 XML 사이트맵 생성 (static + 청약 상세 + `/trades`).
- `robots.ts`는 모든 경로 허용 (완전 공개 사이트).
- `/og` edge 라우트(`next/og` `ImageResponse`)로 1200×630 브랜드 토큰 기반 OG 이미지 동적 생성.
- `next/image`에 모든 이미지에 대한 서술적 `alt` 텍스트 사용.
- 내부 링크 구조: 상세 페이지 breadcrumbs, 관련 목록, 홈→상세 hover prefetch.

### GEO (생성형 엔진 최적화)
- `public/llms.txt`가 사이트 정의·핵심 라우트·데이터 소스·인용 가이드를 LLM 크롤러에 노출.
- 콘텐츠 구조는 LLM이 추출하기 쉽도록 짧은 정의·불릿 사실·명시적 출처 인용을 우선.

### 참고 문서
- 키워드 전략: `docs/seo-keyword-map.md`
- i18n/hreflang 계획: `docs/seo-i18n-plan.md`

---

## 8. 성능 아키텍처

### Core Web Vitals 목표
| 지표 | 목표 | 전략 |
|---|---|---|
| **LCP** | < 2.5s | 스크롤 이전 콘텐츠 서버 렌더링; 히어로 이미지 preload; 초기 뷰에서 클라이언트 사이드 데이터 페칭 회피 |
| **INP** | < 200ms | 메인 스레드 작업 최소화; 비긴급 업데이트에 `startTransition` 사용; 필터 입력 debounce |
| **CLS** | < 0.1 | 모든 이미지에 명시적 `width`/`height`; 스켈레톤 플레이스홀더가 최종 레이아웃과 일치; 레이아웃 변경 없는 폰트 스왑 |

### 번들 예산
| 예산 항목 | 목표 |
|---|---|
| 초기 JS (First Load) | < 200 KB (gzip) |
| 라우트별 JS | < 50 KB (gzip) |
| 전체 CSS | < 30 KB (gzip, Tailwind purged) |

### 이미지 최적화
- 모든 이미지를 `next/image`로 제공 — 자동 WebP/AVIF, 반응형 `srcSet`, 지연 로딩.
- 목록 썸네일: 최대 400px 너비, quality 75.
- 히어로 이미지: `priority` prop으로 preload, AVIF로 제공.
- `placeholder.svg`를 로딩 중 blur 플레이스홀더로 사용.

### 코드 분할
- App Router를 통한 라우트 기반 분할 자동 적용.
- 무거운 클라이언트 컴포넌트 (지도 뷰, 차트)는 `next/dynamic` + `ssr: false`로 로드.
- 서드파티 스크립트 (애널리틱스)는 `next/script`의 `afterInteractive` 또는 `lazyOnload` 전략으로 로드.

---

## 9. 에러 처리

### 에러 바운더리 계층
```
app/error.tsx              → 전역 폴백 (500 수준)
app/not-found.tsx          → 404 페이지
features/*/ErrorFallback   → 기능별 인라인 에러
```

### 폴백 UI 규칙
- 에러 바운더리에 친절한 한국어 메시지 + 재시도 버튼 표시.
- 최종 사용자에게 스택 트레이스나 API 에러 상세 정보를 절대 노출하지 않음.
- 404 페이지에서 홈 또는 청약 목록으로의 이동 안내.

### 에러 리포팅
- `window.onerror`와 `onunhandledrejection`으로 클라이언트 에러 수집.
- 서버 에러는 구조화된 JSON으로 로깅 (timestamp, route, error code).
- 프로덕션 모니터링을 위해 외부 에러 추적 도구 (Sentry) 연동.

---

## 10. 배포

### 플랫폼: Vercel
- **선정 근거:** Next.js 무설정 배포, 엣지 네트워크, 자동 ISR, 프리뷰 배포.
- 프로덕션 브랜치: `main`.
- 프리뷰 배포: 모든 PR에 고유 URL이 부여되어 리뷰 가능.

### 환경 관리
| 환경 | 브랜치 | 목적 |
|---|---|---|
| Production | `main` | cheongyak.com 라이브 사이트 |
| Preview | PR 브랜치 | PR별 배포로 리뷰 |
| Development | Local | `next dev` + MSW 모킹 |

### 환경 변수
- `NEXT_PUBLIC_API_URL` — 백엔드 API Base URL (환경별 상이).
- 모든 시크릿은 Vercel 환경 변수 대시보드에서 관리 — 코드에 절대 포함하지 않음.

---

## 11. CI/CD 파이프라인

### GitHub Actions 워크플로우

```yaml
# Triggered on: push to main, pull_request
jobs:
  quality:
    steps:
      - Checkout
      - Install (pnpm, cached)
      - Lint (ESLint + Prettier check)
      - Type check (tsc --noEmit)
      - Unit tests (Vitest)
      - Build (next build)
      - Bundle size check (fail if initial JS > 200KB gzip)

  e2e:
    needs: quality
    steps:
      - Playwright tests against preview deploy

  deploy:
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - Vercel production deploy (automatic via Vercel GitHub integration)
```

### 품질 게이트 (PR 병합 요건)
- 모든 lint, type-check, 테스트 작업 통과.
- 번들 크기가 예산 이내.
- 최소 1명의 리뷰어 승인.
- 프리뷰 배포가 접근 가능하고 정상 작동.

### Codegen 최신성 검사
- CI에서 `npm run codegen`을 실행하고 출력이 커밋된 파일과 다르면 실패.
- API 클라이언트 타입이 항상 OpenAPI 스펙과 동기화되도록 보장.
