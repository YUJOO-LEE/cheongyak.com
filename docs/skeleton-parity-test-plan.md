# Skeleton ↔ Real Page Parity — 테스트 자동화 플랜 (Phase B-2)

> Phase A-1 ~ A-3 (스켈레톤 재작성) 및 B-1 (Cross-Validation 룰) 완료 이후 남은 **테스트 커버리지** 단계. 이 문서는 단독 PR 단위로 실행할 수 있는 수준까지 쪼개어 작성되었습니다.

## Context

- **배경:** 이전 작업에서 `*.skeleton.tsx` 형제 패턴을 정착시키고, `CLAUDE.md` §14에 "스켈레톤 쌍 유지" 규칙을 추가했습니다. 그러나 *사람이 규칙을 지킨다고 가정*하는 상태이고, 자동 검증은 없습니다.
- **문제:** 앞으로 누군가 `SubscriptionCard`를 수정하면서 `subscription-card.skeleton.tsx`를 방치하면 다시 레이아웃 드리프트가 발생합니다. 코드 리뷰만으로 100% 방지는 불가능합니다.
- **목표:** 실제 컴포넌트 ↔ 스켈레톤 불일치를 CI에서 잡아내는 **최소한의** 자동 신호를 추가합니다. 두 단계로 나눕니다.
  - **B-2a (Fast, 모든 PR 필수)**: RTL 구조 테스트 — 라우트 로더가 *올바른 sibling skeleton을 사용하고 있는가*
  - **B-2b (Slow, main 머지 전)**: Playwright bounding-box parity — 로딩/최종 상태의 섹션별 높이 차이가 10% 이내인가 (실제 CLS 신호)

---

## Phase B-2a — RTL 구조 테스트 (Fast CI gate)

### 왜 이것부터?
- Vitest + Testing Library로 2~3시간 내 완료 가능, 실행 시간 <500ms
- "라우트 로더가 틀린 스켈레톤을 쓴다"는 가장 흔한 드리프트 패턴 — 예: `featured-subscription.skeleton`을 리팩토링 후 경로를 바꿨는데 `app/loading.tsx`에서 기존 경로만 계속 import하는 경우

### 구체 작업

1. **각 `*.skeleton.tsx`에 `data-testid` 부여**
   - `subscription-card.skeleton.tsx` → 최상단 Card에 `data-testid="subscription-card-skeleton"`
   - `filter-bar.skeleton.tsx` → 모바일/데스크톱 래퍼 각각에 `data-testid="filter-bar-skeleton-mobile"` / `"-desktop"`
   - `featured-subscription.skeleton.tsx` → `data-testid="home-hero-skeleton"`
   - `weekly-schedule.skeleton.tsx` → `data-testid="weekly-schedule-skeleton"`
   - `top-trades.skeleton.tsx` → `data-testid="top-trades-skeleton"`
   - `subscription-list-skeleton.tsx` → 이미 `aria-busy`가 있으나 `data-testid="subscription-list-skeleton"` 추가

2. **라우트 로더 구조 테스트 파일 3개 신규 작성**
   - `src/app/loading.test.tsx` — 홈 로더가 Hero/Weekly/TopTrades 3개 sibling skeleton을 모두 포함하는지 + 과거의 News/별도 Insights 섹션이 **없는지** (팬텀 재등장 차단)
   - `src/app/listings/loading.test.tsx` — FilterBarSkeleton (mobile+desktop) + 6개 SubscriptionCardSkeleton + 페이지네이션 placeholder 렌더링 assert
   - `src/app/listings/[id]/loading.test.tsx` — 3-col 그리드 + Timeline/Supply/Links 각 카드 존재, 사이드바에 두 번째 팬텀 블록 **없음** assert

3. **기존 client 스켈레톤 테스트 추가**
   - `subscription-list-skeleton.test.tsx` — `aria-busy="true"` + 6개 `subscription-card-skeleton` 포함 확인

### 작성 규칙
- 각 테스트는 `@testing-library/react`의 `render` + `screen.getByTestId`로 단순하게 작성
- 카운트는 `screen.getAllByTestId(...).toHaveLength(N)`
- 스냅샷 테스트 금지 (리팩터링 시 false positive 유발)
- 로케일/Mock 설정 불필요 — 순수 컴포넌트 렌더

### 변경 대상 파일
- 수정: 6개 `*.skeleton.tsx` (testid만 추가)
- 신규: 4개 `*.test.tsx` (로더 테스트 3개 + subscription-list-skeleton 테스트 1개)

### Acceptance
- `pnpm test --run` 전체 초록, 신규 테스트 전부 통과
- 의도적으로 로더에서 `<HomeHeroSkeleton />`를 삭제하면 해당 테스트가 **실패**해야 함 (수동 검증 후 복구)

---

## Phase B-2b — Playwright Bounding Box Parity (Slow gate)

### 왜 필요한가?
- RTL 테스트는 "올바른 컴포넌트가 존재하는가"는 확인하지만 "높이가 실제와 일치하는가"는 잡지 못함
- 이번 작업에서 발견한 *88px 카드 높이 차이* 같은 드리프트는 **렌더된 DOM의 bounding box**를 봐야만 보임
- 픽셀 diff(Chromatic 등)는 과민 — 폰트/스켈레톤 펄스 애니메이션에서 false positive가 많음. **섹션 높이만** 비교하는 것이 CLS의 진짜 신호

### 전략
- 새 Playwright spec `e2e/skeleton-parity.spec.ts`
- 각 타겟 라우트에 대해:
  1. `page.route('**/api/**', ...)` 로 API 응답을 **인위적으로 2초 지연**
  2. 네비게이션 시작 직후 스켈레톤 상태에서 `locator('[data-testid=X]').boundingBox()` 기록
  3. 응답이 도착하고 `await page.waitForLoadState('networkidle')` 후 실제 컴포넌트의 같은 섹션(`data-testid` 없이 선택자로) bounding box 기록
  4. `Math.abs(skelHeight - realHeight) / realHeight <= 0.10` assert

### 타겟 라우트 & 섹션 매핑

| 라우트 | 스켈레톤 selector | 실제 selector (page.tsx 참조) |
|---|---|---|
| `/` | `[data-testid=home-hero-skeleton]` | `section:has(> [data-hero])` 또는 HomeHero 래퍼에 `data-section="home-hero"` 추가 |
| `/` | `[data-testid=weekly-schedule-skeleton]` | WeeklySchedule 래퍼에 `data-section="weekly-schedule"` 추가 |
| `/` | `[data-testid=top-trades-skeleton]` | TopTrades 래퍼에 `data-section="top-trades"` 추가 |
| `/listings` | `[data-testid=subscription-list-skeleton] > .grid` (카드 그리드) | `.grid:has([data-card])` (실제 카드 그리드) |
| `/listings/[id]` | loading.tsx의 Schedule/Supply/Links 각 Skeleton에 testid 부여 | 동일 name의 `data-section` 매칭 |

### 변경 대상
- 신규: `e2e/skeleton-parity.spec.ts`
- 수정: 실제 컴포넌트들에 `data-section` 속성 추가 (HomeHero, WeeklySchedule, TopTrades, ScheduleTimeline 래퍼, SupplyBreakdown 래퍼, OfficialLinks 래퍼) — 순수 테스트용 속성이므로 프로덕션 영향 없음
- `playwright.config.ts` — 해당 spec을 별도 project로 분리해 CI에서는 main 머지 시에만 실행 (PR마다 돌리기에는 느림)

### Acceptance
- 3개 라우트 × 3~5개 섹션 = 약 10~15개 bbox assertion 전부 통과
- 의도적으로 `SubscriptionCardSkeleton` 높이를 80px로 줄이면 테스트가 **실패**해야 함 (수동 검증)

### 리스크 & 보류 사항
- **Flake 가능성**: `networkidle` 타이밍과 애니메이션 종료 타이밍이 섞여 bbox 측정이 흔들릴 수 있음 → `page.evaluate(() => document.documentElement.offsetHeight)`로 2번 측정 후 stable해진 시점에만 기록하는 헬퍼 필요
- **API 지연 모킹 대신 MSW 사용 검토**: 현재 MSW가 dev에서 사용 중이면 Playwright에서도 재사용 가능. `page.route` 기반 stub은 TanStack Query 캐시 히드레이션과 충돌할 수 있음 → **사전 조사 필요**
- **느린 CI**: B-2b는 `.github/workflows/main.yml` 같은 main 전용 워크플로에만 연결. PR blocker로 만들지 말 것

---

## 실행 순서

1. **B-2a를 먼저 단독 PR로**: 1~2시간 작업, 즉시 CI 보호 획득
2. B-2b는 다음 PR로 분리
   - 먼저 `data-section` 속성만 넣는 준비 PR (매우 작음, 프로덕션 영향 0)
   - 그다음 `e2e/skeleton-parity.spec.ts` 본체 PR

## 미사용/보류 대안

- **Chromatic / 시각 회귀 테스트**: 비용·flake·리뷰 부담이 큼. CLS 수치만 신경 쓰면 되는 현재 범위에 과함
- **정적 분석 스크립트** (`scripts/audit-skeletons.mjs`): 구조/높이 유사도 판정은 렌더가 필요하므로 정적 분석으로는 의미 있는 신호 생성 불가 — 플랜에서 이미 기각

## 관련 파일 / 참고

- 완료된 Phase A 결과물: `src/features/listings/components/*.skeleton.tsx` (5개) + `src/app/**/loading.tsx` (3개) + `src/features/listings/components/subscription-list-skeleton.tsx`
- 완료된 Phase B-1 규칙: `CLAUDE.md` §14 Doc-sync triggers 마지막 행 + Document Sync "Skeleton pairing" 산문, `CLAUDE.ko.md` §14 미러
- 기준 원문: `ARCHITECTURE.md` §Performance "skeleton placeholders match final layout; no layout-shifting"
- 공용 프리미티브: `src/shared/components/skeleton/skeleton.tsx`

## Cross-Validation 체크리스트 (이 플랜 실행 시)

- [ ] B-2a 완료 시 `CLAUDE.md` §8 / §14 갱신 (테스트 전략·CI 게이트 추가 트리거 발동)
- [ ] `CLAUDE.ko.md` §8 / §14 동일하게 미러
- [ ] `ARCHITECTURE.md`·`ko` §9 (테스트 전략 표)에 RTL skeleton-parity 테스트 추가 여부 검토
- [ ] `pnpm test --run` 104 → 신규 개수만큼 증가했는지 확인
- [ ] 커밋 메시지에 "Docs: no change required — refactor only" 예외는 적용하지 않음 (테스트 전략 추가는 doc-sync 트리거임)
