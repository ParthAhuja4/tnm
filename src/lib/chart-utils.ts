import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  ArcElement,
  Filler,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  BubbleDataPoint,
  ScatterDataPoint
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { useTheme } from './theme-utils';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'area' | 'scatter' | 'bubble';

export type ChartDataPoint = number | [number, number] | BubbleDataPoint | ScatterDataPoint | null;

export interface ChartDataset<T extends ChartDataPoint> {
  label: string;
  data: T[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean | string;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointHoverBackgroundColor?: string | string[];
  pointHoverBorderColor?: string | string[];
  pointBorderWidth?: number;
  pointHoverBorderWidth?: number;
  pointStyle?: string | HTMLImageElement | HTMLCanvasElement;
  pointRotation?: number;
  pointHitRadius?: number;
  pointHoverRadius?: number;
  order?: number;
  yAxisID?: string;
  xAxisID?: string;
  type?: ChartType;
  stack?: string;
  barPercentage?: number;
  categoryPercentage?: number;
  barThickness?: number | 'flex';
  maxBarThickness?: number;
  minBarLength?: number;
  hidden?: boolean;
  hoverBackgroundColor?: string | string[];
  hoverBorderColor?: string | string[];
  hoverBorderWidth?: number;
  hoverRadius?: number;
  hoverBorderRadius?: number;
  borderCapStyle?: string;
  borderDash?: number[];
  borderDashOffset?: number;
  borderJoinStyle?: string;
  cubicInterpolationMode?: 'default' | 'monotone';
  lineTension?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointBorderWidth?: number;
  pointHitRadius?: number;
  pointHoverBackgroundColor?: string | string[];
  pointHoverBorderColor?: string | string[];
  pointHoverBorderWidth?: number;
  pointHoverRadius?: number;
  pointRadius?: number | number[];
  pointRotation?: number | number[];
  pointStyle?: string | string[] | HTMLImageElement | HTMLImageElement[];
  spanGaps?: boolean | number;
  stepped?: boolean | 'before' | 'after' | 'middle';
  xAxisID?: string;
  yAxisID?: string;
}

export interface ChartConfig<T extends ChartDataPoint> {
  type: ChartType;
  data: ChartData<'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'area' | 'scatter' | 'bubble', T[]>;
  options?: ChartOptions;
  plugins?: any[];
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  fallbackContent?: React.ReactNode;
  onHover?: (event: any, elements: any, chart: any) => void;
  onClick?: (event: any, elements: any, chart: any) => void;
  getElementAtEvent?: (element: any, event: any) => void;
  getElementsAtEvent?: (elements: any, event: any) => void;
  getDatasetAtEvent?: (dataset: any, event: any) => void;
  getElementAtXAxis?: (element: any, event: any) => void;
  getElementsAtXAxis?: (elements: any, event: any) => void;
  getElementAtYAxis?: (element: any, event: any) => void;
  getElementsAtYAxis?: (elements: any, event: any) => void;
  getElementAtEventForMode?: (element: any, event: any, mode: string, options: any) => void;
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale
);

// Default chart options
export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      padding: 12,
      usePointStyle: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        borderDash: [3, 3],
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            compactDisplay: 'short',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }).format(Number(value));
        },
      },
    },
  },
};

// Color palettes
export const CHART_COLORS = {
  // Primary brand colors
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#4338CA',
  
  // Secondary colors
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Accent colors
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  
  // Semantic colors
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  
  // Grayscale
  gray: [
    '#F9FAFB',
    '#F3F4F6',
    '#E5E7EB',
    '#D1D5DB',
    '#9CA3AF',
    '#6B7280',
    '#4B5563',
    '#374151',
    '#1F2937',
    '#111827',
  ],
  
  // Colorful palette
  rainbow: [
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#F43F5E', // rose-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#06B6D4', // cyan-500
    '#6366F1', // indigo-500
    '#F97316', // orange-500
    '#84CC16', // lime-500
  ],
  
  // Pastel colors
  pastel: [
    '#BFDBFE', // blue-200
    '#C7D2FE', // indigo-200
    '#DDD6FE', // violet-200
    '#E9D5FF', // purple-200
    '#F5D0FE', // fuchsia-200
    '#FBCFE8', // pink-200
    '#FECACA', // rose-200
    '#FED7AA', // orange-200
    '#FDE68A', // amber-200
    '#D9F99D', // lime-200
  ],
  
  // Dark theme colors
  dark: {
    background: '#1F2937',
    text: '#F9FAFB',
    grid: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Light theme colors
  light: {
    background: '#FFFFFF',
    text: '#1F2937',
    grid: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(0, 0, 0, 0.2)',
  },
};

// Get chart color by index
export function getChartColor(index: number, palette: keyof typeof CHART_COLORS = 'rainbow'): string {
  const colors = CHART_COLORS[palette];
  if (Array.isArray(colors)) {
    return colors[index % colors.length];
  }
  return CHART_COLORS.primary;
}

// Generate gradient for charts
export function generateGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: { top: number; bottom: number },
  colorStart: string,
  colorEnd: string = colorStart,
  direction: 'vertical' | 'horizontal' = 'vertical'
): CanvasGradient {
  const gradient =
    direction === 'vertical'
      ? ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      : ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
  
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  
  return gradient;
}

// Format date for chart labels
export function formatChartDate(date: Date | string | number, formatStr: string = 'MMM d'): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting chart date:', error);
    return String(date);
  }
}

// Format number for chart tooltips
export function formatChartNumber(
  value: number,
  options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }
): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

// Common chart configurations
export const chartConfigs = {
  line: (data: ChartData<'line'>, options: ChartOptions = {}): ChartConfig<number> => ({
    type: 'line',
    data,
    options: {
      ...defaultChartOptions,
      ...options,
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2,
        },
        point: {
          radius: 3,
          hoverRadius: 5,
          hoverBorderWidth: 2,
        },
      },
    },
  }),
  
  bar: (data: ChartData<'bar'>, options: ChartOptions = {}): ChartConfig<number> => ({
    type: 'bar',
    data,
    options: {
      ...defaultChartOptions,
      ...options,
      scales: {
        ...defaultChartOptions.scales,
        ...options.scales,
        x: {
          ...defaultChartOptions.scales?.x,
          ...options.scales?.x,
          grid: {
            display: false,
          },
        },
      },
    },
  }),
  
  pie: (data: ChartData<'pie'>, options: ChartOptions = {}): ChartConfig<number> => ({
    type: 'pie',
    data,
    options: {
      ...defaultChartOptions,
      ...options,
      cutout: 0,
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          ...defaultChartOptions.plugins?.legend,
          position: 'right',
        },
      },
    },
  }),
  
  doughnut: (data: ChartData<'doughnut'>, options: ChartOptions = {}): ChartConfig<number> => ({
    type: 'doughnut',
    data,
    options: {
      ...defaultChartOptions,
      ...options,
      cutout: '70%',
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          ...defaultChartOptions.plugins?.legend,
          position: 'right',
        },
      },
    },
  }),
  
  area: (data: ChartData<'line'>, options: ChartOptions = {}): ChartConfig<number> => {
    const defaultAreaOptions: ChartOptions = {
      ...defaultChartOptions,
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2,
          fill: true,
        },
        point: {
          radius: 3,
          hoverRadius: 5,
          hoverBorderWidth: 2,
        },
      },
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          ...defaultChartOptions.plugins?.legend,
          position: 'top',
        },
      },
    };
    
    return {
      type: 'line',
      data: {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          fill: true,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            
            if (!chartArea) {
              return;
            }
            
            const gradient = generateGradient(
              ctx,
              chartArea,
              dataset.borderColor as string || CHART_COLORS.primary,
              'rgba(255, 255, 255, 0.1)'
            );
            
            return gradient;
          },
        })),
      },
      options: {
        ...defaultAreaOptions,
        ...options,
      },
    };
  },
  
  // Time series chart configuration
  timeSeries: (data: ChartData<'line'>, options: ChartOptions = {}): ChartConfig<number> => {
    const defaultTimeSeriesOptions: ChartOptions = {
      ...defaultChartOptions,
      scales: {
        ...defaultChartOptions.scales,
        x: {
          ...defaultChartOptions.scales?.x,
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'PP',
            displayFormats: {
              millisecond: 'HH:mm:ss.SSS',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'MMM d',
              week: 'PP',
              month: 'MMM yyyy',
              quarter: 'QQQ yyyy',
              year: 'yyyy',
            },
          },
          adapters: {
            date: {
              locale: enUS,
            },
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            maxTicksLimit: 8,
          },
        },
      },
      plugins: {
        ...defaultChartOptions.plugins,
        tooltip: {
          ...defaultChartOptions.plugins?.tooltip,
          callbacks: {
            ...defaultChartOptions.plugins?.tooltip?.callbacks,
            title: function(tooltipItems) {
              const date = tooltipItems[0].label;
              try {
                return format(parseISO(date), 'PPp');
              } catch (e) {
                return date;
              }
            },
          },
        },
      },
    };
    
    return {
      type: 'line',
      data,
      options: {
        ...defaultTimeSeriesOptions,
        ...options,
        elements: {
          line: {
            tension: 0.4,
            borderWidth: 2,
          },
          point: {
            radius: 3,
            hoverRadius: 5,
            hoverBorderWidth: 2,
          },
        },
      },
    };
  },
};

// Hook to create responsive chart options
export function useChartOptions(
  type: ChartType,
  customOptions: ChartOptions = {}
): ChartOptions {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const baseOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#F9FAFB' : '#1F2937',
        bodyColor: isDark ? '#E5E7EB' : '#4B5563',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: isDark ? CHART_COLORS.dark.grid : CHART_COLORS.light.grid,
        },
        ticks: {
          color: isDark ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
          maxRotation: 45,
          minRotation: 0,
        },
        border: {
          color: isDark ? CHART_COLORS.dark.border : CHART_COLORS.light.border,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [3, 3],
          color: isDark ? CHART_COLORS.dark.grid : CHART_COLORS.light.grid,
        },
        ticks: {
          color: isDark ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short',
              minimumFractionDigits: 0,
              maximumFractionDigits: 1,
            }).format(Number(value));
          },
        },
        border: {
          color: isDark ? CHART_COLORS.dark.border : CHART_COLORS.light.border,
        },
      },
    },
  };
  
  // Merge with custom options
  return {
    ...baseOptions,
    ...customOptions,
    scales: {
      ...baseOptions.scales,
      ...customOptions.scales,
    },
    plugins: {
      ...baseOptions.plugins,
      ...customOptions.plugins,
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        ...customOptions.plugins?.tooltip,
      },
      legend: {
        ...baseOptions.plugins?.legend,
        ...customOptions.plugins?.legend,
      },
    },
  };
}

// Helper to generate chart data with consistent colors
export function generateChartData<T extends ChartDataPoint>(
  labels: string[],
  datasets: Array<Omit<ChartDataset<T>, 'data'> & { data: T[] }>,
  colorPalette: keyof typeof CHART_COLORS = 'rainbow'
): ChartData<'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'area' | 'scatter' | 'bubble', T[]> {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || getChartColor(index, colorPalette),
      borderColor: dataset.borderColor || getChartColor(index, colorPalette),
      pointBackgroundColor: dataset.pointBackgroundColor || getChartColor(index, colorPalette),
      pointBorderColor: dataset.pointBorderColor || '#ffffff',
      pointHoverBackgroundColor: dataset.pointHoverBackgroundColor || '#ffffff',
      pointHoverBorderColor: dataset.pointHoverBorderColor || getChartColor(index, colorPalette),
      borderWidth: dataset.borderWidth || 2,
      pointRadius: dataset.pointRadius ?? 3,
      pointHoverRadius: dataset.pointHoverRadius ?? 5,
      pointBorderWidth: dataset.pointBorderWidth ?? 1,
      pointHoverBorderWidth: dataset.pointHoverBorderWidth ?? 2,
    })),
  };
}

// Helper to generate time series data
export function generateTimeSeriesData<T extends ChartDataPoint>(
  labels: (Date | string | number)[],
  datasets: Array<Omit<ChartDataset<T>, 'data'> & { data: T[] }>,
  colorPalette: keyof typeof CHART_COLORS = 'rainbow'
): ChartData<'line' | 'bar' | 'area', T[]> {
  return generateChartData(
    labels.map(label => typeof label === 'string' ? label : new Date(label).toISOString()),
    datasets,
    colorPalette
  ) as ChartData<'line' | 'bar' | 'area', T[]>;
}

// Helper to generate random chart data (for demos)
export function generateRandomData(
  count: number = 7,
  min: number = 0,
  max: number = 100,
  isInteger: boolean = true
): number[] {
  return Array.from({ length: count }, () => {
    const value = Math.random() * (max - min) + min;
    return isInteger ? Math.round(value) : parseFloat(value.toFixed(2));
  });
}

// Export the ChartJS instance for direct use
export { ChartJS as Chart } from 'chart.js';
