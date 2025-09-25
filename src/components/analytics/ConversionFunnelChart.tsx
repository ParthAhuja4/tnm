import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Filter } from 'lucide-react';
import { formatNumber, calculateGrowth, getMonthlyRawData } from '../../services/campaignData';
import type { CampaignRecord, MonthlyAggregate } from '../../services/campaignData';
import { analyticsCardClasses, analyticsCardSkeletonClasses } from './chartStyles';

const chartWrapper = 'h-56 sm:h-60';
const statCard = 'rounded-2xl border border-slate-100 bg-slate-50 p-4';

interface ConversionFunnelChartProps {
  startMonth?: string;
  compareMonth?: string;
  monthlyData?: Record<string, MonthlyAggregate>;
}

interface FunnelSlice {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

interface PieLabelProps {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  percent?: number;
}


const calculateTotals = (data: CampaignRecord[]) => {
  const addsToCart = data.reduce((sum, item) => sum + (item.addsToCart ?? 0), 0);
  const purchases = data.reduce((sum, item) => sum + (item.purchases ?? 0), 0);
  return { addsToCart, purchases };
};

const buildChartData = (addsToCart: number, purchases: number): FunnelSlice[] => {
  const total = addsToCart + purchases;
  const safeTotal = total > 0 ? total : 1;

  return [
    {
      name: 'Adds to Cart',
      value: addsToCart,
      color: '#f59e0b',
      percentage: ((addsToCart / safeTotal) * 100).toFixed(1),
    },
    {
      name: 'Purchases',
      value: purchases,
      color: '#10b981',
      percentage: ((purchases / safeTotal) * 100).toFixed(1),
    },
  ];
};

interface TooltipPayloadItem {
  payload?: FunnelSlice;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as FunnelSlice | undefined;
    if (!data) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-sm font-semibold text-slate-900">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Count</span>
            <span className="font-semibold">{formatNumber(data.value)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Percentage</span>
            <span className="font-semibold">{data.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: PieLabelProps) => {
  const numericCx = typeof cx === 'number' ? cx : Number(cx ?? 0);
  const numericCy = typeof cy === 'number' ? cy : Number(cy ?? 0);
  if (!Number.isFinite(numericCx) || !Number.isFinite(numericCy)) {
    return null;
  }

  const inner = typeof innerRadius === 'number' ? innerRadius : Number(innerRadius ?? 0);
  const outer = typeof outerRadius === 'number' ? outerRadius : Number(outerRadius ?? 0);
  const radius = inner + (outer - inner) * 0.5;
  const x = numericCx + radius * Math.cos(-midAngle * RADIAN);
  const y = numericCy + radius * Math.sin(-midAngle * RADIAN);


  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > numericCx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ConversionFunnelChart = ({ startMonth, compareMonth, monthlyData }: ConversionFunnelChartProps) => {
  if (!startMonth || !compareMonth || !monthlyData) {
    return (
      <div className={analyticsCardSkeletonClasses}>
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-48 rounded-xl bg-slate-100" />
      </div>
    );
  }

  const startData = getMonthlyRawData(startMonth);
  const compareData = getMonthlyRawData(compareMonth);

  const { addsToCart: currentAdds, purchases: currentPurchases } = calculateTotals(startData);
  const { addsToCart: previousAdds, purchases: previousPurchases } = calculateTotals(compareData);

  const currentChartData = buildChartData(currentAdds, currentPurchases);
  const currentConversionRate = currentAdds > 0 ? (currentPurchases / currentAdds) * 100 : 0;
  const previousConversionRate = previousAdds > 0 ? (previousPurchases / previousAdds) * 100 : 0;
  const conversionGrowth = calculateGrowth(currentConversionRate, previousConversionRate);

  return (
    <div className={analyticsCardClasses}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Filter className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Conversion Funnel</h3>
            <p className="text-sm text-slate-500">Understand drop-off between cart and purchase.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full text-center">
            <h4 className="text-sm font-semibold text-slate-600">Current period</h4>
          </div>
          <div className={`${chartWrapper} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentChartData} cx="50%" cy="50%" outerRadius={90} labelLine={false} label={renderCustomizedLabel} dataKey="value">
                  {currentChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4">
          <div className={statCard}>
            <h5 className="mb-3 text-sm font-semibold text-slate-600">Current period</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-amber-600">Adds to cart</span>
                <span className="font-semibold">{formatNumber(currentAdds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600">Purchases</span>
                <span className="font-semibold">{formatNumber(currentPurchases)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-slate-600">Conversion rate</span>
                <span className="font-semibold">{currentConversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className={statCard}>
            <h5 className="mb-3 text-sm font-semibold text-slate-600">Previous period</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Adds to cart</span>
                <span className="font-medium text-slate-600">{formatNumber(previousAdds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Purchases</span>
                <span className="font-medium text-slate-600">{formatNumber(previousPurchases)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-slate-600">Conversion rate</span>
                <span className="font-medium text-slate-600">{previousConversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-600">Conversion growth</span>
              <span
                className={
                  conversionGrowth > 0
                    ? 'text-emerald-600'
                    : conversionGrowth < 0
                    ? 'text-rose-600'
                    : 'text-slate-600'
                }
              >
                {conversionGrowth > 0 ? '+' : ''}
                {conversionGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnelChart;



