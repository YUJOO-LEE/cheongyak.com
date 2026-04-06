import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/shared/components';
import type { MarketInsight } from '@/shared/types/api';

interface MarketInsightCardsProps {
  insights: MarketInsight[];
}

export function MarketInsightCards({ insights }: MarketInsightCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight) => (
        <Card key={insight.label} variant="stat" interactive={false}>
          <p className="text-label-md text-text-secondary mb-1">
            {insight.label}
          </p>
          <p className="text-headline-lg text-text-primary mb-1">
            {insight.value}
          </p>
          <div className="flex items-center gap-1">
            <TrendIcon trend={insight.trend} />
            <span
              className={[
                'text-body-sm',
                insight.trend === 'up' && 'text-danger-500',
                insight.trend === 'down' && 'text-success-500',
                insight.trend === 'flat' && 'text-text-tertiary',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {insight.trendValue}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TrendIcon({ trend }: { trend: MarketInsight['trend'] }) {
  const iconProps = { size: 14, 'aria-hidden': true as const };

  switch (trend) {
    case 'up':
      return <TrendingUp {...iconProps} className="text-danger-500" />;
    case 'down':
      return <TrendingDown {...iconProps} className="text-success-500" />;
    case 'flat':
      return <Minus {...iconProps} className="text-text-tertiary" />;
  }
}
