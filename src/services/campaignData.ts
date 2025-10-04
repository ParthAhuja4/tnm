import { api } from "@/services/api";
export interface CampaignRecord {
  campaignId: string;
  campaignName: string;
  results: number;
  reach: number;
  impressions: number;
  amountSpent: number;
  conversionValue: number;
  purchases: number;
  addsToCart: number;
  reportingStarts: string;
  reportingEnds: string;
  roas: number;
  costPerResult: number;
  costPerPurchase: number;
}

export interface MonthlyAggregate {
  results: number;
  reach: number;
  impressions: number;
  amountSpent: number;
  conversionValue: number;
  purchases: number;
  addsToCart: number;
  avgROAS: number;
  conversionRate: number;
  costPerPurchase: number;
  ctr: number;
  cpm: number;
}

interface AnalyticsStore {
  monthlyRawData: Record<string, CampaignRecord[]>;
  monthlyAggregates: Record<string, MonthlyAggregate>;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeDate(value: unknown, defaultDate: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 10);
  }

  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }

  return defaultDate;
}

function extractCampaignArray(payload: any): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.campaigns)) {
    return payload.campaigns;
  }

  if (Array.isArray(payload?.data?.campaigns)) {
    return payload.data.campaigns;
  }

  if (Array.isArray(payload?.data?.edges)) {
    return payload.data.edges;
  }

  return [];
}

function ensureCampaignArray(payload: any): unknown[] {
  const campaigns = extractCampaignArray(payload);

  if (campaigns.length > 0 && campaigns.some(isPotentialCampaignRecord)) {
    return campaigns;
  }

  const fallbackSources = [
    payload?.data?.records,
    payload?.records,
    payload?.items,
    payload?.data?.items,
  ];

  for (const candidate of fallbackSources) {
    if (Array.isArray(candidate) && candidate.some(isPotentialCampaignRecord)) {
      return candidate;
    }
  }

  const deepMatch = findFirstObjectArray(payload);
  if (deepMatch.length > 0 && deepMatch.some(isPotentialCampaignRecord)) {
    return deepMatch;
  }

  return [];
}

function findFirstObjectArray(
  input: unknown,
  visited = new Set<unknown>()
): unknown[] {
  if (input === null || typeof input !== "object") {
    return [];
  }

  if (visited.has(input)) {
    return [];
  }

  visited.add(input);

  if (Array.isArray(input)) {
    const hasObjectEntries = input.some(
      (item) => item !== null && typeof item === "object"
    );

    if (hasObjectEntries) {
      return input;
    }

    for (const item of input) {
      const result = findFirstObjectArray(item, visited);
      if (result.length > 0) {
        return result;
      }
    }

    return [];
  }

  for (const value of Object.values(input as Record<string, unknown>)) {
    const result = findFirstObjectArray(value, visited);
    if (result.length > 0) {
      return result;
    }
  }

  return [];
}

function isPotentialCampaignRecord(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const campaign = value as Record<string, unknown>;
  const nameLike =
    typeof campaign.campaignName === "string" ||
    typeof campaign.campaign_name === "string" ||
    typeof campaign.name === "string";

  const idLike =
    typeof campaign.campaignId === "string" ||
    typeof campaign.campaign_id === "string" ||
    typeof campaign.id === "string" ||
    typeof campaign.id === "number";

  return nameLike || idLike;
}

const FALLBACK_CAMPAIGN_DATA: CampaignRecord[] = [
  {
    campaignId: "CAMP-001",
    campaignName: "Summer Savings Push",
    results: 1245,
    reach: 45230,
    impressions: 83512,
    amountSpent: 12450.75,
    conversionValue: 37218.21,
    purchases: 195,
    addsToCart: 482,
    reportingStarts: "2025-08-01",
    reportingEnds: "2025-08-31",
    roas: round(37218.21 / 12450.75),
    costPerResult: round(12450.75 / 1245),
    costPerPurchase: round(12450.75 / 195),
  },
  {
    campaignId: "CAMP-002",
    campaignName: "New Arrivals Rollout",
    results: 985,
    reach: 39845,
    impressions: 70234,
    amountSpent: 10123.42,
    conversionValue: 29560.87,
    purchases: 162,
    addsToCart: 421,
    reportingStarts: "2025-08-03",
    reportingEnds: "2025-08-27",
    roas: round(29560.87 / 10123.42),
    costPerResult: round(10123.42 / 985),
    costPerPurchase: round(10123.42 / 162),
  },
  {
    campaignId: "CAMP-003",
    campaignName: "Midnight Flash Sale",
    results: 1565,
    reach: 50210,
    impressions: 91203,
    amountSpent: 14325.65,
    conversionValue: 41250.02,
    purchases: 238,
    addsToCart: 563,
    reportingStarts: "2025-08-10",
    reportingEnds: "2025-08-31",
    roas: round(41250.02 / 14325.65),
    costPerResult: round(14325.65 / 1565),
    costPerPurchase: round(14325.65 / 238),
  },
  {
    campaignId: "CAMP-004",
    campaignName: "Loyalty Program Boost",
    results: 845,
    reach: 32890,
    impressions: 61245,
    amountSpent: 8240.33,
    conversionValue: 21563.44,
    purchases: 148,
    addsToCart: 356,
    reportingStarts: "2025-08-05",
    reportingEnds: "2025-08-29",
    roas: round(21563.44 / 8240.33),
    costPerResult: round(8240.33 / 845),
    costPerPurchase: round(8240.33 / 148),
  },
  {
    campaignId: "CAMP-005",
    campaignName: "Holiday Preview Teasers",
    results: 1322,
    reach: 47215,
    impressions: 86780,
    amountSpent: 13510.22,
    conversionValue: 40512.3,
    purchases: 214,
    addsToCart: 512,
    reportingStarts: "2025-08-12",
    reportingEnds: "2025-08-31",
    roas: round(40512.3 / 13510.22),
    costPerResult: round(13510.22 / 1322),
    costPerPurchase: round(13510.22 / 214),
  },
  {
    campaignId: "CAMP-006",
    campaignName: "Remarketing Revival",
    results: 918,
    reach: 30542,
    impressions: 58912,
    amountSpent: 7654.11,
    conversionValue: 18234.56,
    purchases: 137,
    addsToCart: 298,
    reportingStarts: "2025-08-07",
    reportingEnds: "2025-08-23",
    roas: round(18234.56 / 7654.11),
    costPerResult: round(7654.11 / 918),
    costPerPurchase: round(7654.11 / 137),
  },
];

let analyticsStore: AnalyticsStore = {
  monthlyRawData: {},
  monthlyAggregates: {},
};
let initializationPromise: Promise<AnalyticsStore> | null = null;
let activeClientId: string | null = null;
// Tracks which client the current analyticsStore belongs to.

function normalizeCampaign(raw: any, index: number): CampaignRecord {
  const fallbackStart = `2025-08-${String(Math.min(28, index * 3 + 1)).padStart(
    2,
    "0"
  )}`;
  const fallbackEnd = `2025-08-${String(Math.min(28, index * 3 + 3)).padStart(
    2,
    "0"
  )}`;

  const amountSpent = toNumber(raw?.amountSpent ?? raw?.amount_spent);
  const conversionValue = toNumber(
    raw?.conversionValue ??
      raw?.conversion_value ??
      raw?.purchaseValue ??
      raw?.purchase_value ??
      raw?.revenue
  );

  const results = Math.max(
    0,
    Math.round(toNumber(raw?.results ?? raw?.result))
  );
  const reach = Math.max(0, Math.round(toNumber(raw?.reach)));
  const impressions = Math.max(0, Math.round(toNumber(raw?.impressions)));
  const purchases = Math.max(
    0,
    Math.round(toNumber(raw?.purchases ?? raw?.purchase))
  );
  const addsToCart = Math.max(
    0,
    Math.round(toNumber(raw?.addsToCart ?? raw?.adds_to_cart ?? raw?.addToCart))
  );

  const reportingStarts = normalizeDate(
    raw?.reportingStarts ??
      raw?.reporting_starts ??
      raw?.startDate ??
      raw?.start_date,
    fallbackStart
  );
  const reportingEnds = normalizeDate(
    raw?.reportingEnds ?? raw?.reporting_ends ?? raw?.endDate ?? raw?.end_date,
    fallbackEnd
  );

  const roas =
    amountSpent > 0
      ? round(conversionValue / amountSpent)
      : round(toNumber(raw?.roas));
  const costPerResult =
    results > 0
      ? round(amountSpent / results)
      : round(toNumber(raw?.costPerResult ?? raw?.cost_per_result));
  const costPerPurchase =
    purchases > 0
      ? round(amountSpent / purchases)
      : round(toNumber(raw?.costPerPurchase ?? raw?.cost_per_purchase));

  const campaignId =
    typeof raw?.campaignId === "string" && raw.campaignId.trim().length > 0
      ? raw.campaignId.trim()
      : `campaign-${index + 1}`;

  const campaignName =
    typeof raw?.campaignName === "string" && raw.campaignName.trim().length > 0
      ? raw.campaignName.trim()
      : typeof raw?.name === "string" && raw.name.trim().length > 0
      ? raw.name.trim()
      : `Campaign ${index + 1}`;

  return {
    campaignId,
    campaignName,
    results,
    reach,
    impressions,
    amountSpent,
    conversionValue,
    purchases,
    addsToCart,
    reportingStarts,
    reportingEnds,
    roas,
    costPerResult,
    costPerPurchase,
  };
}

function createEmptyAggregate(): MonthlyAggregate {
  return {
    results: 0,
    reach: 0,
    impressions: 0,
    amountSpent: 0,
    conversionValue: 0,
    purchases: 0,
    addsToCart: 0,
    avgROAS: 0,
    conversionRate: 0,
    costPerPurchase: 0,
    ctr: 0,
    cpm: 0,
  };
}

function calculateDerivedMetrics(
  aggregated: MonthlyAggregate
): MonthlyAggregate {
  const derived: MonthlyAggregate = { ...aggregated };

  derived.avgROAS =
    aggregated.amountSpent > 0
      ? round(aggregated.conversionValue / aggregated.amountSpent)
      : 0;
  derived.conversionRate =
    aggregated.reach > 0
      ? round((aggregated.purchases / aggregated.reach) * 100)
      : 0;
  derived.costPerPurchase =
    aggregated.purchases > 0
      ? round(aggregated.amountSpent / aggregated.purchases)
      : 0;
  derived.ctr =
    aggregated.impressions > 0
      ? round((aggregated.results / aggregated.impressions) * 100)
      : 0;
  derived.cpm =
    aggregated.impressions > 0
      ? round((aggregated.amountSpent / aggregated.impressions) * 1000)
      : 0;

  return derived;
}

function aggregateMonthlyData(
  campaignData: CampaignRecord[]
): MonthlyAggregate {
  const aggregated = campaignData.reduce<MonthlyAggregate>((acc, campaign) => {
    acc.results += campaign.results;
    acc.reach += campaign.reach;
    acc.impressions += campaign.impressions;
    acc.amountSpent += campaign.amountSpent;
    acc.conversionValue += campaign.conversionValue;
    acc.purchases += campaign.purchases;
    acc.addsToCart += campaign.addsToCart;
    return acc;
  }, createEmptyAggregate());

  return calculateDerivedMetrics(aggregated);
}

function generateMonthData(
  baseData: CampaignRecord[],
  variationFactor = 1
): CampaignRecord[] {
  return baseData.map((campaign) => {
    const variation = 0.7 + Math.random() * 0.6;
    const multiplier = variation * variationFactor;

    const results = Math.max(0, Math.round(campaign.results * multiplier));
    const reach = Math.max(0, Math.round(campaign.reach * multiplier));
    const impressions = Math.max(
      0,
      Math.round(campaign.impressions * multiplier)
    );
    const amountSpent = round(campaign.amountSpent * multiplier);
    const conversionValue = round(campaign.conversionValue * multiplier);
    const purchases = Math.max(0, Math.round(campaign.purchases * multiplier));
    const addsToCart = Math.max(
      0,
      Math.round(campaign.addsToCart * multiplier)
    );

    return {
      ...campaign,
      results,
      reach,
      impressions,
      amountSpent,
      conversionValue,
      purchases,
      addsToCart,
      roas: amountSpent > 0 ? round(conversionValue / amountSpent) : 0,
      costPerResult:
        results > 0 ? round(amountSpent / Math.max(results, 1)) : 0,
      costPerPurchase:
        purchases > 0 ? round(amountSpent / Math.max(purchases, 1)) : 0,
    };
  });
}

function buildAnalyticsStore(baseData: CampaignRecord[]): AnalyticsStore {
  const normalizedBase = baseData.map((campaign, index) =>
    normalizeCampaign(campaign, index)
  );

  const monthlyRawData: Record<string, CampaignRecord[]> = {
    "2025-06": generateMonthData(normalizedBase, 0.8),
    "2025-07": generateMonthData(normalizedBase, 0.9),
    "2025-08": normalizedBase.map((campaign) => ({ ...campaign })),
    "2025-09": generateMonthData(normalizedBase, 1.1),
  };

  const monthlyAggregates: Record<string, MonthlyAggregate> = {};
  Object.keys(monthlyRawData).forEach((month) => {
    monthlyAggregates[month] = aggregateMonthlyData(monthlyRawData[month]);
  });

  return { monthlyRawData, monthlyAggregates };
}

async function fetchCampaignData(clientId?: string): Promise<CampaignRecord[]> {
  console.log(clientId);
  let newClientId = JSON.parse(localStorage.getItem("user") || "null").id;

  try {
    const response = await api.get(`/api/clients/${newClientId}/data`);
    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch campaign data for client ${newClientId}`
      );
    }

    const payload = await response.data;
    const campaigns = ensureCampaignArray(payload);

    return campaigns.map((campaign, index) =>
      normalizeCampaign(campaign, index)
    );
  } catch (error) {
    console.error("Unable to fetch campaign data", error);
    return [];
  }
}

async function fetchAnalyticsData(clientId?: string): Promise<AnalyticsStore> {
  const remoteData = await fetchCampaignData(clientId);
  const shouldUseFallback = remoteData.length === 0 && !clientId;

  if (remoteData.length === 0 && clientId) {
    console.warn(
      `No campaign records returned for client ${clientId}; using empty dataset.`
    );
  }

  const baseData = shouldUseFallback
    ? FALLBACK_CAMPAIGN_DATA.map((campaign) => ({ ...campaign }))
    : remoteData;

  return buildAnalyticsStore(baseData);
}

export async function initializeCampaignData(
  clientId?: string
): Promise<AnalyticsStore> {
  const normalizedClientId = clientId?.trim();
  const resolvedClientId =
    normalizedClientId && normalizedClientId.length > 0
      ? normalizedClientId
      : null;
  const hasData = Object.keys(analyticsStore.monthlyAggregates).length > 0;
  const isSameClient = activeClientId === resolvedClientId;

  if (hasData && isSameClient && !initializationPromise) {
    return analyticsStore;
  }

  if (!initializationPromise || !isSameClient) {
    const loadPromise = fetchAnalyticsData(resolvedClientId ?? undefined)
      .then((store) => {
        analyticsStore = store;
        activeClientId = resolvedClientId;
        return analyticsStore;
      })
      .finally(() => {
        if (initializationPromise === loadPromise) {
          initializationPromise = null;
        }
      });

    initializationPromise = loadPromise;
  }

  return initializationPromise ?? analyticsStore;
}

export function getMonthlyAggregates(month: string): MonthlyAggregate | null {
  return analyticsStore.monthlyAggregates[month] ?? null;
}

export function getAllMonthlyAggregates(): Record<string, MonthlyAggregate> {
  return analyticsStore.monthlyAggregates;
}

export function getAvailableMonths(): string[] {
  return Object.keys(analyticsStore.monthlyAggregates).sort();
}

export function getMonthlyRawData(month: string): CampaignRecord[] {
  return analyticsStore.monthlyRawData[month] ?? [];
}

export function calculateGrowth(current: number, previous: number): number {
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous === 0
  ) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount ?? 0);
}

export function formatNumber(numberValue: number, decimals = 0): string {
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numberValue ?? 0);
}

export function formatPercentage(numberValue: number, decimals = 1): string {
  return `${formatNumber(numberValue, decimals)}%`;
}

if (typeof window !== "undefined") {
  initializeCampaignData().catch((error) => {
    console.error("Error preloading campaign analytics data", error);
  });
}

export default {
  getMonthlyAggregates,
  getAllMonthlyAggregates,
  getAvailableMonths,
  getMonthlyRawData,
  calculateGrowth,
  formatCurrency,
  formatNumber,
  formatPercentage,
  initializeCampaignData,
};
