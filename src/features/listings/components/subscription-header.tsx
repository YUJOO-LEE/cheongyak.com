import { ExternalLink, MapPin } from 'lucide-react';

import { StatusChip, TypeChip } from '@/shared/components';

import type { SubscriptionDetail } from '@/shared/types/api';

const NAVER_MAP_SEARCH = 'https://map.naver.com/p/search/';

/**
 * supplyAddress 가 "사업명(실제주소)" 패턴(예: "경기도 김포시 풍무역세권
 * 도시개발사업 B1BL(김포시 사우동 167-1번지)")이면 괄호 안 실제 주소만
 * 추출. 괄호 안에 숫자가 있을 때만 주소로 간주(빈 괄호·메모 괄호 방어).
 */
function extractAddressForSearch(raw: string): string {
  const paren = raw.match(/\(([^)]*\d[^)]*)\)/);
  if (paren) return paren[1].trim();
  return raw.trim();
}

function buildMapUrl(sub: SubscriptionDetail): string {
  const query = sub.supplyAddress
    ? extractAddressForSearch(sub.supplyAddress)
    : [
        sub.location.sido,
        sub.location.gugun,
        sub.location.dong,
        sub.name,
      ]
        .filter(Boolean)
        .join(' ');
  return `${NAVER_MAP_SEARCH}${encodeURIComponent(query)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = formatDate(start);
  if (s.getFullYear() === e.getFullYear()) {
    return `${startStr} ~ ${e.getMonth() + 1}.${e.getDate()}`;
  }
  return `${startStr} ~ ${formatDate(end)}`;
}

function formatMoveInMonth(raw: string): string {
  const match = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return raw;
  return `${match[1]}년 ${Number(match[2])}월`;
}

interface SubscriptionHeaderProps {
  subscription: SubscriptionDetail;
}

export function SubscriptionHeader({ subscription }: SubscriptionHeaderProps) {
  const showBusinessEntity =
    subscription.businessEntityName &&
    subscription.businessEntityName !== subscription.builder;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
          <StatusChip status={subscription.status} />
          <TypeChip type={subscription.type} />
        </div>
        <h1 className="text-display-sm font-bold text-text-primary leading-tight animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          {subscription.name}
        </h1>
        <div
          className="mt-2 flex items-start gap-1.5 text-body-sm text-text-secondary animate-fade-in-up"
          style={{ animationDelay: '90ms' }}
        >
          <MapPin size={16} aria-hidden="true" className="shrink-0 mt-0.5 text-text-tertiary" />
          <div className="min-w-0">
            {subscription.supplyAddress ? (
              <>
                <span>
                  {subscription.location.sido} {subscription.location.gugun}
                  {subscription.location.dong && ` ${subscription.location.dong}`}
                </span>
                <span className="block">
                  <MapLink href={buildMapUrl(subscription)}>
                    {subscription.supplyAddress}
                  </MapLink>
                </span>
              </>
            ) : (
              <MapLink href={buildMapUrl(subscription)}>
                {subscription.location.sido} {subscription.location.gugun}
                {subscription.location.dong && ` ${subscription.location.dong}`}
              </MapLink>
            )}
          </div>
        </div>
      </div>

      <dl className="bg-bg-card rounded-lg p-6 grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <InfoItem label="시행사">
            <span>{subscription.builder}</span>
            {showBusinessEntity && (
              <span className="block mt-0.5 text-body-sm text-text-tertiary font-normal">
                사업주체 {subscription.businessEntityName}
              </span>
            )}
          </InfoItem>
          <InfoItem label="세대수">
            총 {subscription.totalUnits.toLocaleString()}세대
          </InfoItem>
          <InfoItem label="평형">
            {subscription.sizeRange}
          </InfoItem>
          {subscription.priceRange && (
            <InfoItem label="분양가">
              {subscription.priceRange}
            </InfoItem>
          )}
          <InfoItem label="접수기간">
            {formatDateRange(subscription.applicationStart, subscription.applicationEnd)}
          </InfoItem>
          {subscription.moveInMonth && (
            <InfoItem label="입주예정">
              {formatMoveInMonth(subscription.moveInMonth)}
            </InfoItem>
          )}
      </dl>
    </div>
  );
}

function MapLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="네이버 지도에서 위치 보기"
      className="text-text-tertiary hover:underline hover:underline-offset-2"
    >
      {children}
      <ExternalLink
        size={14}
        aria-hidden="true"
        className="inline-block ml-1 -translate-y-px align-text-bottom"
      />
    </a>
  );
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-label-md text-text-tertiary mb-0.5">{label}</dt>
      <dd className="text-body-md text-text-primary font-medium">{children}</dd>
    </div>
  );
}
