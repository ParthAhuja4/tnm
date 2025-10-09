import ResultsChart from "../../components/analytics/ResultsChart";
import ROASChart from "../../components/analytics/ROASChart";
import CostPerPurchaseChart from "../../components/analytics/CostPerPurchaseChart";
import SpendVsConversionChart from "../../components/analytics/SpendVsConversionChart";
import ReachImpressionsChart from "../../components/analytics/ReachImpressionsChart";
import ConversionFunnelChart from "../../components/analytics/ConversionFunnelChart";
import TimelineChart from "../../components/analytics/TimelineChart";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ComponentType,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import MonthSelector from "../../components/analytics/MonthSelector";
import SummaryMetrics from "../../components/analytics/SummaryMetrics";
import { Button } from "@/components/ui/Button";

import {
  initializeCampaignData,
  getMonthlyAggregates,
  type MonthlyAggregate,
} from "../../services/campaignData";
import { Sparkles, BarChart3, Zap, Target, RefreshCcw } from "lucide-react";

const CHART_COUNT = 7;

type HighlightItem = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const HIGHLIGHT_ITEMS: HighlightItem[] = [
  {
    title: "Interactive calendar",
    description: "Pick any two months and instantly refresh the data view.",
    icon: Sparkles,
  },
  {
    title: "Performance focus",
    description:
      "Every chart spans the full width for clarity and deeper insight.",
    icon: BarChart3,
  },
  {
    title: "Responsive feedback",
    description: "Selections update charts instantly without extra reloads.",
    icon: Zap,
  },
  {
    title: "Goal tracking",
    description: "Trend badges and comparative metrics keep targets visible.",
    icon: Target,
  },
];

function AnalyticsPage() {
  const { user } = useAuth();
  const isClient = user?.role === "Client";
  const authenticatedClientId =
    isClient && user?.id !== undefined && user?.id !== null
      ? String(user.id)
      : undefined;

  const [startMonth, setStartMonth] = useState("2025-08");
  const [compareMonth, setCompareMonth] = useState("2025-07");
  const [startData, setStartData] = useState<MonthlyAggregate | null>(null);
  const [compareData, setCompareData] = useState<MonthlyAggregate | null>(null);
  const [monthlyData, setMonthlyData] = useState<
    Record<string, MonthlyAggregate>
  >({});
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (isClient && !authenticatedClientId) {
        if (isMountedRef.current) {
          setLoading(false);
        }
        console.warn(
          "Skipping analytics fetch: missing authenticated client id"
        );
        return;
      }

      if (isMountedRef.current) {
        setLoading(true);
      }

      try {
        const store = await initializeCampaignData(authenticatedClientId, {
          force: forceRefresh,
        });

        if (!isMountedRef.current) {
          return;
        }

        setMonthlyData({ ...store.monthlyAggregates });
        setStartData(store.monthlyAggregates[startMonth] ?? null);
        setCompareData(store.monthlyAggregates[compareMonth] ?? null);
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        console.error("Error loading data:", error);
        setMonthlyData({});
        setStartData(null);
        setCompareData(null);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [authenticatedClientId, compareMonth, isClient, startMonth]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleMonthsChange = (
    newStartMonth: string,
    newCompareMonth: string
  ) => {
    setStartMonth(newStartMonth);
    setCompareMonth(newCompareMonth);

    const start = getMonthlyAggregates(newStartMonth);
    const compare = getMonthlyAggregates(newCompareMonth);

    setStartData(start);
    setCompareData(compare);
  };

  const handleReloadClick = () => {
    void loadData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="h-32 rounded-3xl border border-slate-200 bg-white/90 shadow-sm animate-pulse" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 rounded-3xl border border-slate-200 bg-white/90 shadow-sm animate-pulse"
                />
              ))}
            </div>
            <div className="flex flex-col gap-6">
              {Array.from({ length: CHART_COUNT }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 rounded-3xl border border-slate-200 bg-white/90 shadow-sm animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedStartLabel = new Date(`${startMonth}-01`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );
  const formattedCompareLabel = new Date(
    `${compareMonth}-01`
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const totalMonths = Object.keys(monthlyData).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative isolate overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.25),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-teal-100">
              Live overview
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Marketing Analytics Dashboard
              </h1>
              <p className="max-w-xl text-sm text-slate-200">
                Complete campaign performance analysis with Shopify-style
                monthly comparisons and a refreshed single-column insight
                layout.
              </p>
            </div>
          </div>

          <dl className="grid w-full max-w-xl grid-cols-1 gap-4 text-sm font-medium text-slate-200 sm:grid-cols-2 md:max-w-none md:w-auto lg:grid-cols-3">
            <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur">
              <dt className="text-xs font-semibold uppercase tracking-wide text-teal-100/80">
                Months
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-white">
                {totalMonths}
              </dd>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur">
              <dt className="text-xs font-semibold uppercase tracking-wide text-teal-100/80">
                Active charts
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-white">
                {CHART_COUNT}
              </dd>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur">
              <dt className="text-xs font-semibold uppercase tracking-wide text-teal-100/80">
                Status
              </dt>
              <dd className="mt-2 flex flex-col gap-2 text-sm">
                <span className="inline-flex items-center gap-2 text-white">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-200 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-300" />
                  </span>
                  Live now
                </span>
                <span className="inline-flex w-max items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-100">
                  Single column
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="w-full">
                <MonthSelector
                  startMonth={startMonth}
                  compareMonth={compareMonth}
                  onMonthsChange={handleMonthsChange}
                />
              </div>
              {!isClient ? (
                <Button
                  type="button"
                  onClick={handleReloadClick}
                  disabled={loading}
                  variant="gradient"
                  size="lg"
                  className="w-full md:w-auto md:self-end h-12 md:h-14 gap-2.5 rounded-2xl px-7 md:px-10 text-base md:text-lg font-semibold shadow-xl ring-2 ring-violet-300/70 hover:ring-violet-200/80 disabled:opacity-80 disabled:shadow-none"
                  aria-live="polite"
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      <span>Get Client Data</span>
                    </>
                  )}
                </Button>
              ) : (
                <span></span>
              )}
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm ring-1 ring-slate-900/5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current period
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formattedStartLabel}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm ring-1 ring-slate-900/5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Comparison period
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formattedCompareLabel}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm ring-1 ring-slate-900/5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Charts per row
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">1</p>
                <p className="mt-1 text-xs text-slate-500">
                  Optimized for deep, single focus analysis.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Performance summary
                </h2>
                <p className="text-sm text-slate-500">
                  Comparing {formattedStartLabel} versus {formattedCompareLabel}{" "}
                  across every core acquisition metric.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Updated metrics
              </div>
            </div>
            <SummaryMetrics startData={startData} compareData={compareData} />
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Campaign insights
                </h2>
                <p className="text-sm text-slate-500">
                  Seven focused visualizations, each rendered one-per-row for
                  maximum clarity and scanability.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Single column mode
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <ResultsChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
              <ROASChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
              <CostPerPurchaseChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
              <SpendVsConversionChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
              <ReachImpressionsChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
              <ConversionFunnelChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
              <TimelineChart
                startMonth={startMonth}
                compareMonth={compareMonth}
                monthlyData={monthlyData}
              />
            </div>
          </section>

          <section className="mt-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-lg ring-1 ring-slate-900/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Dashboard highlights
                  </h3>
                  <p className="text-sm text-slate-500">
                    A modernized layout that keeps insights discoverable while
                    respecting campaign depth.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Layout refresh
                </span>
              </div>
              <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                {HIGHLIGHT_ITEMS.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-slate-900/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 via-sky-500/15 to-emerald-500/15 text-teal-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1.5">
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="text-slate-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white/90">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              (c) 2025 Campaign Analytics Dashboard. Built with React, Tailwind
              CSS v4, Recharts, and Lucide Icons.
            </p>
            <div className="flex flex-col gap-2 text-slate-500 sm:flex-row sm:items-center sm:gap-4">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                All {CHART_COUNT} charts active in single-column flow
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AnalyticsPage;
