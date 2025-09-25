import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Eye } from 'lucide-react';
import { formatNumber, calculateGrowth, getMonthlyRawData } from '../../services/campaignData';
import type { CampaignRecord, MonthlyAggregate } from '../../services/campaignData';
import { analyticsCardClasses, analyticsCardSkeletonClasses, chartLegendClasses, chartLegendDotClass } from './chartStyles';


const chartHeightClass = 'h-60 sm:h-64 xl:h-72';

interface ReachImpressionsChartProps {
  startMonth?: string;
  compareMonth?: string;
  monthlyData?: Record<string, MonthlyAggregate>;
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  currentReach: number;
  previousReach: number;
  currentImpressions: number;
  previousImpressions: number;
  reachGrowth: number;
  impressionsGrowth: number;
}


const mapCampaignToCurrent = (campaign: CampaignRecord, index: number) => ({
  name: `Campaign ${index + 1}`,
  fullName: campaign.campaignName,
  reach: campaign.reach,
  impressions: campaign.impressions,
});

const mapCampaignToPrevious = (campaign: CampaignRecord, index: number) => ({
  name: `Campaign ${index + 1}`,
  reach: campaign.reach,
  impressions: campaign.impressions,
});

const buildChartData = (current: CampaignRecord[], previous: CampaignRecord[]): ChartDataPoint[] => {
  const currentData = current.map(mapCampaignToCurrent);
  const previousData = previous.map(mapCampaignToPrevious);

  return currentData.map((currentEntry, index) => {
    const previousEntry = previousData[index];
    const previousReach = previousEntry?.reach ?? 0;
    const previousImpressions = previousEntry?.impressions ?? 0;

    return {
      name: currentEntry.name,
      fullName: currentEntry.fullName,
      currentReach: currentEntry.reach,
      previousReach,
      currentImpressions: currentEntry.impressions,
      previousImpressions,
      reachGrowth: calculateGrowth(currentEntry.reach, previousReach),
      impressionsGrowth: calculateGrowth(currentEntry.impressions, previousImpressions),
    };
  });
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as ChartDataPoint | undefined;
    if (!data) {
      return null;
    }

    const reachGrowth = Number.isFinite(data.reachGrowth) ? data.reachGrowth : 0;
    const impressionsGrowth = Number.isFinite(data.impressionsGrowth) ? data.impressionsGrowth : 0;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-900">{data.fullName}</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Reach</p>
            <div className="flex items-center justify-between">
              <span className="text-violet-600">Current</span>
              <span className="font-semibold">{formatNumber(data.currentReach)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Previous</span>
              <span className="font-medium">{formatNumber(data.previousReach)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Growth</span>
              <span
                className={`font-semibold ${
                  reachGrowth > 0 ? 'text-emerald-600' : reachGrowth < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}
              >
                {reachGrowth > 0 ? '+' : ''}
                {reachGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Impressions</p>
            <div className="flex items-center justify-between">
              <span className="text-sky-600">Current</span>
              <span className="font-semibold">{formatNumber(data.currentImpressions)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Previous</span>
              <span className="font-medium">{formatNumber(data.previousImpressions)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Growth</span>
              <span
                className={`font-semibold ${
                  impressionsGrowth > 0 ? 'text-emerald-600' : impressionsGrowth < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}
              >
                {impressionsGrowth > 0 ? '+' : ''}
                {impressionsGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const ReachImpressionsChart = ({ startMonth, compareMonth, monthlyData }: ReachImpressionsChartProps) => {
  if (!startMonth || !compareMonth || !monthlyData) {
    return (
      <div className={analyticsCardSkeletonClasses}>
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="h-48 rounded-xl bg-slate-100" />
      </div>
    );
  }

  const startData = getMonthlyRawData(startMonth);
  const compareData = getMonthlyRawData(compareMonth);

  const chartData = buildChartData(startData, compareData);

  return (
    <div className={analyticsCardClasses}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Eye className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Reach & Impressions</h3>
            <p className="text-sm text-slate-500">Compare visibility trends for each campaign.</p>
          </div>
        </div>
        <div className={chartLegendClasses}>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-violet-500`} />
            Current reach
          </span>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-sky-500`} />
            Current impressions
          </span>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-slate-400`} />
            Previous reach
          </span>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-slate-500`} />
            Previous impressions
          </span>
        </div>
      </header>

      <div className={chartHeightClass}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={12} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tickFormatter={(value) => formatNumber(Number(value))}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Line
              type="monotone"
              dataKey="currentReach"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6, fill: '#8b5cf6' }}
              name="Current reach"
            />
            <Line
              type="monotone"
              dataKey="currentImpressions"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', r: 4 }}
              activeDot={{ r: 6, fill: '#0ea5e9' }}
              name="Current impressions"
            />
            <Line
              type="monotone"
              dataKey="previousReach"
              stroke="#cbd5f5"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#cbd5f5', r: 3 }}
              name="Previous reach"
            />
            <Line
              type="monotone"
              dataKey="previousImpressions"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#94a3b8', r: 3 }}
              name="Previous impressions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReachImpressionsChart;

