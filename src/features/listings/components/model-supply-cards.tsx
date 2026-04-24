import { formatArea } from '@/features/listings/lib/map-apt-sales';
import { formatPriceManWon } from '@/features/listings/lib/map-apt-sales-detail';
import type { ModelSupply } from '@/shared/types/api';

interface ModelSupplyCardsProps {
  models: ModelSupply[];
}

/**
 * Per-평형 supply card grid. Each card shows 공급면적, 일반/특공 세대수,
 * 특공 세분 유형별 배정, 최고 분양가. Replaces the older category-aggregated
 * table because the API carries per-model precision users need when
 * picking which 평형 to apply for.
 */
export function ModelSupplyCards({ models }: ModelSupplyCardsProps) {
  if (models.length === 0) {
    return (
      <p className="text-body-md text-text-tertiary">
        공급 정보가 아직 등록되지 않았습니다.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {models.map((model) => (
        <li
          key={model.modelNo}
          className="bg-bg-sunken rounded-md p-5 flex flex-col gap-4"
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-label-md text-text-tertiary">
                모델 {model.modelNo}
              </p>
              <p className="text-headline-sm text-text-primary font-semibold">
                {model.houseType ?? '주택형 미정'}
              </p>
            </div>
            {typeof model.supplyArea === 'number' && (
              <span className="shrink-0 text-body-sm text-text-secondary">
                {formatArea(model.supplyArea)}
              </span>
            )}
          </header>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <CountRow label="일반공급" value={model.generalCount} />
            <CountRow label="특별공급" value={model.specialCount} />
          </dl>

          {model.specialBreakdown.length > 0 && (
            <div>
              <p className="text-label-md text-text-tertiary mb-1.5">
                특공 세분
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {model.specialBreakdown.map((item) => (
                  <li
                    key={item.category}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-bg-card text-caption text-text-secondary"
                  >
                    <span>{item.category}</span>
                    <span className="text-text-primary font-medium">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {typeof model.topAmount === 'number' && (
            <footer className="flex items-baseline justify-between border-t border-border-divider pt-3">
              <span className="text-label-md text-text-tertiary">
                최고 분양가
              </span>
              <span className="text-body-md text-text-primary font-semibold">
                {formatPriceManWon(model.topAmount)}
              </span>
            </footer>
          )}
        </li>
      ))}
    </ul>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-label-md text-text-tertiary">{label}</dt>
      <dd className="text-body-md text-text-primary font-medium">
        {value.toLocaleString()}세대
      </dd>
    </div>
  );
}
