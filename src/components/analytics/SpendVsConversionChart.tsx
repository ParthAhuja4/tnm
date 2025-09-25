import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, getMonthlyRawData } from '../../services/campaignData';
import type { CampaignRecord, MonthlyAggregate } from '../../services/campaignData';
import { analyticsCardClasses, analyticsCardSkeletonClasses, chartLegendClasses, chartLegendDotClass } from './chartStyles';


const chartHeightClass = 'h-60 sm:h-64 xl:h-72';

interface SpendVsConversionChartProps {
  startMonth?: string;
  compareMonth?: string;
  monthlyData?: Record<string, MonthlyAggregate>;
}

interface ScatterPoint {
  name: string;
  fullName: string;
  x: number;
  y: number;
  roas: number;
  period: 'Current' | 'Previous';
  color: string;
}


const mapCampaignToPoint = (
  campaign: CampaignRecord,
  period: 'Current' | 'Previous',
  color: string
): ScatterPoint => ({
  name: campaign.campaignName,
  fullName: campaign.campaignName,
  x: campaign.amountSpent,
  y: campaign.conversionValue,
  roas: campaign.roas,
  period,
  color,
});

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as ScatterPoint | undefined;
    if (!data) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-900">{data.fullName}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Period</span>
            <span className={`font-semibold ${data.period === 'Current' ? 'text-sky-600' : 'text-slate-500'}`}>
              {data.period}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Amount spent</span>
            <span className="font-semibold">{formatCurrency(data.x)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Conversion value</span>
            <span className="font-semibold">{formatCurrency(data.y)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-slate-600">ROAS</span>
            <span className="font-semibold text-emerald-600">{formatNumber(data.roas, 2)}x</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const SpendVsConversionChart = ({ startMonth, compareMonth, monthlyData }: SpendVsConversionChartProps) => {
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

  const currentChartData = startData.map((campaign) => mapCampaignToPoint(campaign, 'Current', '#0ea5e9'));
  const compareChartData = compareData.map((campaign) => mapCampaignToPoint(campaign, 'Previous', '#94a3b8'));

  const allData = [...currentChartData, ...compareChartData];
  const maxSpend = allData.length ? Math.max(...allData.map((item) => item.x)) : 0;
  const maxConversion = allData.length ? Math.max(...allData.map((item) => item.y)) : 0;
  const xDomainMax = maxSpend > 0 ? maxSpend * 1.1 : 1;
  const yDomainMax = maxConversion > 0 ? maxConversion * 1.1 : 1;

  return (
    <div className={analyticsCardClasses}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Spend vs Conversion</h3>
            <p className="text-sm text-slate-500">Correlation between spend and return.</p>
          </div>
        </div>
        <div className={chartLegendClasses}>
          <span className="inline-flex items-center gap-2">
            <span className={`${chartLegendDotClass} bg-sky-500`} />
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
          <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              type="number"
              dataKey="x"
              name="Amount Spent"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              domain={[0, xDomainMax]}
              tickFormatter={(value) => `$${formatNumber(Number(value))}`}
              label={{
                value: 'Amount Spent ($)',
                position: 'insideBottom',
                offset: -6,
                style: { fill: '#475569', fontSize: 12, fontWeight: 600 },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Conversion Value"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              domain={[0, yDomainMax]}
              tickFormatter={(value) => `$${formatNumber(Number(value))}`}
              label={{
                value: 'Conversion Value ($)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#475569', fontSize: 12, fontWeight: 600 },
              }}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            <Scatter data={currentChartData} fill="#0ea5e9" name="Current period" />
            <Scatter data={compareChartData} fill="#94a3b8" name="Previous period" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendVsConversionChart;

