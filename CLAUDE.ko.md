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
| `/listings` (Listing) | SSR | 요청별 |
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

**통합 검색:** 네비게이션 검색 아이콘 또는 `⌘K` 단축키로 오버레이 실행. 청약 + 뉴스 통합 검색 및 최근 검색어 기록 지원.

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
| `NEXT_PUBLIC_API_URL` | 전체 | 백엔드 API 기본 URL |

모든 시크릿은 Vercel 대시보드를 통해 관리 — **코드나 커밋에 절대 포함하지 않음**.

---

## 13. 보안

**이 저장소는 공개 저장소입니다.** 절대 커밋하지 말 것:
- API 토큰, 키, 시크릿
- 토큰이나 인증 정보가 포함된 URL
- 데이터베이스 연결 문자열
- 개인 식별 정보

환경 변수만 사용할 것. 모든 커밋 전에 시크릿이 포함되지 않았는지 확인.

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

### 문서 동기화 (쌍 대응)
- `.md` 파일 수정 시 `.ko.md` 대응 파일도 **같은 커밋에서** 업데이트
- 기술 스택 버전은 `CLAUDE.md`와 `ARCHITECTURE.md` 간에 정확히 일치
- 라우트 경로는 `CLAUDE.md`, `ARCHITECTURE.md`, `PAGES.md` 간에 정확히 일치
- 색상 토큰 이름과 값은 `DESIGN.md`와 `PAGES.md` 간에 정확히 일치
- 사용 중인 schema.org 타입은 `src/shared/components/json-ld.tsx`, `CLAUDE.md` §11, `ARCHITECTURE.md` §7, `PAGES.md` SEO Requirements 간에 일치

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
