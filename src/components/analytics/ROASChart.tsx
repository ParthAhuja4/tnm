import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Target } from 'lucide-react';
import { calculateGrowth, getMonthlyRawData } from '../../services/campaignData';
import type { CampaignRecord, MonthlyAggregate } from '../../services/campaignData';
import ChartAxisTick from './ChartAxisTick';
import { analyticsCardClasses, analyticsCardSkeletonClasses, chartLegendClasses, chartLegendDotClass } from './chartStyles';

const chartHeightClass = 'h-60 sm:h-64 xl:h-72';

interface ROASChartProps {
  startMonth?: string;
  compareMonth?: string;
  monthlyData?: Record<string, MonthlyAggregate>;
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  currentROAS: number;
  previousROAS: number;
  growth: number;
}


const buildChartData = (current: CampaignRecord[], previous: CampaignRecord[]): ChartDataPoint[] =>
  current.map((campaign, index) => {
    const compareCampaign = previous[index];
    const previousROAS = compareCampaign?.roas ?? 0;

    return {
      name: campaign.campaignName,
      fullName: campaign.campaignName,
      currentROAS: Number.parseFloat(campaign.roas.toFixed(2)),
      previousROAS: Number.parseFloat(previousROAS.toFixed(2)),
      growth: calculateGrowth(campaign.roas, previousROAS),
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
            <span className="text-emerald-600">Current ROAS</span>
            <span className="font-semibold">{data.currentROAS}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Previous ROAS</span>
            <span className="font-medium">{data.previousROAS}x</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-slate-600">Change</span>
            <span
              className={`font-semibold ${
                growth > 0 ? 'text-emerald-600' : growth < 0 ? 'text-rose-600' : 'text-slate-600'
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

const ROASChart = ({ startMonth, compareMonth, monthlyData }: ROASChartProps) => {
  if (!startMonth || !compareMonth || !monthlyData) {
    return (
      <div className={analyticsCardSkeletonClasses}>
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-48 rounded-xl bg-slate-100" />
      </div>
    );
  }

  const startData = getMonthlyRawData(startMonth);
  const compareData = getMonthlyRawData(compareMonth);

  const chartData = buildChartData(startData, compareData);
  const maxValue = chartData.length
    ? Math.max(...chartData.map((item) => Math.max(item.currentROAS, item.previousROAS)))
    : 0;
  const yDomainMax = maxValue > 0 ? maxValue * 1.1 : 1;

  return (
    <div className={analyticsCardClasses}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">ROAS Comparison</h3>
            <p className="text-sm text-slate-500">Track efficiency gains across campaigns.</p>
          </div>
        </div>
        <div className={chartLegendClasses}>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-emerald-500`} />
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
              tickFormatter={(value) => `${Number(value).toFixed(2)}x`}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Bar dataKey="currentROAS" fill="#10b981" radius={[4, 4, 0, 0]} name="Current period" />
            <Bar dataKey="previousROAS" fill="#cbd5f5" radius={[4, 4, 0, 0]} name="Previous period" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ROASChart;

