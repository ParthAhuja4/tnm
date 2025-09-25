import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Clock } from 'lucide-react';
import { formatNumber, getMonthlyRawData } from '../../services/campaignData';
import type { CampaignRecord, MonthlyAggregate } from '../../services/campaignData';
import ChartAxisTick from './ChartAxisTick';
import { analyticsCardClasses, analyticsCardSkeletonClasses, chartLegendClasses, chartLegendDotClass } from './chartStyles';

const chartHeightClass = 'h-72 sm:h-80 xl:h-[22rem]';

interface TimelineChartProps {
  startMonth?: string;
  compareMonth?: string;
  monthlyData?: Record<string, MonthlyAggregate>;
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  currentDuration: number;
  previousDuration: number;
  currentResults: number;
  previousResults: number;
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
}


const calculateDurationInDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();

  if (!Number.isFinite(timeDiff) || timeDiff <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
};

const mapCampaignToTimeline = (campaign: CampaignRecord) => {
  const startDate = campaign.reportingStarts;
  const endDate = campaign.reportingEnds;

  return {
    fullName: campaign.campaignName,
    duration: calculateDurationInDays(startDate, endDate),
    startDate,
    endDate,
    results: campaign.results,
  };
};

const buildChartData = (current: CampaignRecord[], previous: CampaignRecord[]): ChartDataPoint[] => {
  const currentTimeline = current.map(mapCampaignToTimeline);
  const previousTimeline = previous.map(mapCampaignToTimeline);

  return currentTimeline.map((currentEntry, index) => {
    const previousEntry = previousTimeline[index];

    return {
      name: currentEntry.fullName,
      fullName: currentEntry.fullName,
      currentDuration: currentEntry.duration,
      previousDuration: previousEntry?.duration ?? 0,
      currentResults: currentEntry.results,
      previousResults: previousEntry?.results ?? 0,
      currentStartDate: currentEntry.startDate,
      currentEndDate: currentEntry.endDate,
      previousStartDate: previousEntry?.startDate ?? '',
      previousEndDate: previousEntry?.endDate ?? '',
    };
  });
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as ChartDataPoint | undefined;
    if (!data) {
      return null;
    }

    return (
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-900">{data.fullName}</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current period</p>
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-indigo-600">Duration</span>
                <span className="font-semibold">{data.currentDuration} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Results</span>
                <span className="font-semibold">{formatNumber(data.currentResults)}</span>
              </div>
              <p className="text-xs text-slate-500">
                {data.currentStartDate} to {data.currentEndDate}
              </p>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Previous period</p>
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium">{data.previousDuration} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Results</span>
                <span className="font-medium">{formatNumber(data.previousResults)}</span>
              </div>
              <p className="text-xs text-slate-500">
                {data.previousStartDate} to {data.previousEndDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const TimelineChart = ({ startMonth, compareMonth, monthlyData }: TimelineChartProps) => {
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
  const maxDuration = chartData.length
    ? Math.max(...chartData.map((item) => Math.max(item.currentDuration, item.previousDuration)))
    : 0;
  const yDomainMax = maxDuration > 0 ? maxDuration * 1.1 : 1;

  return (
    <div className={analyticsCardClasses}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Campaign Timeline Comparison</h3>
            <p className="text-sm text-slate-500">Measure campaign length and outcome shifts.</p>
          </div>
        </div>
        <div className={chartLegendClasses}>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-indigo-500`} />
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
          <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 105 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tickMargin={16}
              height={90}
              tick={<ChartAxisTick maxChars={20} />}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              domain={[0, yDomainMax]}
              tickFormatter={(value) => `${Number(value)}d`}
              label={{
                value: 'Duration (days)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#475569', fontSize: 12, fontWeight: 600 },
              }}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Bar dataKey="currentDuration" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current period" />
            <Bar dataKey="previousDuration" fill="#cbd5f5" radius={[4, 4, 0, 0]} name="Previous period" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimelineChart;

