import { ExternalLink, FileText, Home, Phone, ChevronRight } from 'lucide-react';

interface OfficialLinksProps {
  applyHomeUrl?: string;
  builderUrl?: string;
  announcementUrl?: string;
  inquiryPhone?: string;
}

interface LinkSpec {
  href: string;
  label: string;
  icon: typeof Home;
  primary: boolean;
  external: boolean;
}

export function OfficialLinks({
  applyHomeUrl,
  builderUrl,
  announcementUrl,
  inquiryPhone,
}: OfficialLinksProps) {
  const links: LinkSpec[] = [
    // 시행사 홈페이지가 사이드바 1번 자리이자 primary CTA. 시행사 URL 이
    // 없을 때만 모집공고 → 청약홈 순으로 primary 자격이 양보됩니다.
    builderUrl && {
      href: builderUrl,
      label: '시행사 홈페이지',
      icon: ExternalLink,
      primary: true,
      external: true,
    },
    announcementUrl && {
      href: announcementUrl,
      label: '모집공고',
      icon: FileText,
      primary: !builderUrl,
      external: true,
    },
    applyHomeUrl && {
      href: applyHomeUrl,
      label: '청약홈에서 신청',
      icon: Home,
      primary: !builderUrl && !announcementUrl,
      external: true,
    },
    inquiryPhone && {
      href: `tel:${inquiryPhone.replace(/[^0-9+]/g, '')}`,
      label: `문의 ${inquiryPhone}`,
      icon: Phone,
      primary: false,
      external: false,
    },
  ].filter(Boolean) as LinkSpec[];

  if (links.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.href}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className={[
              'group flex items-center gap-3 px-4 py-3 rounded-lg',
              'transition-all duration-fast ease-default',
              'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm',
              link.primary
                ? 'bg-brand-primary-500 text-text-inverse hover:bg-brand-primary-600'
                : 'bg-button-secondary text-text-primary hover:bg-button-secondary-hover',
            ].join(' ')}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="text-label-lg truncate">{link.label}</span>
            <ChevronRight size={16} aria-hidden="true" className="shrink-0 ml-auto text-text-tertiary transition-transform duration-fast group-hover:translate-x-1" />
          </a>
        );
      })}
    </div>
  );
}
