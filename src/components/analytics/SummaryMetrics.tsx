import type { ComponentType } from 'react';
import { analyticsCardClasses, analyticsCardSkeletonClasses } from './chartStyles';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  calculateGrowth,
  formatCurrency,
  formatNumber,
  formatPercentage,
  type MonthlyAggregate,
} from '../../services/campaignData';

const badgeBase = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold';
const positiveBadge = `${badgeBase} border-teal-200 bg-teal-50 text-teal-600`;
const negativeBadge = `${badgeBase} border-rose-200 bg-rose-50 text-rose-600`;
const neutralBadge = `${badgeBase} border-slate-200 bg-slate-100 text-slate-600`;

interface GrowthIndicatorProps {
  growth: number;
  showIcon?: boolean;
}

const GrowthIndicator = ({ growth, showIcon = true }: GrowthIndicatorProps) => {
  const isPositive = growth > 0;
  const isNeutral = Math.abs(growth) < 0.01;

  if (isNeutral) {
    return (
      <span className={neutralBadge}>
        {showIcon && <Minus className="h-3 w-3" />}
        {formatPercentage(Math.abs(growth))}
      </span>
    );
  }

  return (
    <span className={isPositive ? positiveBadge : negativeBadge}>
      {showIcon && (isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
      {formatPercentage(Math.abs(growth))}
    </span>
  );
};

interface MetricCardProps {
  title: string;
  current: number;
  previous: number;
  formatter?: (value: number) => string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
}

const MetricCard = ({ title, current, previous, formatter, icon: Icon, subtitle }: MetricCardProps) => {
  const growth = calculateGrowth(current, previous);
  const formattedCurrent = formatter ? formatter(current) : String(current);

  return (
    <article className={`${analyticsCardClasses} gap-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{title}</span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{formattedCurrent}</div>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <GrowthIndicator growth={growth} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
        <span className="text-slate-500">Previous period</span>
        <span className="font-medium text-slate-700">{formatter ? formatter(previous) : String(previous)}</span>
      </div>
    </article>
  );
};

interface SummaryMetricsProps {
  startData: MonthlyAggregate | null;
  compareData: MonthlyAggregate | null;
}

const SummaryMetrics = ({ startData, compareData }: SummaryMetricsProps) => {
  if (!startData || !compareData) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={`${analyticsCardSkeletonClasses} gap-5`}>
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-8 w-1/2 rounded bg-slate-300" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Sessions',
      current: startData.reach,
      previous: compareData.reach,
      formatter: (val: number) => formatNumber(val),
      subtitle: 'Total unique visitors',
    },
    {
      title: 'Sales Attributed',
      current: startData.conversionValue,
      previous: compareData.conversionValue,
      formatter: formatCurrency,
      subtitle: 'Revenue generated',
    },
    {
      title: 'Orders',
      current: startData.purchases,
      previous: compareData.purchases,
      formatter: (val: number) => formatNumber(val),
      subtitle: 'Completed purchases',
    },
    {
      title: 'Conversion Rate',
      current: startData.conversionRate,
      previous: compareData.conversionRate,
      formatter: (val: number) => formatPercentage(val, 2),
      subtitle: 'Purchase rate',
    },
    {
      title: 'Impressions',
      current: startData.impressions,
      previous: compareData.impressions,
      formatter: (val: number) => formatNumber(val),
      subtitle: 'Ad views',
    },
    {
      title: 'ROAS',
      current: startData.avgROAS,
      previous: compareData.avgROAS,
      formatter: (val: number) => `${formatNumber(val, 2)}x`,
      subtitle: 'Return on ad spend',
    },
    {
      title: 'Amount Spent',
      current: startData.amountSpent,
      previous: compareData.amountSpent,
      formatter: formatCurrency,
      subtitle: 'Total ad spend',
    },
    {
      title: 'Cost Per Purchase',
      current: startData.costPerPurchase,
      previous: compareData.costPerPurchase,
      formatter: formatCurrency,
      subtitle: 'Acquisition cost',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
};

export default SummaryMetrics;


