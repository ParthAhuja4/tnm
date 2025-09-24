import {
  format,
  subDays,
  subMonths,
  subYears,
  subWeeks,
  isWithinInterval,
  isSameDay,
  isSameMonth,
  isSameYear,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
} from "date-fns";

import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

// Type Definitions
type DateRange = {
  start: Date;
  end: Date;
};

type TimeUnit = "day" | "week" | "month" | "quarter" | "year";

type Metric =
  | "impressions"
  | "clicks"
  | "ctr"
  | "spend"
  | "conversions"
  | "cpa"
  | "roas"
  | "revenue";

interface AnalyticsDataPoint {
  date: string;
  [key: string]: any;
}

interface AggregatedData {
  date: string;
  [key: string]: number | string;
}

// Time zone handling
const TIME_ZONE = "UTC";

const PARSED_DATE_FIELD = "__parsedDate";

function parseAnalyticsDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === "number") {
    const dateFromNumber = new Date(value);
    return isValid(dateFromNumber) ? dateFromNumber : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      const parsed = parseISO(trimmed);
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // ignore parse errors and try fallback
    }

    const fallback = new Date(trimmed);
    if (isValid(fallback)) {
      return fallback;
    }
  }

  return null;
}

// Helper function to get the current date and time
export function getCurrentDateTime(): string {
  return formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss");
}

// Helper function to format date and time based on time zone
export function formatDateTime(
  date: Date | string,
  formatStr: string = "yyyy-MM-dd HH:mm:ss"
): string {
  const dateObj = parseAnalyticsDate(date);

  if (!dateObj) {
    return typeof date === "string" ? date : "";
  }

  return formatInTimeZone(dateObj, TIME_ZONE, formatStr);
}

// Helper function to parse a date string to UTC date
export function parseDateTime(dateStr: string): Date {
  try {
    const zoned = fromZonedTime(dateStr, TIME_ZONE);
    if (isValid(zoned)) {
      return zoned;
    }
  } catch {
    // ignore parse errors and fall back to generic parsing
  }

  const fallback = parseAnalyticsDate(dateStr);
  return fallback ?? new Date(NaN);
}

// Date range utilities
export function getDateRangeForPeriod(
  period:
    | "today"
    | "yesterday"
    | "last7"
    | "last30"
    | "thisMonth"
    | "lastMonth"
    | "thisYear"
    | "lastYear"
    | "allTime"
): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      return { start: today, end: now };

    case "yesterday":
      const yesterday = subDays(today, 1);
      return {
        start: yesterday,
        end: new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59
        ),
      };

    case "last7":
      return { start: subDays(today, 6), end: now };

    case "last30":
      return { start: subDays(today, 29), end: now };

    case "thisMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };

    case "lastMonth":
      const firstDayLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const lastDayLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );
      return { start: firstDayLastMonth, end: lastDayLastMonth };

    case "thisYear":
      return { start: new Date(now.getFullYear(), 0, 1), end: now };

    case "lastYear":
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59),
      };

    case "allTime":
    default:
      return { start: subYears(now, 2), end: now };
  }
}

// Function to format the date range label
export function getDateRangeLabel(range: DateRange): string {
  const { start, end } = range;
  const now = new Date();

  if (isSameDay(start, now) && isSameDay(end, now)) {
    return "Today";
  }

  const yesterday = subDays(now, 1);
  if (isSameDay(start, yesterday) && isSameDay(end, yesterday)) {
    return "Yesterday";
  }

  const currentWeekStart = startOfWeek(now);
  const currentWeekEnd = endOfWeek(now);
  if (
    isWithinInterval(start, { start: currentWeekStart, end: currentWeekEnd }) &&
    isWithinInterval(end, { start: currentWeekStart, end: currentWeekEnd })
  ) {
    return "This Week";
  }

  const previousWeekStart = subWeeks(currentWeekStart, 1);
  const previousWeekEnd = subWeeks(currentWeekEnd, 1);
  if (
    isWithinInterval(start, {
      start: previousWeekStart,
      end: previousWeekEnd,
    }) &&
    isWithinInterval(end, { start: previousWeekStart, end: previousWeekEnd })
  ) {
    return "Last Week";
  }

  if (isSameMonth(start, now) && isSameMonth(end, now)) {
    return "This Month";
  }

  const lastMonth = subMonths(now, 1);
  if (isSameMonth(start, lastMonth) && isSameMonth(end, lastMonth)) {
    return "Last Month";
  }

  if (isSameYear(start, now) && isSameYear(end, now)) {
    return "This Year";
  }

  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

// Function to aggregate data by time unit
export function aggregateDataByTimeUnit(
  data: AnalyticsDataPoint[],
  dateField: string = "date",
  metrics: (Metric | string)[],
  timeUnit: TimeUnit = "day",
  dateRange?: DateRange
): AggregatedData[] {
  if (!data || data.length === 0) return [];

  const sanitizedData = data.reduce<AnalyticsDataPoint[]>((acc, item) => {
    const parsedDate = parseAnalyticsDate(item[dateField]);

    if (!parsedDate) {
      return acc;
    }

    if (
      dateRange &&
      !isWithinInterval(parsedDate, {
        start: dateRange.start,
        end: dateRange.end,
      })
    ) {
      return acc;
    }

    acc.push({
      ...item,
      [PARSED_DATE_FIELD]: parsedDate,
    });

    return acc;
  }, []);

  const groupedData = groupDataByTimeUnit(sanitizedData, dateField, timeUnit);

  return Object.entries(groupedData).map(([period, items]) => {
    const aggregated: AggregatedData = { date: period };

    metrics.forEach((metric) => {
      aggregated[metric] = items.reduce((sum, item) => {
        const value = parseFloat(item[metric]);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
    });

    return aggregated;
  });
}

// Helper function to group data by time unit
function groupDataByTimeUnit(
  data: AnalyticsDataPoint[],
  dateField: string,
  timeUnit: TimeUnit
): Record<string, AnalyticsDataPoint[]> {
  const groups: Record<string, AnalyticsDataPoint[]> = {};

  data.forEach((item) => {
    const parsedDate =
      (item[PARSED_DATE_FIELD] as Date | undefined) ??
      parseAnalyticsDate(item[dateField]);

    if (!parsedDate) {
      return;
    }

    const zonedDate = toZonedTime(parsedDate, TIME_ZONE);
    let periodKey: string;

    switch (timeUnit) {
      case "day":
        periodKey = formatInTimeZone(parsedDate, TIME_ZONE, "yyyy-MM-dd");
        break;
      case "week":
        {
          const weekStart = startOfWeek(zonedDate);
          periodKey = formatInTimeZone(weekStart, TIME_ZONE, "yyyy-MM-dd");
        }
        break;
      case "month":
        periodKey = formatInTimeZone(parsedDate, TIME_ZONE, "yyyy-MM");
        break;
      case "quarter":
        {
          const quarter = Math.floor(zonedDate.getMonth() / 3) + 1;
          const year = formatInTimeZone(parsedDate, TIME_ZONE, "yyyy");
          periodKey = `${year}-Q${quarter}`;
        }
        break;
      case "year":
        periodKey = formatInTimeZone(parsedDate, TIME_ZONE, "yyyy");
        break;
      default:
        periodKey = formatInTimeZone(parsedDate, TIME_ZONE, "yyyy-MM-dd");
    }

    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }

    groups[periodKey].push(item);
  });

  return groups;
}

// Metric calculations
export function calculateCTR(clicks: number, impressions: number): number {
  return impressions > 0 ? (clicks / impressions) * 100 : 0;
}

export function calculateCPA(spend: number, conversions: number): number {
  return conversions > 0 ? spend / conversions : 0;
}

export function calculateROAS(revenue: number, spend: number): number {
  return spend > 0 ? revenue / spend : 0;
}

export function calculateConversionRate(
  conversions: number,
  clicks: number
): number {
  return clicks > 0 ? (conversions / clicks) * 100 : 0;
}

// Data sorting
export function sortData<T extends Record<string, any>>(
  data: T[],
  sortBy: string,
  sortOrder: "asc" | "desc" = "desc"
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue == null) return sortOrder === "asc" ? -1 : 1;
    if (bValue == null) return sortOrder === "asc" ? 1 : -1;

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
}

// Data validation
export function validateAnalyticsData(data: any[]): boolean {
  if (!Array.isArray(data)) return false;

  const requiredFields = ["date", "impressions", "clicks", "spend"];

  if (data.length === 0) {
    return true;
  }

  return data.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    if (
      !requiredFields.every(
        (field) => item[field] !== undefined && item[field] !== null
      )
    ) {
      return false;
    }

    return parseAnalyticsDate(item.date) !== null;
  });
}
