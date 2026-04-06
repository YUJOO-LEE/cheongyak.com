import { ExternalLink, FileText, Home } from 'lucide-react';
import { Button } from '@/shared/components';

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
      label: '청약홈에서 신청하기',
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
      label: '모집공고 보기',
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
    <div className="flex flex-col sm:flex-row gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant={link.primary ? 'primary' : 'secondary'}
            size="lg"
            className="w-full"
          >
            <link.icon size={18} aria-hidden="true" />
            {link.label}
          </Button>
        </a>
      ))}
    </div>
  );
}
