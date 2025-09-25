import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { DollarSign } from 'lucide-react';
import { formatCurrency, calculateGrowth, getMonthlyRawData } from '../../services/campaignData';
import type { CampaignRecord, MonthlyAggregate } from '../../services/campaignData';
import ChartAxisTick from './ChartAxisTick';
import { analyticsCardClasses, analyticsCardSkeletonClasses, chartLegendClasses, chartLegendDotClass } from './chartStyles';

const chartHeightClass = 'h-60 sm:h-64 xl:h-72';

interface CostPerPurchaseChartProps {
  startMonth?: string;
  compareMonth?: string;
  monthlyData?: Record<string, MonthlyAggregate>;
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  currentCost: number;
  previousCost: number;
  growth: number;
}


const buildChartData = (current: CampaignRecord[], previous: CampaignRecord[]): ChartDataPoint[] =>
  current.map((campaign, index) => {
    const compareCampaign = previous[index];
    const previousCost = compareCampaign?.costPerPurchase ?? 0;

    return {
      name: campaign.campaignName,
      fullName: campaign.campaignName,
      currentCost: Number.parseFloat(campaign.costPerPurchase.toFixed(2)),
      previousCost: Number.parseFloat(previousCost.toFixed(2)),
      growth: calculateGrowth(campaign.costPerPurchase, previousCost),
    };
  });

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as ChartDataPoint | undefined;
    if (!data) {
      return null;
    }

    const growth = Number.isFinite(data.growth) ? data.growth : 0;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-900">{data.fullName}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-orange-600">Current cost</span>
            <span className="font-semibold">{formatCurrency(data.currentCost)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Previous cost</span>
            <span className="font-medium">{formatCurrency(data.previousCost)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-slate-600">Change</span>
            <span
              className={`font-semibold ${
                growth < 0 ? 'text-emerald-600' : growth > 0 ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              {growth > 0 ? '+' : ''}
              {growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const CostPerPurchaseChart = ({ startMonth, compareMonth, monthlyData }: CostPerPurchaseChartProps) => {
  if (!startMonth || !compareMonth || !monthlyData) {
    return (
      <div className={analyticsCardSkeletonClasses}>
        <div className="h-5 w-28 rounded bg-slate-200" />
        <div className="h-48 rounded-xl bg-slate-100" />
      </div>
    );
  }

  const startData = getMonthlyRawData(startMonth);
  const compareData = getMonthlyRawData(compareMonth);

  const chartData = buildChartData(startData, compareData);
  const maxValue = chartData.length
    ? Math.max(...chartData.map((item) => Math.max(item.currentCost, item.previousCost)))
    : 0;
  const yDomainMax = maxValue > 0 ? maxValue * 1.1 : 1;

  return (
    <div className={analyticsCardClasses}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <DollarSign className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Cost Per Purchase</h3>
            <p className="text-sm text-slate-500">Spot acquisition cost shifts by campaign.</p>
          </div>
        </div>
        <div className={chartLegendClasses}>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-orange-500`} />
            Current
          </span>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-slate-400`} />
            Previous
          </span>
        </div>
      </header>

      <div className={chartHeightClass}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              interval={0}
              tick={<ChartAxisTick maxChars={18} />}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              domain={[0, yDomainMax]}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Bar dataKey="currentCost" fill="#f97316" radius={[4, 4, 0, 0]} name="Current period" />
            <Bar dataKey="previousCost" fill="#cbd5f5" radius={[4, 4, 0, 0]} name="Previous period" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostPerPurchaseChart;

