import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

type DateFormat = 
  | 'short' 
  | 'medium' 
  | 'long' 
  | 'full' 
  | 'date' 
  | 'time' 
  | 'datetime' 
  | 'relative' 
  | 'iso';

export function formatDate(
  date: Date | string | number | null | undefined, 
  formatType: DateFormat = 'medium',
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) return 'Invalid date';

  const formatOptions: Record<DateFormat, string> = {
    short: 'MM/dd/yyyy',
    medium: 'MMM d, yyyy',
    long: 'MMMM d, yyyy',
    full: 'EEEE, MMMM d, yyyy',
    date: 'yyyy-MM-dd',
    time: 'h:mm a',
    datetime: 'MMM d, yyyy h:mm a',
    relative: getRelativeDate(dateObj),
    iso: dateObj.toISOString(),
  };

  if (formatType === 'relative') {
    return formatOptions.relative;
  }

  if (formatType === 'iso') {
    return formatOptions.iso;
  }

  return format(dateObj, formatOptions[formatType], options);
}

function getRelativeDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatCurrency(
  value: number | string, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'Invalid amount';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

export function formatNumber(
  value: number | string,
  options: Intl.NumberFormatOptions = {}
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'Invalid number';
  
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(numValue);
}

export function formatPercent(
  value: number | string,
  decimals: number = 2
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'Invalid percentage';
  
  return `${(numValue * 100).toFixed(decimals)}%`;
}

export function parseDateString(dateString: string): Date | null {
  const parsed = parseISO(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

export function getMonthName(date: Date, format: 'short' | 'long' = 'long'): string {
  return date.toLocaleString('default', { month: format });
}

export function getWeekdayName(date: Date, format: 'short' | 'long' = 'long'): string {
  return date.toLocaleString('default', { weekday: format });
}

export function getCurrentQuarter(): number {
  const month = new Date().getMonth();
  return Math.floor(month / 3) + 1;
}

export function getQuarter(date: Date = new Date()): number {
  const month = date.getMonth();
  return Math.floor(month / 3) + 1;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return `${days}d ${remainingHours}h`;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
