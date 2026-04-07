import { ExternalLink, FileText, Home } from 'lucide-react';

interface OfficialLinksProps {
  applyHomeUrl?: string;
  builderUrl?: string;
  announcementUrl?: string;
}

export function OfficialLinks({
  applyHomeUrl,
  builderUrl,
  announcementUrl,
}: OfficialLinksProps) {
  const links = [
    applyHomeUrl && {
      href: applyHomeUrl,
      label: '청약홈에서 신청',
      icon: Home,
      primary: true,
    },
    builderUrl && {
      href: builderUrl,
      label: '시행사 홈페이지',
      icon: ExternalLink,
      primary: false,
    },
    announcementUrl && {
      href: announcementUrl,
      label: '모집공고',
      icon: FileText,
      primary: false,
    },
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: typeof Home;
    primary: boolean;
  }>;

  if (links.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-lg',
              'transition-colors duration-fast ease-default',
              link.primary
                ? 'bg-brand-primary-500 text-neutral-0 hover:bg-brand-primary-600'
                : 'bg-bg-sunken text-text-primary hover:bg-neutral-200',
            ].join(' ')}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="text-label-lg truncate">{link.label}</span>
            <ExternalLink size={14} aria-hidden="true" className="shrink-0 ml-auto opacity-50" />
          </a>
        );
      })}
    </div>
  );
}
