> 이 문서는 DESIGN.md의 한국어 번역입니다.

# 디자인 시스템 — cheongyak.com

> **버전:** 4.0 · **테마:** 라이트 전용 · **서체:** Pretendard · **기본 단위:** 4px

---

## 1. 개요 및 크리에이티브 방향성

**"The Editorial Architect"**

이 디자인 시스템은 기존 부동산 포털의 실용적이고 스프레드시트 같은 밀집된 구조에서 벗어납니다. 하이엔드 디지털 큐레이터의 페르소나를 채택하여, 건축 저널의 권위와 현대 핀테크 앱의 유려함을 결합합니다.

**핵심 원칙:**

- **커뮤니티 앱 느낌** — 30~50대 타겟 사용자에게 프리미엄하고 의도적이며 신뢰감 있는 경험 제공
- **의도적 비대칭** — 에디토리얼 수준의 레이아웃 긴장감으로 템플릿 느낌 탈피
- **톤의 깊이** — 여백(화이트 스페이스)을 럭셔리 요소로 활용
- **모바일 우선** — 모바일 기준 설계, 태블릿과 데스크톱으로 확장
- **라이트 테마 전용** — 고선명도, 주간 에디토리얼 경험에 최적화
- **2단계 디자인** — 홈/뉴스 페이지는 에디토리얼 처리, 청약 목록/상세 페이지는 실용-프리미엄 처리

### 디자인 단계

| 단계 | 페이지 | 접근 방식 |
|:---|:---|:---|
| **에디토리얼** | 홈 대시보드, 뉴스 피드, 뉴스 기사 | 매거진 스타일 레이아웃, 그라디언트 메시 히어로, 스태거 애니메이션, 섹션 데코레이터, 풀블리드 구성 |
| **실용-프리미엄** | 청약 목록, 청약 상세, 검색 | 정보 밀집형, 균일한 카드 그리드, 즉시 렌더링, 데이터 테이블 최적화, 최소한의 애니메이션 |

이 구분이 존재하는 이유는 사용자가 데이터 페이지에서는 **효율성을 추구하는 반복 방문자**이지만, 에디토리얼 페이지에서는 **처음 발견하는 탐색자**이기 때문입니다. 청약 목록은 50번째 방문을 기준으로, 홈은 첫 방문을 기준으로 설계합니다.

---

## 2. 컬러 시스템

컬러는 **브랜드 컬러**(아이덴티티)와 **기능 컬러**(시맨틱 의미) 두 계층으로 구성됩니다. 구현 시 반드시 시맨틱 토큰(섹션 2.7)을 사용하며, 원시 hex 값을 직접 사용하지 않습니다.

### 2.1 브랜드 프라이머리 스케일

기본값: `#0356FF` — 핵심 브랜드 아이덴티티. CTA, 활성 상태, 링크, 주요 UI 요소에 사용됩니다.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `brand-primary-50` | `#EEF4FF` | 색조 배경, 선택된 행 하이라이트 |
| `brand-primary-100` | `#D9E5FF` | 호버 배경, 은은한 채움 |
| `brand-primary-200` | `#B3CCFF` | 라이트 액센트, 프로그레스 트랙 |
| `brand-primary-300` | `#80ABFF` | 장식적 보더 |
| `brand-primary-400` | `#4D7FFF` | 보조 아이콘 |
| `brand-primary-500` | `#0356FF` | **핵심 브랜드 — 버튼, 링크, 활성 상태** |
| `brand-primary-600` | `#0248D9` | 프라이머리 버튼 호버 상태 |
| `brand-primary-700` | `#0239B0` | 활성/누름 상태 |
| `brand-primary-800` | `#022D8A` | 밝은 배경 위 고대비 텍스트 |
| `brand-primary-900` | `#011F63` | 딥 액센트 |
| `brand-primary-950` | `#011442` | 가장 어두운 프라이머리 — 드물게 사용, 극한 대비 |

### 2.2 브랜드 세컨더리 스케일

기본값: `#00FFC2` — 에너지 넘치는 시안/민트 액센트. 하이라이트, 배지, 장식 요소, 보조 CTA에 사용됩니다. **흰색 배경 위 텍스트로 절대 사용 금지** (대비 부적합).

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `brand-secondary-50` | `#EDFFF9` | 은은한 하이라이트 배경 |
| `brand-secondary-100` | `#D1FFF0` | 라이트 액센트 채움 |
| `brand-secondary-200` | `#A3FFE1` | 배지 배경, 장식적 채움 |
| `brand-secondary-300` | `#66FFD1` | 일러스트레이션, 프로그레스 바 |
| `brand-secondary-400` | `#33FFCA` | 눈에 띄는 장식 액센트 |
| `brand-secondary-500` | `#00FFC2` | **핵심 세컨더리 액센트** |
| `brand-secondary-600` | `#00D9A5` | 호버 상태 |
| `brand-secondary-700` | `#00B388` | 활성/누름 상태, secondary-50 배경 위 텍스트 |
| `brand-secondary-800` | `#008C6B` | 밝은 세컨더리 배경 위 고대비 텍스트 |
| `brand-secondary-900` | `#00664E` | 딥 액센트 |
| `brand-secondary-950` | `#004033` | 가장 어두운 세컨더리 |

**접근성 규칙:** Secondary 500은 흰색 배경 대비 약 1.6:1 — 장식적 배경으로만 사용하고 텍스트로 절대 사용하지 않습니다. 세컨더리 색조 배경 위 텍스트에는 700 이상을 사용합니다.

### 2.3 브랜드 터셔리 스케일

기본값: `#FF7C4C` — 따뜻한 코럴/오렌지. 에너지, 주목도 높은 요소, 프로모션 하이라이트, 3차 CTA에 사용됩니다.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `brand-tertiary-50` | `#FFF4F0` | 따뜻한 색조 배경 |
| `brand-tertiary-100` | `#FFE4DA` | 라이트 웜 액센트 |
| `brand-tertiary-200` | `#FFC9B5` | 배지 배경 |
| `brand-tertiary-300` | `#FFAB8A` | 장식 요소 |
| `brand-tertiary-400` | `#FF9468` | 눈에 띄는 웜 액센트 |
| `brand-tertiary-500` | `#FF7C4C` | **핵심 터셔리 — 프로모션 하이라이트** |
| `brand-tertiary-600` | `#E06236` | 호버 상태 |
| `brand-tertiary-700` | `#BA4C27` | 활성/누름 상태 |
| `brand-tertiary-800` | `#93391C` | 고대비 웜 텍스트 |
| `brand-tertiary-900` | `#6B2913` | 딥 웜 액센트 |
| `brand-tertiary-950` | `#451A0C` | 가장 어두운 터셔리 |

**접근성 규칙:** Tertiary 500은 흰색 배경 대비 약 3.3:1 — 큰 텍스트/UI 컴포넌트에만 적합합니다. 본문 텍스트에는 700 이상을 사용합니다.

### 2.4 뉴트럴 스케일 (Slate)

기본 뉴트럴: `#F8F9FA` — 페이지 캔버스.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `neutral-0` | `#FFFFFF` | 카드 배경, 모달 배경 |
| `neutral-50` | `#F8F9FA` | **페이지 배경 (캔버스)** |
| `neutral-100` | `#F1F5F9` | 은은한 섹션 구분 |
| `neutral-200` | `#E2E8F0` | 보더, 디바이더 |
| `neutral-300` | `#CBD5E1` | 비활성 보더, 은은한 구분선 |
| `neutral-400` | `#94A3B8` | 플레이스홀더 텍스트, 비활성 텍스트, 캡션 |
| `neutral-500` | `#64748B` | 보조 아이콘 |
| `neutral-600` | `#475569` | 소제목, 설명, 본문 아이콘 |
| `neutral-700` | `#334155` | 강조 보조 텍스트 |
| `neutral-800` | `#1E293B` | 높은 강조 텍스트 |
| `neutral-900` | `#0F172A` | 주요 제목, 최대 대비 텍스트 |
| `neutral-950` | `#020617` | 거의 검정 — 드물게 사용 |

### 2.5 기능 컬러

기능 컬러는 브랜드와 독립적인 시맨틱 의미를 전달합니다. 브랜드 컬러와 조화를 이루면서도 시각적으로 구분되도록 선정되었습니다.

#### 성공 스케일

기본값: `#22C55E` (녹색, 색상각 142°) — 긍정적 상태, 완료된 작업, 접수중인 청약.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `success-50` | `#F0FDF4` | 성공 배너 배경 |
| `success-100` | `#DCFCE7` | 은은한 성공 하이라이트 |
| `success-200` | `#BBF7D0` | 라이트 성공 채움 |
| `success-300` | `#86EFAC` | 장식적 성공 요소 |
| `success-400` | `#4ADE80` | 보조 성공 아이콘 |
| `success-500` | `#22C55E` | **핵심 성공 — "접수중" 칩** |
| `success-600` | `#16A34A` | 호버 상태 |
| `success-700` | `#15803D` | 활성/누름 상태, success-50 위 칩 텍스트 |
| `success-800` | `#166534` | 고대비 성공 텍스트 |
| `success-900` | `#14532D` | 딥 성공 액센트 |
| `success-950` | `#052E16` | 가장 어두운 성공 |

#### 위험 스케일

기본값: `#E11D48` (로즈-크림슨, 색상각 347°) — 오류, 마감 상태, 파괴적 작업.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `danger-50` | `#FFF1F2` | 오류 배너 배경 |
| `danger-100` | `#FFE4E6` | 은은한 오류 하이라이트 |
| `danger-200` | `#FECDD3` | 라이트 오류 채움 |
| `danger-300` | `#FDA4AF` | 장식적 위험 요소 |
| `danger-400` | `#FB7185` | 보조 위험 아이콘 |
| `danger-500` | `#E11D48` | **핵심 위험 — "마감", 오류** |
| `danger-600` | `#BE123C` | 호버 상태 |
| `danger-700` | `#9F1239` | 활성/누름 상태, danger-50 위 칩 텍스트 |
| `danger-800` | `#881337` | 고대비 위험 텍스트 |
| `danger-900` | `#4C0519` | 딥 위험 액센트 |
| `danger-950` | `#2D0310` | 가장 어두운 위험 |

#### 경고 스케일

기본값: `#F79009` (앰버, 색상각 34°) — 주의 상태, 마감 임박, 중요 공지.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `warning-50` | `#FFFBEB` | 경고 배너 배경 |
| `warning-100` | `#FEF3C7` | 은은한 경고 하이라이트 |
| `warning-200` | `#FDE68A` | 라이트 경고 채움 |
| `warning-300` | `#FCD34D` | 장식적 경고 요소 |
| `warning-400` | `#FBBF24` | 보조 경고 아이콘 |
| `warning-500` | `#F79009` | **핵심 경고 — "마감임박" 칩** |
| `warning-600` | `#D97706` | 호버 상태 |
| `warning-700` | `#B45309` | 활성/누름 상태, warning-50 위 칩 텍스트 |
| `warning-800` | `#92400E` | 고대비 경고 텍스트 |
| `warning-900` | `#78350F` | 딥 경고 액센트 |
| `warning-950` | `#451A03` | 가장 어두운 경고 |

#### 정보 스케일

기본값: `#06B6D4` (시안, 색상각 189°) — 안내 상태, 예정된 이벤트, 중립적 공지.

| 토큰 | Hex | 용도 |
|:---|:---|:---|
| `info-50` | `#ECFEFF` | 정보 배너 배경 |
| `info-100` | `#CFFAFE` | 은은한 정보 하이라이트 |
| `info-200` | `#A5F3FC` | 라이트 정보 채움 |
| `info-300` | `#67E8F9` | 장식적 정보 요소 |
| `info-400` | `#22D3EE` | 보조 정보 아이콘 |
| `info-500` | `#06B6D4` | **핵심 정보 — "접수예정" 칩** |
| `info-600` | `#0891B2` | 호버 상태 |
| `info-700` | `#0E7490` | 활성/누름 상태, info-50 위 칩 텍스트 |
| `info-800` | `#155E75` | 고대비 정보 텍스트 |
| `info-900` | `#164E63` | 딥 정보 액센트 |
| `info-950` | `#083344` | 가장 어두운 정보 |

### 2.6 컬러 사용 규칙

| 카테고리 | 사용처 | 사용 금지 |
|:---|:---|:---|
| 브랜드 프라이머리 | CTA, 링크, 활성 내비게이션, 포커스 링 | 상태 표시기 |
| 브랜드 세컨더리 | 장식 액센트, 배지, 하이라이트 | 흰색 배경 위 텍스트, 상태 표시기 |
| 브랜드 터셔리 | 프로모션 하이라이트, 에너지 액센트 | 흰색 배경 위 텍스트(700+ 제외), 상태 |
| 성공 | "접수중" 상태, 긍정적 확인 | 브랜드 아이덴티티 요소 |
| 위험 | "마감" 상태, 오류, 파괴적 작업 | 브랜드 아이덴티티 요소 |
| 경고 | "마감임박" 상태, 주의 공지 | 브랜드 아이덴티티 요소 |
| 정보 | "접수예정" 상태, 안내 태그 | 브랜드 아이덴티티 요소 |

### 2.7 시맨틱 컬러 토큰

모든 구현은 원시 스케일이 아닌 시맨틱 토큰을 참조해야 합니다.

#### 배경

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `color-bg-page` | `neutral-50` | 루트 페이지 캔버스 |
| `color-bg-card` | `neutral-0` | 카드 / 모달 표면 |
| `color-bg-elevated` | `neutral-0` | 플로팅 요소 (팝오버, 드롭다운) |
| `color-bg-sunken` | `neutral-100` | 인셋 영역, 입력 필드 채움 |
| `color-bg-overlay` | `neutral-900` 50% 불투명도 | 모달 뒤 스크림 |

#### 텍스트

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `color-text-primary` | `neutral-900` | 제목, 주요 본문 |
| `color-text-secondary` | `neutral-600` | 소제목, 설명 |
| `color-text-tertiary` | `neutral-400` | 캡션, 타임스탬프 |
| `color-text-disabled` | `neutral-300` | 비활성 레이블 |
| `color-text-inverse` | `neutral-0` | 어두운 / 프라이머리 배경 위 텍스트 |

#### 보더

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `color-border-default` | `neutral-200` | 표준 보더 (고스트 수준만) |
| `color-border-subtle` | `neutral-200` 20% 불투명도 | No-Line 규칙에 따른 고스트 보더 |
| `color-border-strong` | `neutral-300` | 강조 보더 (드물게 사용) |

#### 인터랙티브

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `color-interactive-default` | `brand-primary-500` | 링크, 프라이머리 버튼 |
| `color-interactive-hover` | `brand-primary-600` | 호버 상태 |
| `color-interactive-active` | `brand-primary-700` | 누름 상태 |
| `color-interactive-disabled` | `neutral-300` | 비활성 인터랙티브 요소 |

#### 상태

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `color-status-success` | `success-500` | 긍정적 상태 |
| `color-status-danger` | `danger-500` | 오류, 마감 상태 |
| `color-status-warning` | `warning-500` | 주의, 마감 임박 |
| `color-status-info` | `info-500` | 안내용 |

#### 포커스

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `color-focus-ring` | `brand-primary-500` | 키보드 포커스 표시기 |

---

## 3. 서피스 아키텍처

### "No-Line" 규칙

**명시적 지침:** 섹션 구분이나 컨테이너에 1px 솔리드 보더를 사용하지 않습니다. 경계는 다음을 통해 정의해야 합니다:

1. **배경색 전환** — `color-bg-card` 섹션을 `color-bg-page` 위에 배치하거나, 그 반대
2. **톤 전환** — 서피스 레벨 간 미묘한 변화로 구조를 암시

### 서피스 위계

| 레벨 | 토큰 | 용도 |
|:---|:---|:---|
| **캔버스** | `color-bg-page` | 루트 배경 |
| **낮은 고도** | `color-bg-sunken` | 보조 콘텐츠 영역 |
| **높은 고도** | `color-bg-card` | 주요 인터랙션 카드 |
| **플로팅** | `color-bg-elevated` | 드롭다운, 팝오버, 툴팁 |

### "Glass & Gradient" 규칙

- **Glassmorphism:** 플로팅 요소(스티키 내비게이션 바)에 적용. `color-bg-page` 80% 불투명도 + `backdrop-blur: 20px`
- **시그니처 그라디언트:** 프라이머리 CTA는 `brand-primary-500`에서 `brand-primary-400`으로 135° 선형 그라디언트 사용
- 같은 요소에 glassmorphism과 그라디언트를 **절대** 동시 적용 금지

### "고스트 보더" 폴백

접근성을 위해 보이는 보더가 필요한 경우, `color-border-subtle` (neutral-200 20% 불투명도)을 사용합니다. 100% 불투명도 보더는 일반 조건에서 금지됩니다. 카드는 보조 경계 단서로 `shadow-sm`도 함께 사용해야 합니다.

**예외:** `@media (prefers-contrast: more)` 조건에서는, 향상된 대비가 필요한 사용자를 위해 1px `color-border-default` 솔리드 보더를 렌더링합니다.

---

## 4. 타이포그래피 스케일

**주요 서체:** Pretendard (한국어 우선, 라틴 글리프 포함)

Pretendard는 Inter를 대체하는 유일한 서체입니다. 한국어 디지털 인터페이스를 위해 설계되었으며, 뛰어난 한글 가독성, 모든 글리프에 걸친 일관된 웨이트, 그리고 우수한 라틴 호환성을 갖추고 있습니다. 디스플레이 크기에서는 웨이트 800 (ExtraBold)과 타이트한 트래킹을 사용하여 에디토리얼 헤드라인 대비를 만듭니다.

### 폰트 스택 (Tailwind 설정)

```
fontFamily: {
  sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
}
```

### 타입 스케일

| 토큰 | 크기 | 행간 | 웨이트 | 자간 | 용도 |
|:---|:---|:---|:---|:---|:---|
| `display-lg` | 36px | 44px | 800 | -0.03em | 히어로 문구, 랜딩 제목 |
| `display-sm` | 30px | 38px | 800 | -0.03em | 주요 섹션 제목 |
| `headline-lg` | 24px | 32px | 700 | -0.02em | 페이지 제목, 카드 그룹 제목 |
| `headline-sm` | 20px | 28px | 700 | -0.02em | 카드 제목, 다이얼로그 제목 |
| `body-lg` | 16px | 24px | 400 | 0 | 주요 본문, 뉴스 콘텐츠 |
| `body-md` | 14px | 20px | 400 | 0 | 보조 본문, 목록 항목 |
| `body-sm` | 12px | 16px | 400 | 0.01em | 각주, 부가 정보 |
| `label-lg` | 14px | 20px | 600 | 0.01em | 버튼 텍스트, 폼 레이블 |
| `label-md` | 12px | 16px | 600 | 0.01em | 칩 텍스트, 작은 레이블 |
| `caption` | 11px | 14px | 400 | 0.02em | 타임스탬프, 메타데이터 |

### 타이포그래피 규칙

- **헤드라인 임팩트:** `display-lg`와 `display-sm`은 웨이트 800 + 타이트한 트래킹(-0.03em)을 사용하여 두 번째 서체 없이도 에디토리얼 중량감 확보
- **위계가 곧 아이덴티티:** 레이블에는 `color-text-secondary` 사용. `color-text-primary`는 제목에만 사용
- **에디토리얼 대비:** 큰 헤더(`display-lg`)와 작은 메타데이터(`caption`)를 짝지어 시각적 긴장감 조성
- 순수 검정(`#000000`)을 **절대** 사용 금지 — 항상 `color-text-primary` 이하 사용
- 최소 본문 크기: `body-sm` (12px). 프로덕션 UI에서 이보다 작은 크기 사용 금지
- **한국어 가독성:** Pretendard는 모든 크기에서 한글에 최적화되어 있으며, 데이터 밀집 페이지에서 특히 중요

---

## 5. 간격 시스템

**기본 단위:** 4px

| 토큰 | 값 | 주요 용도 |
|:---|:---|:---|
| `space-0` | 0px | 초기화 |
| `space-1` | 4px | 좁은 인라인 간격 (아이콘–텍스트) |
| `space-2` | 8px | 칩 패딩, 컴팩트 간격 |
| `space-3` | 12px | 작은 카드 패딩, 입력 필드 가로 패딩 |
| `space-4` | 16px | 기본 카드 패딩, 섹션 간격 |
| `space-5` | 20px | 중간 간격 |
| `space-6` | 24px | 카드 패딩 (넓은), 목록 항목 간격 |
| `space-8` | 32px | 페이지 내 섹션 구분 |
| `space-10` | 40px | 큰 섹션 간격 |
| `space-12` | 48px | 주요 콘텐츠 블록 구분 |
| `space-16` | 64px | 페이지 레벨 섹션 구분 |
| `space-20` | 80px | 히어로/배너 세로 패딩 |
| `space-24` | 96px | 최대 여유 공간 |

---

## 6. 브레이크포인트 및 레이아웃

| 토큰 | 값 | 대상 |
|:---|:---|:---|
| `bp-sm` | 640px | 모바일 가로 |
| `bp-md` | 768px | 태블릿 세로 |
| `bp-lg` | 1024px | 데스크톱 |
| `bp-xl` | 1280px | 와이드 데스크톱 |

- **콘텐츠 최대 너비:** 1200px, 자동 마진으로 중앙 정렬
- **모바일 우선:** 기본 스타일은 `< 640px` 대상. `min-width` 미디어 쿼리로 확대 적용
- **그리드:** 12열 그리드, 모바일 `space-4` (16px) 거터, 데스크톱 `space-6` (24px) 거터
- **페이지 패딩:** 모바일 `space-4` (16px), 데스크톱 `space-8` (32px)

---

## 7. 보더 라디우스 토큰

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `radius-sm` | 4px | 작은 요소 (인라인 태그, 툴팁) |
| `radius-md` | 8px | **기본값** — 카드, 버튼, 입력 필드 |
| `radius-lg` | 12px | 큰 카드, 모달, 이미지 컨테이너 |
| `radius-xl` | 16px | 히어로 카드, 프로모션 배너 |
| `radius-full` | 9999px | 칩, 아바타, 알약형 버튼 |

**규칙:** 모든 인터랙티브 요소는 최소 `radius-md` (8px)을 사용해야 합니다. 각진 모서리는 금지됩니다.

---

## 8. 엘리베이션 및 깊이감

### 톤 레이어링 (주요 방법)

그림자가 아닌 배경색 변화를 통한 깊이감. `color-bg-card`를 `color-bg-page` 위에 배치하면 — 은은한 대비가 자연스러운 부양감을 만듭니다.

### 앰비언트 그림자 (플로팅 요소에만 적용)

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `shadow-sm` | `0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)` | 은은한 부양 (드롭다운) |
| `shadow-md` | `0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)` | 호버 시 카드 |
| `shadow-lg` | `0 12px 40px rgba(15,23,42,0.08)` | 모달, 플로팅 액션 버튼 |

- **색상:** 틴티드 `neutral-900` (딥 네이비 그레이), 순수 검정 사용 금지

---

## 9. Z-Index 스케일

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `z-base` | 0 | 기본 스태킹 |
| `z-dropdown` | 100 | 드롭다운 메뉴, 셀렉트 패널 |
| `z-sticky` | 200 | 스티키 헤더, 플로팅 버튼 |
| `z-overlay` | 300 | 배경막 / 스크림 |
| `z-modal` | 400 | 모달 다이얼로그 |
| `z-toast` | 500 | 토스트 알림 (항상 최상위) |

---

## 10. 모션 토큰

| 토큰 | 값 | 용도 |
|:---|:---|:---|
| `duration-fast` | 150ms | 마이크로 인터랙션 (호버, 토글) |
| `duration-normal` | 250ms | 표준 전환 (패널 열기, 탭 전환) |
| `duration-slow` | 400ms | 복잡한 애니메이션 (모달 진입, 페이지 전환) |
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 범용 (ease-in-out) |
| `easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | 뷰포트에서 나가는 요소 |
| `easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | 뷰포트로 들어오는 요소 |

### 모션 규칙

- `prefers-reduced-motion: reduce` 존중 — 비필수 애니메이션 모두 비활성화
- 스켈레톤 로더는 `duration-slow`와 `easing-default`로 펄스
- 페이지 전환은 `duration-normal`과 `easing-out` 사용
- 레이아웃 속성(width, height)은 절대 애니메이션 금지 — `transform`과 `opacity`만 사용
- 모션은 주로 **에디토리얼 단계** 페이지(홈, 뉴스)에 적용. **실용 단계** 페이지(청약 목록, 상세)는 최소 애니메이션으로 즉시 렌더링

### 인터랙션 패턴

이 패턴들은 무엇이, 언제, 어떻게 움직이는지를 정의합니다. 모든 패턴은 `prefers-reduced-motion: reduce` 조건에서 비활성화됩니다.

#### 카드 리스트 스태거 진입 (에디토리얼 단계만)

카드가 뷰포트에 진입할 때 스태거 효과와 함께 페이드인됩니다. 홈 대시보드에서만 사용 — 청약 목록은 카드를 즉시 렌더링합니다.

```css
.card-list > * {
  opacity: 0;
  transform: translateY(12px);
  animation: fadeUp var(--duration-normal) var(--easing-out) forwards;
}
.card-list > *:nth-child(1) { animation-delay: 0ms; }
.card-list > *:nth-child(2) { animation-delay: 60ms; }
.card-list > *:nth-child(3) { animation-delay: 120ms; }
.card-list > *:nth-child(4) { animation-delay: 180ms; }
.card-list > *:nth-child(5) { animation-delay: 240ms; }
/* 5번째 이후 항목은 즉시 표시 */
```

#### 카드 호버 리프트

기존 "sunken 상태로 전환" 호버를 대체합니다. 눌림이 아닌 부양감을 제공합니다.

```css
.card:hover,
.card:focus-visible {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: transform var(--duration-fast) var(--easing-default),
              box-shadow var(--duration-fast) var(--easing-default);
}
```

#### 스켈레톤 로더 펄스

```css
@keyframes skeletonPulse {
  0%, 100% { background-color: var(--neutral-200); }
  50% { background-color: var(--neutral-100); }
}
.skeleton { animation: skeletonPulse var(--duration-slow) var(--easing-default) infinite; }
```

---

## 11. 컴포넌트

### 11.1 카드

핵심 컴포넌트. 모든 카드는 톤 레이어링을 사용하며 — 보더 라인은 없습니다.

#### 변형

| 변형 | 패딩 | 라디우스 | 설명 |
|:---|:---|:---|:---|
| **청약 카드** | `space-6` (24px) | `radius-lg` (12px) | 메인 목록 카드 — 제목, 위치, 날짜, 상태 칩, 핵심 통계 |
| **뉴스 카드** | `space-4` (16px) | `radius-md` (8px) | 기사 미리보기 — 썸네일, 헤드라인, 타임스탬프 |
| **통계 카드** | `space-4` (16px) | `radius-md` (8px) | 단일 지표 — 레이블, 큰 숫자, 트렌드 인디케이터 |
| **컴팩트 카드** | `space-3` (12px) | `radius-md` (8px) | 밀집 데이터 뷰용 리스트 스타일 카드 |

#### 카드 상태

**카드에 보더 금지.** 카드에는 좌/우 액센트 보더를 포함한 어떤 보더도 사용하지 않습니다. 상태는 상태 칩(색상 + 아이콘 + 텍스트 레이블)으로만 전달합니다.

| 상태 | 스타일 |
|:---|:---|
| 기본 | `color-bg-card` 배경 |
| 호버 | `translateY(-2px)` + `shadow-md`, 전환 150ms `easing-default` |
| 누름 | `translateY(0)` + `shadow-sm` |
| 포커스 가시화 | 호버와 동일 + 포커스 링 |
| 비활성 | 50% 불투명도, 인터랙션 없음 |

#### 카드 간격

- 카드 간 (세로 목록): `space-4` (16px)
- 카드 내부 섹션 간: `space-3` (12px)
- 카드 그룹 제목에서 첫 카드까지: `space-4` (16px)

### 11.2 버튼

| 속성 | Small (`sm`) | Medium (`md`) | Large (`lg`) |
|:---|:---|:---|:---|
| 높이 | 32px | 40px | 48px |
| 패딩 (x) | `space-3` (12px) | `space-4` (16px) | `space-6` (24px) |
| 폰트 | `label-md` | `label-lg` | `label-lg` |
| 라디우스 | `radius-md` (8px) | `radius-md` (8px) | `radius-md` (8px) |
| 최소 너비 | 64px | 80px | 120px |

#### 버튼 변형

| 변형 | 기본 | 호버 | 활성 | 비활성 |
|:---|:---|:---|:---|:---|
| **프라이머리** | 그라디언트 `brand-primary-500` → `brand-primary-400` 135° | `brand-primary-600` 솔리드 | `brand-primary-700` 솔리드 | `neutral-200` 배경, `neutral-400` 텍스트 |
| **세컨더리** | `brand-secondary-700` 배경, 흰색 텍스트 | `brand-secondary-800` 배경 | `brand-secondary-900` 배경 | `neutral-200` 배경, `neutral-400` 텍스트 |
| **터셔리** | 투명, `brand-primary-500` 텍스트 | `neutral-50` 배경 | `neutral-100` 배경 | `neutral-400` 텍스트, 배경 없음 |
| **위험** | `danger-500` 배경, 흰색 텍스트 | `danger-600` 배경 | `danger-700` 배경 | `neutral-200` 배경, `neutral-400` 텍스트 |

### 11.3 칩 (상태 표시기)

형태: `radius-full` (캡슐). 접근성을 위해 항상 색상과 아이콘 또는 텍스트 레이블을 함께 사용합니다.

| 상태 | 배경 | 텍스트 | 아이콘 |
|:---|:---|:---|:---|
| **접수중 (Active)** | `success-50` | `success-700` | `check-circle` (Lucide) |
| **접수예정 (Upcoming)** | `info-50` | `info-700` | `calendar` (Lucide) |
| **마감임박 (Closing Soon)** | `warning-50` | `warning-700` | `clock` (Lucide) |
| **마감 (Closed)** | `neutral-100` | `neutral-500` | `x-circle` (Lucide) |
| **특별공급 (Special Supply)** | `brand-primary-50` | `brand-primary-700` | `star` (Lucide) |
| **인기 (Trending)** | `brand-tertiary-50` | `brand-tertiary-700` | `flame` (Lucide) |

칩 패딩: `space-1` (4px) 세로, `space-2` (8px) 가로. 폰트: `label-md`.

### 11.4 내비게이션 — 하단 바 (모바일)

| 속성 | 값 |
|:---|:---|
| 높이 | 64px |
| 배경 | `color-bg-page` 80% 불투명도 |
| 배경막 | `blur(20px)` (glassmorphism) |
| 그림자 | `0 -1px 8px rgba(15,23,42,0.04)` 상단 그림자 |
| Z-index | `z-sticky` (200) |
| 레이아웃 | 균등 배치 아이콘 + 레이블 (최대 5개 항목) |
| 아이콘 크기 | 24px |
| 레이블 폰트 | `caption` (11px) |
| 활성 색상 | `brand-primary-500` |
| 비활성 색상 | `neutral-400` |
| 터치 타겟 | 항목당 최소 44×44px |

데스크톱(`bp-lg`+)에서는 내비게이션이 동일한 glassmorphism 처리를 적용한 상단 수평 바로 전환됩니다.

### 11.5 테이블 (청약 데이터)

| 속성 | 값 |
|:---|:---|
| 헤더 배경 | `color-bg-sunken` |
| 헤더 폰트 | `label-lg`, `color-text-secondary` |
| 행 배경 (짝수) | `color-bg-card` |
| 행 배경 (홀수) | `color-bg-page` |
| 행 패딩 | `space-3` (12px) 세로, `space-4` (16px) 가로 |
| 폰트 | `body-md` |
| 보더 | 없음 (교대 행 색상 사용) |
| 라디우스 | `radius-lg` (12px) 외부 컨테이너 |

**반응형:** 모바일(`< bp-sm`)에서 테이블은 스택형 카드 레이아웃으로 변환됩니다.

**데이터 테이블 보더 예외:** 카드 및 레이아웃 섹션과 달리, 데이터 테이블(공급 내역, 자격 기준, 일정 테이블)은 행 추적을 위해 `neutral-200` 30% 불투명도의 은은한 그리드 라인을 사용할 수 있습니다. 이는 No-Line 규칙의 한정적 예외로 — 밀집된 표형 데이터는 스캔 가능성을 위해 보이는 행 경계가 필요합니다.

### 11.6 입력 필드

| 속성 | Small (`sm`) | Medium (`md`) | Large (`lg`) |
|:---|:---|:---|:---|
| 높이 | 36px | 44px | 52px |
| 패딩 (x) | `space-3` (12px) | `space-3` (12px) | `space-4` (16px) |
| 폰트 | `body-sm` | `body-md` | `body-lg` |
| 라디우스 | `radius-md` (8px) | `radius-md` (8px) | `radius-md` (8px) |

#### 입력 필드 상태

| 상태 | 스타일 |
|:---|:---|
| 기본 | `color-bg-sunken` 채움, 보더 없음. 하단 2px 인디케이터 투명 |
| 포커스 | 하단 2px 인디케이터 `brand-primary-500`. 접근성 사양에 따른 외부 포커스 링 |
| 오류 | 하단 2px 인디케이터 `danger-500`. `danger-600` 색상의 도움말 텍스트 |
| 비활성 | 50% 불투명도, `not-allowed` 커서 |

### 11.7 스켈레톤 로더

| 컴포넌트 | 스켈레톤 형태 |
|:---|:---|
| 청약 카드 | `radius-lg` 사각형, 3줄 텍스트 바 (60%/80%/40% 너비), 칩 플레이스홀더 1개 |
| 뉴스 카드 | 썸네일 사각형 + 텍스트 바 2줄 |
| 통계 카드 | 작은 레이블 바 + 큰 숫자 바 + 트렌드 인디케이터 바 |
| 버튼 | 버튼 크기에 맞는 둥근 사각형 |
| 칩 | 칩 크기에 맞는 캡슐 형태 |
| 테이블 행 | 행 레이아웃의 수평 바 4~6개 |

- 배경: `neutral-200`
- 펄스: `neutral-200` → `neutral-100` → `neutral-200`, `duration-slow`와 `easing-default` 적용
- `prefers-reduced-motion` 존중 — 펄스 대신 정적 플레이스홀더 표시

---

## 12. 접근성 사양

### 대비 요구사항

| 요소 유형 | 최소 비율 | 표준 |
|:---|:---|:---|
| 일반 텍스트 (< 18px / < 14px 볼드) | 4.5:1 | WCAG AA |
| 큰 텍스트 (≥ 18px / ≥ 14px 볼드) | 3:1 | WCAG AA |
| UI 컴포넌트 및 그래픽 요소 | 3:1 | WCAG AA |
| 장식적 / 비활성 요소 | 최소 없음 | 면제 |

### 검증된 대비 조합

| 전경색 | 배경색 | 비율 | 통과 |
|:---|:---|:---|:---|
| `neutral-900` on `neutral-0` | `#0F172A` / `#FFFFFF` | 15.4:1 | AA/AAA |
| `neutral-600` on `neutral-0` | `#475569` / `#FFFFFF` | 6.0:1 | AA |
| `neutral-400` on `neutral-0` | `#94A3B8` / `#FFFFFF` | 2.6:1 | 장식/비활성 전용 |
| `brand-primary-500` on `neutral-0` | `#0356FF` / `#FFFFFF` | 5.6:1 | AA |
| `brand-secondary-700` on `secondary-50` | `#00B388` / `#EDFFF9` | 4.6:1 | AA |
| `brand-tertiary-700` on `tertiary-50` | `#BA4C27` / `#FFF4F0` | 5.8:1 | AA |
| `success-700` on `success-50` | `#15803D` / `#F0FDF4` | 6.2:1 | AA |
| `danger-700` on `danger-50` | `#9F1239` / `#FFF1F2` | 7.3:1 | AA/AAA |
| `warning-700` on `warning-50` | `#B45309` / `#FFFBEB` | 5.5:1 | AA |
| `info-700` on `info-50` | `#0E7490` / `#ECFEFF` | 5.7:1 | AA |

### 브랜드 컬러 접근성 제약

| 색상 | 흰색 배경 대비 | 안전한 사용 범위 |
|:---|:---|:---|
| `brand-secondary-500` (`#00FFC2`) | ~1.6:1 | **장식 전용** — 텍스트나 의미 있는 UI에 절대 사용 금지 |
| `brand-tertiary-500` (`#FF7C4C`) | ~3.3:1 | 큰 텍스트와 UI 컴포넌트에만 사용 |
| `brand-primary-500` (`#0356FF`) | ~5.6:1 | 모든 텍스트 크기 |

### 포커스 인디케이터

| 속성 | 값 |
|:---|:---|
| 스타일 | 2px solid `color-focus-ring` (`brand-primary-500`) |
| 오프셋 | 2px (요소 외부) |
| 라디우스 | 요소의 보더 라디우스와 동일 |
| 가시성 | `:focus-visible`에서만 표시 (클릭 시 미표시) |

### 터치 타겟

- **최소:** 모든 인터랙티브 요소에 44×44px (WCAG 2.5.5)
- 시각적 요소가 작을 경우 패딩 또는 `::after`로 탭 영역 확장
- 인접한 터치 타겟 간 최소 간격: `space-2` (8px)

### 모션 감소

`prefers-reduced-motion: reduce` 활성 시:
- 모든 전환 및 애니메이션 비활성화
- 스켈레톤 펄스를 정적 플레이스홀더로 대체
- 페이지 전환을 즉시 전환으로 대체
- 포커스 링 전환은 유지 (접근성에 필수)

### 색각 이상 안전성

- 상태 전달에 색상만 **절대** 사용 금지 — 항상 아이콘, 텍스트 레이블 또는 패턴과 함께 사용
- 모든 상태 칩은 색상 배경과 설명적 아이콘 모두 포함
- 차트 및 데이터 시각화는 색상 외에 패턴이나 레이블을 반드시 병행

---

## 13. 권장 사항 및 금지 사항

### 권장

- 비대칭 레이아웃으로 그리드를 깨뜨릴 것
- 상태 표시에는 기능 컬러를 사용할 것 — 브랜드 컬러 사용 금지
- 앱의 경쾌한 느낌을 위해 메인 콘텐츠에 `color-bg-card`를 우선 사용할 것
- 구현 시 시맨틱 컬러 토큰을 사용할 것 — 원시 hex 값 직접 사용 금지
- 모든 텍스트/배경 조합을 WCAG AA 대비 기준으로 테스트할 것
- 모든 인터랙티브 요소에 포커스 스타일을 포함할 것

### 금지

- 1px 디바이더 사용 금지 — `space-6` 패딩과 배경 전환으로 대체
- 텍스트에 순수 검정(`#000000`) 사용 금지 — 항상 `color-text-primary` 이하 사용
- 각진 모서리 사용 금지 — 모든 인터랙티브 요소에 최소 `radius-md` (8px)
- 다크 모드 도입 금지 — 이 시스템은 의도적으로 라이트 전용
- 상태 전달에 색상만 단독 사용 금지 — 항상 아이콘이나 텍스트와 병행
- 레이아웃 속성 애니메이션 금지 — `transform`과 `opacity`만 사용
- 프로덕션 UI에서 `caption` (11px) 미만 폰트 크기 설정 금지
- 흰색 배경 위 텍스트에 `brand-secondary-500` 사용 금지 — 대비 부적합

---

## 14. 아이콘 시스템

**아이콘 세트:** Lucide Icons (https://lucide.dev)

| 속성 | 값 |
|:---|:---|
| 스타일 | 아웃라인, 1.5px 스트로크 두께 |
| 캡 | 라운드 |
| 코너 | 라운드 (`radius-md` 철학과 일치) |
| 색상 | 부모 텍스트 컨텍스트의 `currentColor` 상속 |

### 크기 토큰

| 토큰 | 크기 | 용도 |
|:---|:---|:---|
| `icon-xs` | 16px | 본문 텍스트 내 인라인, 칩 아이콘 |
| `icon-sm` | 20px | 기본 UI 아이콘, 버튼 아이콘 |
| `icon-md` | 24px | 내비게이션 아이콘, 카드 액션 |
| `icon-lg` | 32px | 빈 상태, 기능 하이라이트 |

### 상태 칩 아이콘 매핑

| 상태 | Lucide 아이콘명 |
|:---|:---|
| 접수중 (Active) | `check-circle` |
| 접수예정 (Upcoming) | `calendar` |
| 마감임박 (Closing Soon) | `clock` |
| 마감 (Closed) | `x-circle` |
| 특별공급 (Special) | `star` |
| 인기 (Trending) | `flame` |

### 규칙

- 아웃라인 스타일만 사용. 채움 아이콘은 활성 내비게이션 상태에만 허용
- 같은 컨텍스트에서 아이콘 스타일(아웃라인 + 채움) 혼용 금지
- 모든 아이콘에 접근성 레이블(`aria-label` 또는 인접 텍스트) 필수
- 장식 아이콘에는 `aria-hidden="true"` 사용

---

## 15. 컬러 적용 패턴

토큰 스케일을 넘어, 이 패턴들은 브랜드 컬러가 분위기와 개성을 만들기 위해 어떻게 적용되는지를 정의합니다. 주로 **에디토리얼 단계** 페이지에 적용합니다.

### 히어로 그라디언트 메시 (홈 대시보드)

히어로 섹션에 은은한 방사형 그라디언트를 적용하여 콘텐츠와 경쟁하지 않으면서 대기적 깊이감을 만듭니다:

```css
.hero-section {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(3,86,255,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0,255,194,0.04) 0%, transparent 50%),
    var(--color-bg-page);
}
```

### 섹션 제목 데코레이터 (에디토리얼 단계만)

섹션 제목 위의 작은 그라디언트 바가 브랜드 시각 위계를 추가합니다:

```css
.section-decorator::before {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--brand-primary-500), var(--brand-secondary-500));
  margin-bottom: var(--space-4);
  border-radius: var(--radius-full);
}
```

홈 대시보드와 뉴스 페이지에서만 사용. 청약 목록/상세에서는 사용 금지.

### 인기 (Trending) 배지

경쟁률 높은 청약에 터셔리 색조 배지를 사용합니다:

```css
.badge-trending {
  background: var(--brand-tertiary-50);
  color: var(--brand-tertiary-700); /* 5.8:1 대비 — AA 통과 */
}
```

### 민트 저장 인디케이터

사용자가 청약을 저장/북마크하면 카드에 작은 민트 태그가 표시됩니다:

```css
.card--saved::after {
  content: '저장됨';
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: var(--brand-secondary-50);
  color: var(--brand-secondary-700);
  font: var(--label-md);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}
```

이는 민트 태그 = "나의 선택"이라는 시각 시스템을 만듭니다. 주요 저장 메커니즘인 공유 버튼(Web Share API)과 결합하여 사용됩니다. **카드에 보더 금지** — 상태와 상태 표현에는 태그/칩 요소를 사용합니다.

### 뉴스 히어로 카드 (이미지 위 텍스트)

피처드 뉴스 카드에서만, 헤드라인이 그라디언트 스크림과 함께 이미지 위에 오버레이됩니다:

```css
.news-hero__scrim {
  background: linear-gradient(transparent 30%, rgba(15,23,42,0.8) 100%);
}
.news-hero__headline {
  color: var(--neutral-0); /* 어두운 스크림 위 흰색 텍스트 */
  font-weight: 700;
}
```

스크림 최소 불투명도: **80%** — 모든 이미지 유형에서 WCAG AA 대비를 보장합니다. 일반 뉴스 카드는 표준 레이아웃(이미지 상단, 텍스트 하단)을 사용합니다.

### 사진 처리

청약 및 뉴스 이미지에 은은한 에디토리얼 그레이딩을 적용합니다:

```css
.editorial-image {
  filter: saturate(0.9) contrast(1.05);
}
```

### 데이터 시각화 스타일

차트와 그래프는 시각적 일관성을 위해 브랜드 트라이어드를 사용합니다:

| 데이터 시리즈 | 색상 |
|:---|:---|
| 프라이머리 시리즈 | `brand-primary-500` |
| 세컨더리 시리즈 | `brand-secondary-600` |
| 터셔리 시리즈 | `brand-tertiary-500` |
| 추가 시리즈 | `neutral-400`, `neutral-600` |

- 라인 차트: 2px 스트로크, 라운드 캡
- 바 차트: `radius-sm` (4px) 코너
- 모든 차트에 텍스트 레이블 포함 — 색상만으로 의미 전달 금지

---

## 16. 시각적 분위기

### 노이즈 그레인 (에디토리얼 단계만)

히어로 섹션과 피처 영역에 은은한 노이즈 텍스처 오버레이를 적용하여 "프리미엄 인쇄물" 느낌을 줍니다:

- 불투명도: 3–5%
- CSS 의사 요소 또는 SVG 필터를 통해 적용
- `@media (prefers-contrast: more)` 조건에서 비활성화
- 히어로 섹션과 에디토리얼 피처 영역에만 적용 — 데이터 밀집 페이지에서는 사용 금지

### 풀블리드 구성 (에디토리얼 단계만)

히어로 섹션과 피처드 콘텐츠는 1200px `max-width` 제약을 벗어나 전체 뷰포트 너비로 확장할 수 있습니다. 이는 사용자가 스크롤할 때 (제약 → 풀 → 제약) 시각적 리듬을 만듭니다.

적용 대상:
- 홈 대시보드 히어로 섹션
- 뉴스 기사 히어로 이미지
- 지도 뷰 (구현 시)

적용 금지:
- 청약 목록 카드
- 청약 상세 콘텐츠
- 데이터 테이블

---

## 17. 브랜드 에셋

| 파일 | 용도 | 사용 |
|:---|:---|:---|
| `logo.svg` | 공식 브랜드 로고 | 헤더, 푸터, 스플래시 화면, 파비콘 |
| `placeholder.svg` | 이미지 플레이스홀더 | 이용 불가/로딩 중 이미지 대체 |

- 대안 로고 파일이나 인라인 SVG 복제본을 생성하지 **말 것** — `logo.svg`를 직접 참조
- 플랫폼 제약이 없는 한 로고를 래스터화하지 **말 것**
- `placeholder.svg`를 빈 상태 이미지의 단일 참조점으로 사용
