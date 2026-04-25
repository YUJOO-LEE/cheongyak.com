import { buildPageMetadata } from '@/shared/lib/seo';

const EFFECTIVE_DATE = '2026년 4월 26일';
const OPERATOR_EMAIL = 'mail@leeyujoo.com';

export const metadata = buildPageMetadata({
  title: '이용약관',
  description:
    '청약닷컴 이용약관입니다. 본 서비스는 회원제를 운영하지 않으며 개인정보를 수집하지 않습니다.',
  path: '/terms',
  keywords: ['청약닷컴 이용약관', '이용약관', '서비스 약관'],
});

const articles = [
  {
    id: 'article-1',
    title: '제1조 (목적)',
    body: (
      <p>
        본 약관은 청약닷컴(https://cheongyak.com, 이하 “서비스”)의 이용에 관한
        조건과 절차, 이용자와 청약닷컴(이하 “운영자”)의 권리·의무 및 책임 사항을
        규정함을 목적으로 합니다.
      </p>
    ),
  },
  {
    id: 'article-2',
    title: '제2조 (정의)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          “서비스”란 운영자가 공공 데이터(한국부동산원 청약홈, LH 한국토지주택공사,
          국토교통부 등)를 정제하여 청약 일정·분양 정보·실거래가를 제공하는
          웹사이트를 말합니다.
        </li>
        <li>
          “이용자”란 본 약관에 따라 운영자가 제공하는 서비스를 이용하는 모든
          자를 말합니다. 본 서비스는 별도의 회원 가입 절차를 두지 않으므로,
          서비스에 접속하는 모든 방문자는 “이용자”에 해당합니다.
        </li>
        <li>
          “콘텐츠”란 운영자가 제공하는 청약 일정, 분양 정보, 시세 데이터, 텍스트,
          이미지, 디자인 요소, 코드 등 서비스에서 접근 가능한 모든 정보와 자료를
          말합니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-3',
    title: '제3조 (약관의 효력 및 변경)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          본 약관은 서비스 화면에 게시함으로써 효력을 발생합니다. 이용자가 서비스에
          접속하여 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
        </li>
        <li>
          운영자는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할
          수 있으며, 변경된 약관은 서비스 화면에 공지함으로써 효력을 발생합니다.
        </li>
        <li>
          이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있으며,
          변경된 약관 시행일 이후의 서비스 이용은 변경된 약관에 동의한 것으로
          봅니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-4',
    title: '제4조 (서비스의 내용)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>운영자는 다음과 같은 서비스를 제공합니다.
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>아파트 청약 일정·분양 정보 조회</li>
            <li>청약 단지의 상세 정보 및 공급 내역 안내</li>
            <li>실거래가 정보 (서비스 준비중)</li>
            <li>그 밖에 운영자가 추가로 개발하거나 다른 사업자와 제휴하여 제공하는 일체의 서비스</li>
          </ul>
        </li>
        <li>
          서비스에서 제공되는 정보는 공공 데이터를 기반으로 하며, 운영자는 가능한
          범위에서 신속하고 정확한 정보를 제공하기 위해 노력합니다. 다만 원본
          데이터의 오류·지연·누락에 대해서는 운영자가 직접 책임지지 않으며, 이용자는
          청약 신청 등 중요한 의사결정 시 반드시 청약홈 등 공식 사이트에서
          최종 확인하여야 합니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-5',
    title: '제5조 (서비스 이용)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          서비스는 연중무휴 24시간 제공함을 원칙으로 합니다. 다만 시스템 정기 점검,
          업데이트, 천재지변, 통신 장애 등 부득이한 사유로 일시 중단될 수 있습니다.
        </li>
        <li>
          본 서비스는 모든 이용자에게 무료로 제공됩니다. 운영자는 이용자에게 어떠한
          요금도 부과하지 않습니다.
        </li>
        <li>
          본 서비스는 회원 가입 절차를 두지 않으며, 이용자에게 어떠한 식별 정보도
          요구하지 않습니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-6',
    title: '제6조 (서비스의 변경 및 중단)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          운영자는 운영상·기술상의 필요에 따라 제공하고 있는 서비스의 전부 또는
          일부를 변경하거나 중단할 수 있습니다.
        </li>
        <li>
          서비스의 내용·이용 방법·이용 시간에 변경이 있는 경우, 변경 사유·변경될
          서비스의 내용 및 제공 일자 등을 변경 전에 서비스 화면에 게시합니다.
        </li>
        <li>
          운영자가 서비스를 종료하고자 하는 경우, 종료일로부터 30일 이전에 서비스
          화면에 공지합니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-7',
    title: '제7조 (게시물의 저작권)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          서비스에 게시된 콘텐츠 중 운영자가 직접 제작한 디자인·코드·문구·이미지의
          저작권은 운영자에게 있습니다.
        </li>
        <li>
          운영자가 정제하여 제공하는 청약 일정·분양 정보·실거래가 등의 원시 데이터는
          한국부동산원, LH 한국토지주택공사, 국토교통부 등 각 기관에 저작권 또는
          제공 권리가 귀속됩니다.
        </li>
        <li>
          이용자는 운영자의 사전 동의 없이 서비스의 콘텐츠를 복제·전송·출판·배포·
          방송하거나 자동화된 수단으로 대량 수집(크롤링·스크래핑 등)할 수 없습니다.
          단 비영리 목적의 개인적 열람·인용은 허용됩니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-8',
    title: '제8조 (이용자의 의무)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>이용자는 다음 각 호의 행위를 하여서는 안 됩니다.
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>서비스의 안정적 운영을 방해하는 일체의 행위</li>
            <li>운영자 또는 제3자의 저작권, 기타 권리를 침해하는 행위</li>
            <li>자동화된 수단을 이용한 대량 데이터 수집 또는 비정상적인 트래픽 유발</li>
            <li>서비스에서 제공하는 정보를 변조하여 재배포하는 행위</li>
            <li>기타 관계 법령에 위배되는 행위</li>
          </ul>
        </li>
      </ol>
    ),
  },
  {
    id: 'article-9',
    title: '제9조 (개인정보의 보호)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          본 서비스는 회원제를 운영하지 않으며, 이용자에게 어떠한 개인정보도 수집·
          저장하지 않습니다.
        </li>
        <li>
          서비스 운영을 위한 익명 접속 통계(접속 시각, 페이지 경로, 브라우저 종류
          등)는 호스팅 사업자(예: Vercel)에 의해 자동 수집될 수 있으며, 이는 개인을
          식별할 수 없는 형태로만 사용됩니다.
        </li>
        <li>
          이용자가 자발적으로 운영자에게 이메일을 보내는 경우, 해당 이메일은 문의
          처리 목적 외에 사용되지 않으며, 처리 완료 후 합리적 기간 내에 폐기됩니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-10',
    title: '제10조 (면책)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          운영자는 천재지변, 전쟁, 통신 사업자의 서비스 중단, 호스팅 사업자의 장애
          등 운영자의 합리적 통제를 벗어난 사유로 서비스를 제공할 수 없는 경우
          서비스 제공에 관한 책임이 면제됩니다.
        </li>
        <li>
          운영자는 원본 데이터(청약홈·LH·국토교통부 등)의 오류·지연·누락으로 인해
          이용자가 입은 손해에 대하여 책임지지 않습니다. 청약 신청 등 중요한
          의사결정은 반드시 공식 사이트에서 최종 확인하여야 합니다.
        </li>
        <li>
          운영자는 이용자가 서비스를 통해 얻은 정보로 인한 결과적 손해(청약 탈락,
          투자 손실 등)에 대해서는 어떠한 책임도 지지 않습니다.
        </li>
        <li>
          운영자는 이용자 상호 간 또는 이용자와 제3자 간에 서비스를 매개로 발생한
          분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.
        </li>
      </ol>
    ),
  },
  {
    id: 'article-11',
    title: '제11조 (분쟁 해결 및 관할 법원)',
    body: (
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          본 약관과 관련된 분쟁은 대한민국 법률을 준거법으로 합니다.
        </li>
        <li>
          운영자와 이용자 간에 발생한 분쟁은 상호 협의하여 원만히 해결함을
          원칙으로 하며, 협의가 이루어지지 않을 경우 민사소송법상의 관할 법원을
          제1심 법원으로 합니다.
        </li>
      </ol>
    ),
  },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-300 px-4 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <header className="mb-12 lg:mb-16">
        <h1 className="text-display-sm text-text-primary mb-3">이용약관</h1>
        <p className="text-caption text-text-tertiary">
          시행일: {EFFECTIVE_DATE}
        </p>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16">
        {/* Sticky TOC (desktop) */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <nav aria-label="이용약관 목차">
            <p className="text-label-md text-text-tertiary mb-3">목차</p>
            <ol className="flex flex-col gap-2">
              {articles.map((a) => (
                <li key={a.id}>
                  <a
                    href={`#${a.id}`}
                    className="text-body-sm text-text-secondary hover:text-brand-primary-600 transition-colors duration-fast ease-default"
                  >
                    {a.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#addendum"
                  className="text-body-sm text-text-secondary hover:text-brand-primary-600 transition-colors duration-fast ease-default"
                >
                  부칙
                </a>
              </li>
            </ol>
          </nav>
        </aside>

        {/* Main body */}
        <div>
          {/* Inline TOC (mobile) */}
          <nav
            aria-label="이용약관 목차"
            className="lg:hidden bg-bg-sunken rounded-lg p-5 mb-10"
          >
            <p className="text-label-md text-text-tertiary mb-3">목차</p>
            <ol className="flex flex-col gap-2">
              {articles.map((a) => (
                <li key={a.id}>
                  <a
                    href={`#${a.id}`}
                    className="text-body-sm text-brand-primary-600"
                  >
                    {a.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#addendum" className="text-body-sm text-brand-primary-600">
                  부칙
                </a>
              </li>
            </ol>
          </nav>

          {articles.map((a) => (
            <section
              key={a.id}
              id={a.id}
              className="scroll-mt-24 mb-12 text-body-md text-text-secondary"
            >
              <h2 className="text-headline-sm text-text-primary mb-4">
                {a.title}
              </h2>
              <div className="leading-relaxed">{a.body}</div>
            </section>
          ))}

          {/* Addendum */}
          <section
            id="addendum"
            className="scroll-mt-24 mb-12 text-body-md text-text-secondary"
          >
            <h2 className="text-headline-sm text-text-primary mb-4">부칙</h2>
            <p className="leading-relaxed mb-4">
              본 약관은 {EFFECTIVE_DATE}부터 시행됩니다.
            </p>
            <div className="bg-bg-sunken rounded-lg p-5">
              <p className="text-label-md text-text-tertiary mb-2">운영자 정보</p>
              <p className="text-body-md text-text-primary mb-1">운영자: 청약닷컴</p>
              <p className="text-body-md text-text-primary">
                연락처:{' '}
                <a
                  href={`mailto:${OPERATOR_EMAIL}`}
                  className="text-brand-primary-600 hover:text-brand-primary-700 transition-colors duration-fast ease-default"
                >
                  {OPERATOR_EMAIL}
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
