> 이 문서는 CLAUDE.md의 한국어 번역입니다.

# Cheongyak.com — 프로젝트 가이드

> 한국 주택 청약 정보 플랫폼. 모바일 우선, SEO 중심, 완전 공개, 관리자 발행 콘텐츠.

---

## 1. 프로젝트 개요

**목적:** 30~50대 한국 사용자에게 아파트 청약 일정, 현황, 뉴스, 시장 인사이트를 제공하는 세련된 에디토리얼 스타일 웹 앱.

**주요 특성:**
- 완전 공개 — 로그인 없음, 회원 시스템 없음, 인증 없음
- 관리자 콘텐츠 관리는 이 웹 앱 외부에서 수행 (headless CMS 또는 별도 시스템)
- 모바일 우선 반응형 디자인 — 트래픽 대부분이 모바일 웹
- SEO 중심 — 주택 정보 검색이 유기적 트래픽 유입원
- 라이트 테마 전용 — 다크 모드 없음
- 작성자/편집자 정보는 최종 사용자에게 노출되지 않음

**참조 문서:**
| 문서 | 용도 |
|---|---|
| `DESIGN.md` | 토큰 정의를 포함한 전체 디자인 시스템 |
| `ARCHITECTURE.md` | 기술 스택, 프로젝트 구조, 렌더링 전략 |
| `PAGES.md` | 페이지별 사양 및 데이터 요구사항 |

---

## 2. 기술 스택

| 기술 | 버전 | 용도 |
|---|---|---|
| Next.js | 16 (App Router) | 프레임워크 — SSR/SSG/ISR, 파일 기반 라우팅, Server Components |
| React | 19 | UI 라이브러리 — Server Components, concurrent 기능 |
| TypeScript | 5.x (strict) | 언어 — `strict: true`, implicit `any` 불허 |
| Tailwind CSS | 4.x | 스타일링 — 유틸리티 우선, 디자인 토큰 시스템과 매핑 |
| TanStack Query | 5.x | 서버 상태 — 캐싱, 백그라운드 리페치, 낙관적 업데이트 |
| Zustand | 5.x | 클라이언트 상태 — UI 상태 (모달, 토스트) + localStorage 환경설정을 위한 `persist` |
| nuqs | 2.x | URL 상태 — 필터/페이지네이션을 위한 타입 안전 검색 파라미터 |
| next-intl | 4.x | i18n — 한국어 우선, 향후 영어 확장 대비 |
| Zod | 3.x | 유효성 검증 — 런타임 API 응답 검증 |
| orval | 7.x | 코드 생성 — OpenAPI → 타입 지정 클라이언트 + TanStack Query hooks |
| MSW | 2.x | 모킹 — 개발 및 테스트용 API 모킹 |
| Vitest | 3.x | 단위/통합 테스트 |
| Playwright | 1.x | E2E 테스트 — 크로스 브라우저 및 모바일 뷰포트 |

**미포함:** 인증 라이브러리 없음 (완전 공개 사이트), 폼 라이브러리 없음 (공개 UI는 네이티브 요소 + nuqs 사용).

---

## 3. 아키텍처

### 렌더링 전략

| 경로 | 전략 | 재검증 |
|---|---|---|
| `/` (Home) | SSR + ISR | 60s |
| `/listings` (Listing) | SSR + ISR | 60s |
| `/listings/[id]` (Detail) | SSG + ISR | 300s |
| `/news` (Feed) | SSR + ISR | 120s |
| `/news/[id]` (Article) | SSG + ISR | 600s |

**기본 원칙:** React Server Components 사용. 인터랙티비티가 필요한 경우에만 `"use client"` 사용.

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router — 플랫 구조, route group 없음
│   ├── page.tsx            # / (Home)
│   ├── listings/           # /listings, /listings/:id
│   ├── news/               # /news, /news/:id
│   ├── layout.tsx          # Root layout
│   └── sitemap.ts
├── features/               # 기능 모듈 (로직 함께 배치)
│   ├── listings/           # components/, hooks/, types.ts, utils.ts
│   └── news/
├── shared/                 # 공통 코드
│   ├── components/         # 디자인 시스템 컴포넌트 (Button, Card, Chip...)
│   ├── hooks/              # 공유 hooks
│   ├── stores/             # Zustand stores (ui, recent-views, filter-prefs)
│   ├── lib/                # 유틸리티, API 클라이언트, 상수
│   └── types/              # 전역 타입, API 타입
├── styles/globals.css      # Tailwind 지시문 + 토큰 오버라이드
├── mocks/                  # MSW 핸들러 및 픽스처
└── __tests__/              # E2E 테스트 스펙
```

**규칙:**
- feature 간 상호 임포트 금지 — 공유 코드는 `shared/`에 배치
- 라우트 파일 (`page.tsx`, `layout.tsx`)은 feature 컴포넌트를 조합하는 얇은 래퍼
- 단위 테스트는 소스 옆에 배치 (`*.test.ts`); E2E는 `__tests__/`에 배치
- route group 없음 — 모든 페이지가 공개이므로 플랫 구조가 더 단순

### 상태 관리

| 유형 | 솔루션 | 예시 |
|---|---|---|
| 서버 상태 | TanStack Query | 청약 목록, 뉴스 기사, API 데이터 |
| URL 상태 | nuqs | 필터, 정렬 순서, 페이지네이션 |
| 클라이언트 UI 상태 | Zustand | 모달 열기/닫기, 토스트 큐 |
| 영구 환경설정 | Zustand + `persist` | 최근 본 항목 (청약 20건), 마지막 사용 필터 설정 |

### 데이터 페칭

- **Server Components:** 초기 페이지 데이터를 위해 `fetch()`에 `next.revalidate` 사용
- **Client Components:** 인터랙티브 패턴을 위해 orval에서 생성한 TanStack Query hooks 사용
- **Prefetch:** 상세 페이지 링크 hover 시 `queryClient.prefetchQuery` 실행
- **Stale time:** 불필요한 요청 감소를 위해 기본값 60s

---

## 4. 페이지

| 경로 | 페이지 | 용도 |
|---|---|---|
| `/` | 홈 대시보드 | 주간 일정, 주요 청약, 시장 인사이트, 실거래가 TOP 5, 최근 본 항목, 최신 뉴스 |
| `/listings` | 청약 목록 | 6가지 필터 유형을 갖춘 필터링/검색 가능 목록, 페이지네이션 |
| `/listings/[id]` | 청약 상세 | 전체 정보: 개요, 7단계 타임라인, 공급 내역, 관련 뉴스, 공식 링크 |
| `/news` | 뉴스 피드 | 카테고리 탭 기사 피드 (정책/시장동향/분석/공지) |
| `/news/[id]` | 뉴스 기사 | 전문 기사 및 관련 청약 정보 |
| `/about` | 소개 | 서비스 미션 및 사용하는 공공 데이터 출처 안내 |
| `/terms` | 이용약관 | 서비스 약관 — 회원제 미운영·개인정보 미수집·운영자 연락처·분쟁 해결 |

**통합 검색:** 네비게이션 검색 아이콘 또는 `⌘K` 단축키로 오버레이 실행. 청약 + 뉴스 통합 검색 및 최근 검색어 기록 지원. _베타 단계 비공개 — `docs/beta-launch-deferred-features.md#search` 참고._

**전체 사양:** 상세 섹션, 데이터 요구사항, 모바일 레이아웃, 수용 기준은 `PAGES.md` 참조.

---

## 5. 디자인 시스템

**크리에이티브 디렉션:** "The Editorial Architect" — 의도적 비대칭과 톤의 깊이를 갖춘 프리미엄, 모던, 커뮤니티 앱 느낌.

**핵심 제약조건 (협상 불가):**
- 라이트 테마 전용 — 다크 모드 없음
- 섹션 구분에 1px 테두리 사용 금지 — 배경색 변화만 사용
- 순수 검정 (`#000000`) 사용 금지 — `color-text-primary` (`neutral-900`) 사용
- 모든 인터랙티브 요소에 최소 `radius-md` (8px) 적용
- 색상만으로 상태 표시 금지 — 반드시 아이콘 또는 텍스트와 함께 사용

### 색상 아키텍처

색상은 **Brand** (아이덴티티)와 **Functional** (시맨틱 의미)로 구분:

**Brand Colors (고정):**
| 토큰 | Hex | 역할 |
|---|---|---|
| `brand-primary-500` | `#0356FF` | 핵심 브랜드, CTA, 링크, 활성 상태 |
| `brand-secondary-500` | `#00FFC2` | 장식적 액센트, 하이라이트 (흰색 배경 텍스트로 사용 금지) |
| `brand-tertiary-500` | `#FF7C4C` | 따뜻한 액센트, 프로모션 하이라이트 |

**Functional Colors:**
| 토큰 | Hex | 역할 |
|---|---|---|
| `success-500` | `#22C55E` | "접수중", 긍정 상태 |
| `danger-500` | `#E11D48` | "마감", 오류 |
| `warning-500` | `#F79009` | "마감임박", 주의 |
| `info-500` | `#06B6D4` | "접수예정", 정보 |

**구현 규칙:**
- 시맨틱 토큰 사용 (`color-bg-card`, `color-text-primary`) — 원시 hex 값 직접 사용 금지
- Brand colors는 아이덴티티용, Functional colors는 상태용 — 혼용 금지
- Tailwind 설정에서 디자인 토큰을 유틸리티 클래스로 매핑
- `brand-secondary-500`은 흰색 배경에서 대비비 약 1.6:1 — 장식용으로만 사용, 텍스트 사용 금지

**전체 사양:** 완전한 토큰 스케일, 타이포그래피, 간격, 브레이크포인트, 컴포넌트, 접근성 스펙은 `DESIGN.md` 참조.

---

## 6. 컴포넌트 규칙

### 네이밍
- 컴포넌트는 PascalCase: `SubscriptionCard`, `StatusChip`
- hooks는 camelCase: `useSubscriptionFilters`
- 파일은 kebab-case: `subscription-card.tsx`, `use-subscription-filters.ts`

### 구조
```
shared/components/
├── button/
│   ├── button.tsx          # 컴포넌트 구현
│   ├── button.test.tsx     # 단위 테스트
│   └── index.ts            # 공개 export
```

### Props
- 컴포넌트당 최대 5개 props — 초과 시 분리 또는 합성 패턴 사용
- 컴포넌트 props에는 `type` 별칭이 아닌 TypeScript interfaces 사용
- 설정(boolean props)보다 합성(children, slots) 선호
- 필수 props 먼저, 선택 props 나중에

---

## 7. 성능 예산

### Core Web Vitals

| 지표 | 목표 |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

### 번들 예산

| 지표 | 한도 |
|---|---|
| Initial JS (gzip) | < 200 KB |
| Per-route JS (gzip) | < 50 KB |
| Total CSS (gzip) | < 30 KB |

### 이미지 규칙
- 모든 이미지는 `next/image` 사용 — 자동 WebP/AVIF 변환, 반응형 srcSet, 지연 로딩
- 히어로 이미지: `priority` prop, AVIF 형식
- 썸네일: 최대 너비 400px, 품질 75
- 플레이스홀더: blur placeholder로 `placeholder.svg` 사용

### 코드 분할
- 라우트 기반 분할은 자동 (App Router)
- 무거운 컴포넌트: `next/dynamic`에 `ssr: false` 옵션
- 서드파티 스크립트: `next/script`에 `afterPretendardactive` 또는 `lazyOnload` 옵션

---

## 8. 테스트 전략

### 테스트 피라미드

| 수준 | 도구 | 테스트 대상 |
|---|---|---|
| 단위 | Vitest | 유틸리티, hooks, 순수 함수, Zod 스키마 |
| 컴포넌트 | Vitest + RTL | 컴포넌트 렌더링, 인터랙션, 상태 |
| 통합 | Vitest + MSW | 데이터 페칭 흐름, API 오류 처리 |
| E2E | Playwright | 핵심 사용자 흐름, 크로스 브라우저, 모바일 뷰포트 |
| 시각 | Chromatic | 컴포넌트 변경에 대한 시각적 회귀 테스트 |

**Vitest 환경:** `happy-dom` (`vitest.config.ts` 에서 지정). SSR 출력 검증 등
순수 Node 컨텍스트가 필요한 테스트는 파일 상단에 `// @vitest-environment node`
로 옵트아웃. vitest 3 의 `ERR_REQUIRE_ASYNC_MODULE` ESM 호환 문제를
피하기 위해 `jsdom` 을 제거하고 `happy-dom` 으로 통일.

### 규칙
- 구현이 아닌 동작을 테스트 — 사용자가 보고 수행하는 것을 테스트
- 모든 버그 수정에 회귀 테스트 추가
- Lorem Ipsum이 아닌 실제 한국어 테스트 데이터 사용
- 불안정한 테스트는 P0 버그 — 즉시 수정 또는 제거
- 테스트 실패 시 CI 실패 — 깨진 테스트로 병합 금지
- **스켈레톤 페리티 RTL 게이트 (Phase B-2a):** 모든 라우트 레벨 `loading.tsx`
  는 형제 `loading.test.tsx` 를 두어 어떤 `*.skeleton.tsx` 컴포넌트를 어느
  개수로 렌더링하는지 고정한다. 로더의 형태를 바꾸면 같은 PR 에서 테스트도
  업데이트해야 한다 — 형제 스켈레톤을 빠뜨리거나 이미 사라진 팬텀 섹션을
  다시 들여오는 변경은 리뷰가 아닌 CI 에서 잡혀야 한다. 홈(`/`) 은 예외 —
  `app/loading.tsx` 를 두지 않고 `app/page.tsx` 내부에서 섹션별 `<Suspense>`
  fallback 으로 스켈레톤을 소유한다. 그래야 스트리밍 중 홈 스켈레톤이
  `/listings` 등 하위 라우트의 외부 Suspense 경계로 새지 않는다.
- **스켈레톤 페리티 Playwright 게이트 (Phase B-2b):**
  `e2e/skeleton-parity.spec.ts` 가 `pnpm dev`(포트 715) 위에 Chromium
  을 띄워 두 라우트를 커버한다: (1) `/listings` 는 `page.route` 로
  TanStack Query fetch 를 지연시켜 첫 번째
  `SubscriptionCardSkeleton` 의 렌더 `offsetHeight` 가 첫 번째 실제
  `<article>` 의 10% 이내임을 단언한다 — per-card 단위가 옳은 기준
  (스켈레톤은 항상 6 장, 실제 리스트는 20장 이상이라 outer wrapper
  총 높이는 맞출 수 없지만, 각 카드는 플레이스홀더와 동일한 박스를
  차지해야 함). (2) `/` 홈은 `src/instrumentation.ts`(env
  `SKELETON_PARITY_DELAY_MS` 가 설정될 때만 로드됨)가
  `globalThis.fetch` 를 패치해 서버측 `/main/*` 요청을 지연시키고
  `src/mocks/fixtures/main/` 고정 fixture 로 응답한 뒤,
  `home-hero-skeleton` 와 `top-trades-skeleton` 이 각각 대응
  `data-section` 실제 섹션의 10% 이내임을 단언한다. WeeklySchedule
  은 홈 게이트에서 제외 — `getWeekdays()` + `getSubsForDate` 로
  today's weekday 에 종속되는 레이아웃이라 static fixture 는 7 일 중
  6 일은 empty state 로 떨어지며, 이 skeleton-too-tall-for-empty
  이슈는 별도 follow-up 으로
  `docs/skeleton-parity-test-plan.md` 에 기록. main 브랜치 전용
  작업이므로 `pnpm test:e2e:skeleton-parity` 로 opt-in 하여 돌리며,
  기본 `pnpm test:e2e` 는 이를 건너뛰어 PR 지연을 줄인다. CI 연결은
  `.github/workflows/skeleton-parity.yml` 이 담당한다 — `main`
  `push` + `workflow_dispatch` 에서 실행되며, `/listings` 의
  `page.route` 핸들러가 실제 트래픽을 지연만 시키고 stub 하지 않기
  때문에 레포 시크릿 `API_BACKEND_URL` 이 필요하다. `/listings/[id]`
  는 커버되지 않는다 — detail 페이지가 정적 fixture 를 읽는 순수
  Server Component 라서 Next 16 + React 19 의 concurrent router 가
  새 트리를 `<div hidden>` 에 staging 한 뒤 원자적으로 unwrap 하며,
  따라서 `loading.tsx` 가 사용자에게 실제로 가시화되지 않아 runtime
  CLS 위험 자체가 없다. 대신
  `src/app/listings/[id]/loading.test.tsx` RTL 게이트가 loader 구성
  자체는 계속 고정한다(정합성 가드).

---

## 9. 접근성

### 표준
- **WCAG 2.2 AA** 최소 준수
- **KWCAG** (한국형 웹 콘텐츠 접근성 지침) 준수
- 장애인차별금지법에 따른 공공 정보 서비스 접근성 요구사항

### 요구사항
- 대비: 일반 텍스트 4.5:1, 큰 텍스트 및 UI 컴포넌트 3:1
- 포커스: 2px solid `brand-primary-500` 링에 2px 오프셋, `:focus-visible`에서만 표시
- 터치 대상: 최소 44x44px
- 키보드: 전체 내비게이션 지원, 논리적 탭 순서, 라우트 변경 시 포커스 관리
- 모션 감소: `prefers-reduced-motion` 존중 — 필수적이지 않은 애니메이션 비활성화
- 스크린 리더: 시맨틱 HTML, 필요시 ARIA 속성, 서술적 alt 텍스트
- 색각 이상 대응: 색상만으로 표시 금지 — 반드시 아이콘 또는 텍스트 레이블과 함께 사용

---

## 10. API 통합

### 패턴
- 백엔드 팀이 OpenAPI 3.1 스펙 발행
- `orval`이 타입 지정 fetch 클라이언트 + TanStack Query hooks 생성 (`npm run codegen`)
- CI에서 코드 생성 최신 상태 검증 — 스펙 변경 후 코드 생성 미실행 시 실패

### 오류 처리
```typescript
interface ApiError {
  status: number;
  code: string;       // 기계 판독용: "LISTING_NOT_FOUND"
  message: string;    // 사용자용 한국어 메시지
}
```
- 4xx → 인라인 UI 오류 메시지 또는 error boundary
- 5xx → 범용 폴백 UI + 오류 보고 (Sentry)
- 네트워크 오류 → TanStack Query 재시도 (3회, 지수 백오프)

---

## 11. SEO & GEO

**오너:** Dewey (`.claude/agents/dewey.md`). Bolt는 랭킹 시그널 관점의 Core Web Vitals만 담당.

### SEO (전통 검색)
- 모든 라우트는 `src/shared/lib/seo.ts`의 `buildPageMetadata()`를 사용 — canonical, OG, Twitter, 한국어 meta description을 일관되게 적용
- Root layout에서 `metadataBase`·기본 OG 설정, `OrganizationJsonLd`를 전역 주입
- JSON-LD: 전역 `Organization` + `WebSite`, 상세 페이지는 `RealEstateListing` + `BreadcrumbList` (SearchAction은 `/listings`가 `q` 파라미터를 실제로 바인딩하기 전까지 의도적으로 제외 — 미작동 URL 선언 시 Google Sitelinks Search Box가 비활성화됨)
- `/og` edge 라우트(`next/og` `ImageResponse`)로 OG 이미지 동적 생성 — `?title=`·`?subtitle=` 쿼리로 커스터마이즈
- 동적 `sitemap.ts`에서 모든 공개 URL 포함 (static + 청약 상세). `/trades`는 coming-soon 단계에서도 포함
- `robots.ts`에서 모든 경로 허용 (완전 공개 사이트)

### GEO (AI 엔진 최적화)
- `public/llms.txt`: 사이트 정의, 핵심 라우트, 데이터 소스, 인용 가이드를 LLM 크롤러에 제공
- 콘텐츠 패턴: 주장 → 근거 → 출처 3단 구조. AI Overviews·Perplexity 등에서 인용 가능하도록 명확한 헤딩·간결한 정의 우선

### 포인터
- 키워드 전략: `docs/seo-keyword-map.md`
- hreflang/i18n 로드맵: `docs/seo-i18n-plan.md`

---

## 12. 배포

- **플랫폼:** Vercel (Next.js 제로 설정, 엣지 네트워크, 자동 ISR)
- **프로덕션:** `main` 브랜치 → cheongyak.com
- **프리뷰:** 모든 PR에 고유 프리뷰 URL 생성
- **CI/CD:** GitHub Actions → 린트, 타입 체크, 테스트, 빌드, 번들 사이즈 검사 → Vercel 배포

### 환경 변수
| 변수 | 범위 | 용도 |
|---|---|---|
| `API_BACKEND_URL` | 서버 전용 | 백엔드 API origin. 브라우저는 이 값을 보지 않음 — CSR 호출은 `/api/backend/*` 로 가고 `next.config.ts` rewrites 가 서버 사이드에서 이 origin 으로 포워딩. `NEXT_PUBLIC_` 접두사를 의도적으로 쓰지 않음. |
| `OPENAPI_URL` | 빌드 타임 | `pnpm codegen` (orval) 이 읽는 OpenAPI JSON URL. `dotenv-cli` 가 `.env.local` 에서 주입. |

모든 시크릿은 Vercel 대시보드를 통해 관리 — **코드나 커밋에 절대 포함하지 않음**.

---

## 13. 보안

**이 저장소는 공개 저장소입니다.** 절대 커밋하지 말 것:
- API 토큰, 키, 시크릿
- 토큰이나 인증 정보가 포함된 URL
- 데이터베이스 연결 문자열
- 개인 식별 정보

환경 변수만 사용할 것. 모든 커밋 전에 시크릿이 포함되지 않았는지 확인.

### 백엔드 프록시 가드

`src/middleware.ts` 가 `/api/backend/:path*` 를 매칭해 백엔드 rewrite 에 대한 스크래핑/비용 폭증 공격에 대비한 두 가지 무비용 방어를 적용:

1. **Origin/Referer 화이트리스트** — `Origin` 또는 `Referer` 가 `cheongyak.com`, Vercel preview, localhost 로 해석되는 요청만 통과. 그 외(`curl` 등 referer 없는 직접 호출 포함)는 403. 헤더 위조로 우회 가능 — 1차 필터일 뿐 강한 게이트가 아님.
2. **IP 단위 rate limit** — 고정 윈도우 카운터(60 req / 60s), `X-Forwarded-For`(Vercel edge 에서 실제 클라이언트 IP 로 다시 채워줌) 기반. 카운터는 인스턴스 메모리 — Fluid Compute 가 인스턴스를 재사용해 윈도우가 의미 있게 작동하지만, 신규 인스턴스는 카운터가 비어 있음(실효 상한 = `limit × 인스턴스 수`). 트래픽이 더 늘면 Upstash/Redis 같은 공유 저장소로 교체.

순수 헬퍼와 테스트는 `src/shared/lib/api-guard.ts` / `api-guard.test.ts` 에 있음. 서버 측 fetch (RSC, sitemap, ISR revalidation) 는 `API_BACKEND_URL` 로 백엔드를 직접 호출하므로 middleware 를 거치지 않음.

---

## 14. 교차 검증 규칙 (필수)

코드나 문서를 수정하는 모든 작업은 완료 전에 교차 검증 단계를 포함해야 합니다. 이 규칙은 영구적이며 모든 향후 작업에 적용됩니다.

**원칙:** PR이 아래 트리거 표의 어떤 행이라도 만족하면, **같은 PR에서** 해당 문서를 반드시 업데이트해야 합니다. 코드와 해당 문서가 함께 변경된 커밋은 정상이며, 코드만 바뀌고 문서가 누락된 커밋은 결함으로 간주합니다.

### 문서 동기화 트리거 (코드 변경 → 같은 PR에서 수정해야 할 문서)

| 트리거 (코드 변경) | 같은 PR에서 반드시 갱신 |
|---|---|
| `src/app/` 하위 라우트 추가·제거·이름변경 | `PAGES.md`·`PAGES.ko.md` (라우트 표, SEO 요구사항), `ARCHITECTURE.md`·`ko` §3 렌더링 표, `CLAUDE.md`·`ko` §4, `src/app/sitemap.ts` |
| `src/shared/lib/seo.ts` 수정 (메타데이터 헬퍼) | `CLAUDE.md`·`ko` §11, `ARCHITECTURE.md`·`ko` §7 |
| `src/shared/components/json-ld.tsx` 수정 (스키마 헬퍼) | `CLAUDE.md`·`ko` §11, `ARCHITECTURE.md`·`ko` §7 (스키마 표) |
| `src/app/og/route.tsx` 혹은 OG 디자인 상수 변경 | `DESIGN.md`·`ko` (토큰 drift 확인), `ARCHITECTURE.md`·`ko` §7 |
| `public/llms.txt` 수정 | `docs/seo-keyword-map.md`, 김정호(도메인) 리뷰 트리거 |
| `docs/seo-keyword-map.md` 또는 페이지별 `keywords` 배열 수정 | `docs/seo-keyword-map.md` 라우트 표 + `CLAUDE.md`·`ko` §11 (오너십 변동 시) |
| Tailwind 토큰 추가·변경 또는 tailwind.config 수정 | `DESIGN.md`·`ko` (토큰 표), `PAGES.md`·`ko` (사용 예시) |
| API 계약 또는 `src/shared/types/api.ts` 변경 | `PAGES.md`·`ko` 데이터 요구사항, `ARCHITECTURE.md`·`ko` §6 API 표 |
| `.claude/agents/*.md` 에이전트 추가·변경 | `CLAUDE.md`·`ko` §2 (역할 경계 변동 시), 상호 참조된 에이전트의 "Behavior in Discussions" 섹션 |
| Next.js / React / Tailwind / Vitest 메이저 버전 변경 | `CLAUDE.md`·`ko` §2 기술 스택 표, `ARCHITECTURE.md`·`ko` §1 |
| 테스트 전략·CI 게이트 추가 (예: `scripts/audit-seo.mjs`) | `CLAUDE.md`·`ko` §8, `ARCHITECTURE.md`·`ko` §9 |
| 형제 `*.skeleton.tsx`가 있는 실제 컴포넌트 수정, 또는 라우트 수준 `loading.tsx` 추가·수정·삭제 | 대응 `*.skeleton.tsx` (DOM 구조와 대략 높이를 함께 갱신해 Suspense/route fallback이 최종 레이아웃과 일치하도록 — `ARCHITECTURE.md` §7 Performance CLS 규칙 준수) + 대응 `loading.test.tsx` (형제 스켈레톤 개수·`data-testid` 단언을 함께 갱신해 RTL 게이트가 계속 통과하도록) |

### 문서 동기화 (쌍 대응)
- `.md` 파일 수정 시 `.ko.md` 대응 파일도 **같은 커밋에서** 업데이트
- 기술 스택 버전은 `CLAUDE.md`와 `ARCHITECTURE.md` 간에 정확히 일치
- 라우트 경로는 `CLAUDE.md`, `ARCHITECTURE.md`, `PAGES.md` 간에 정확히 일치
- 색상 토큰 이름과 값은 `DESIGN.md`와 `PAGES.md` 간에 정확히 일치
- 사용 중인 schema.org 타입은 `src/shared/components/json-ld.tsx`, `CLAUDE.md` §11, `ARCHITECTURE.md` §7, `PAGES.md` SEO Requirements 간에 일치
- **스켈레톤 쌍 유지:** 레이아웃이 단순하지 않은 피처 컴포넌트는 형제 `*.skeleton.tsx`를 함께 두어 동일한 외곽 셸과 유사한 치수를 렌더해야 합니다. 컴포넌트의 형상이 변하면(섹션 추가·제거, 그리드 컬럼 수 변경, 주요 높이 변경) **같은 PR에서** 형제 스켈레톤도 갱신해야 합니다. 라우트 수준 `loading.tsx`는 DOM을 중복 작성하는 대신 형제 스켈레톤을 조립해 구성합니다. 모든 스켈레톤은 공용 `<Skeleton>` 프리미티브를 사용해야 하며, raw `animate-pulse`는 금지입니다(`prefers-reduced-motion` 존중을 위해). 프리미티브는 `globals.css`의 `--duration-shimmer`에 묶인 `skeleton-wave` 그라데이션으로 애니메이션되며, 과거의 `skeleton-pulse` keyframe은 다시 도입하지 않습니다. 각 형제 스켈레톤은 안정적인 `data-testid` (예: `subscription-card-skeleton`, `home-hero-skeleton`) 를 가져 라우트 레벨 형제 `loading.test.tsx` 가 조합을 고정할 수 있게 합니다 — 테스트를 함께 갱신하지 않고 testid 를 바꾸거나 제거하면 CI 에서 실패합니다.
- **앱 부트스트랩 스플래시 vs 라우트 스켈레톤:** 브랜드 로고 스플래시(`app/layout.tsx`에 배선된 `<AppSplash />` + `<AppReadyMarker />`, `globals.css`의 `#app-splash`)는 hydration 직전의 부트스트랩 프레임만을 덮습니다. 첫 `useEffect` 에서 `body[data-app-ready="true"]` 가 세팅되면서 숨겨지고, 이후 세션 동안 다시 나타나지 않습니다. 라우트 수준 `loading.tsx` 파일은 반드시 페이지 구조형 스켈레톤을 유지해야 하며, 스플래시로 대체하지 않습니다 — in-app 네비게이션과 API 로딩은 스플래시가 사라진 뒤에 발생하기 때문입니다.

### 번역 동기화
- 모든 `.ko.md` 파일은 영어 대응 파일과 동일한 섹션 구조를 유지
- 기술 용어 (Next.js, TypeScript, SSR, ISR 등)는 한국어 문서에서도 영어 유지
- 디자인 토큰 이름은 한국어 문서에서도 영어 유지
- Hex 코드와 숫자 값은 언어 버전 간 동일

### 운영 가이드 (실제로 따르는 방법)
- **스테이징 전:** `git status`로 변경 파일을 보고 트리거 표의 어떤 행이 발동되는지 식별 → 해당 문서를 먼저 수정한 뒤 함께 스테이징
- **커밋 전:** SEO 관련 파일이 변경된 경우 `npm run audit:seo` 실행. 항상 `npm run type-check && npm test` 실행
- **문서 변경이 불필요한 경우:** 순수 리팩터(동작/계약 변화 없음)라 트리거가 부적용이면 커밋 본문에 명시: `Docs: no change required — refactor only`

### 검증 체크리스트 (작업별)
- [ ] 트리거 표에서 발동된 모든 행의 문서가 업데이트됨
- [ ] EN/KO 번역 동기화 (섹션 구조·숫자 동일)
- [ ] 코드와 문서 정렬 (오래된 참조 없음)
- [ ] 하드코딩된 시크릿·민감 정보 없음
- [ ] SEO/메타데이터/JSON-LD 관련 파일 변경 시 `npm run audit:seo` 통과
- [ ] 상태 칩 색상이 DESIGN.md 칩 스펙과 일치

---

## 15. Slack 통합

에이전트는 Slack 스레드를 통해 소통합니다. 각 작업은 채널별로 고유 스레드를 가집니다.

### 스크립트 (`~/.claude/scripts/`)

| 스크립트 | 사용법 |
|---|---|
| `slack-notify.sh` | `<channel> <message> [thread_ts]` — 전송/답장 |
| `slack-read.sh` | `<channel> [--thread <ts>]` — 메시지 읽기 |
| `slack-react.sh` | `<channel> <timestamp> <emoji>` — 리액션 추가 |
| `task-state.sh` | `<file> get/set <field> [value]` — 원자적 상태 헬퍼 |

### 채널

| 채널 | 용도 |
|---|---|
| `progress` | 활동 로그, 마일스톤 |
| `questions` | 질문, 권한 요청 |
| `errors` | 빌드/테스트 실패, 보안 이슈 |
| `review` | 계획 승인, 결과 리뷰 (한국어) |
| `decisions` | 아키텍처, 기술 스택, 디자인 의사결정 |

### 워크플로우
1. 요청 분석
2. 계획 작성 (한국어) 및 `[NEED_APPROVAL]` 태그 포함
3. 승인 대기
4. 실행
5. `[TASK_COMPLETE]` 태그와 함께 완료

**`$TASK_STATE_FILE`이 설정되지 않은 경우 Slack 보고를 건너뜁니다.**

---

## 16. 커밋 전 체크리스트

- [ ] 하드코딩된 토큰, 키, 시크릿 없음
- [ ] `.env`와 `settings.local.json`이 `.gitignore`에 포함
- [ ] 민감한 설정은 환경 변수만 사용
- [ ] TypeScript 오류 없이 컴파일
- [ ] 모든 테스트 통과
- [ ] 번들 사이즈가 예산 내
- [ ] 교차 검증 규칙 충족 (섹션 14)

---

## 17. `.claude/` 디렉토리 쓰기

`.claude/` 디렉토리는 보호되어 있습니다. 표준 `Write` 및 `Edit` 도구는 거부됩니다.

**대신 `mcp__filesystem__write_file`과 `mcp__filesystem__edit_file`을 사용하세요.**

---

## 18. 언어 정책

| 맥락 | 언어 |
|---|---|
| 코드, 주석, 문서 | English |
| Slack `review` 채널 | Korean |
| 사용자 대면 UI 콘텐츠 | Korean |
| 커밋 메시지 | English |
