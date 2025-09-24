import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, ChartData, ChartOptions, registerables } from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { useTheme } from './theme-utils';
import { useI18n } from './i18n';
import { CHART_COLORS, getChartColor, generateGradient } from './chart-utils';

// Register ChartJS components and plugins
ChartJS.register(...registerables, zoomPlugin);

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';

interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  fallbackContent?: React.ReactNode;
  onHover?: (event: any, elements: any, chart: any) => void;
  onClick?: (event: any, elements: any, chart: any) => void;
  onZoom?: ({ chart }: { chart: any }) => void;
  onZoomComplete?: ({ chart }: { chart: any }) => void;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left' | 'chartArea' | { [scaleId: string]: number } | undefined;
  tooltipEnabled?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  stacked?: boolean;
  maintainAspectRatio?: boolean;
  responsive?: boolean;
}

const chartComponents = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  bubble: Bubble,
  scatter: Scatter,
};

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  options: customOptions = {},
  width = '100%',
  height = '400px',
  className = '',
  style = {},
  fallbackContent = null,
  onHover,
  onClick,
  onZoom,
  onZoomComplete,
  zoomEnabled = false,
  panEnabled = false,
  legendPosition = 'top',
  tooltipEnabled = true,
  xAxisTitle = '',
  yAxisTitle = '',
  stacked = false,
  maintainAspectRatio = true,
  responsive = true,
}) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const chartRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  const defaultOptions: ChartOptions = useMemo(() => ({
    responsive,
    maintainAspectRatio,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: legendPosition,
        labels: {
          color: theme === 'dark' ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: tooltipEnabled ? {
        backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#F9FAFB' : '#1F2937',
        bodyColor: theme === 'dark' ? '#E5E7EB' : '#4B5563',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
      } : { enabled: false },
      zoom: zoomEnabled || panEnabled ? {
        zoom: {
          wheel: { enabled: zoomEnabled },
          pinch: { enabled: zoomEnabled },
          mode: 'x',
          onZoom: onZoom,
          onZoomComplete: onZoomComplete,
        },
        pan: {
          enabled: panEnabled,
          mode: 'x',
        },
      } : undefined,
    },
    scales: {
      x: {
        title: {
          display: !!xAxisTitle,
          text: xAxisTitle,
          color: theme === 'dark' ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
        },
        grid: {
          display: false,
          color: theme === 'dark' ? CHART_COLORS.dark.grid : CHART_COLORS.light.grid,
        },
        ticks: {
          color: theme === 'dark' ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
        },
        stacked: stacked,
      },
      y: {
        title: {
          display: !!yAxisTitle,
          text: yAxisTitle,
          color: theme === 'dark' ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
        },
        grid: {
          color: theme === 'dark' ? CHART_COLORS.dark.grid : CHART_COLORS.light.grid,
          borderDash: [3, 3],
        },
        ticks: {
          color: theme === 'dark' ? CHART_COLORS.dark.text : CHART_COLORS.light.text,
          callback: (value) => {
            if (typeof value === 'number') {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              }).format(value);
            }
            return value;
          },
        },
        stacked: stacked,
      },
    },
  }), [
    theme, 
    responsive, 
    maintainAspectRatio, 
    legendPosition, 
    tooltipEnabled, 
    zoomEnabled, 
    panEnabled, 
    xAxisTitle, 
    yAxisTitle, 
    stacked,
    onZoom,
    onZoomComplete,
  ]);

  const options = useMemo(() => ({
    ...defaultOptions,
    ...customOptions,
    plugins: {
      ...defaultOptions.plugins,
      ...customOptions.plugins,
    },
    scales: {
      ...defaultOptions.scales,
      ...customOptions.scales,
      x: {
        ...defaultOptions.scales?.x,
        ...(customOptions.scales?.x || {}),
      },
      y: {
        ...defaultOptions.scales?.y,
        ...(customOptions.scales?.y || {}),
      },
    },
  }), [defaultOptions, customOptions]);

  const handleHover = useCallback((event: any, elements: any, chart: any) => {
    if (onHover) {
      onHover(event, elements, chart);
    }
  }, [onHover]);

  const handleClick = useCallback((event: any, elements: any, chart: any) => {
    if (onClick) {
      onClick(event, elements, chart);
    }
  }, [onClick]);

  const ChartComponent = chartComponents[type] || Line;

  if (!isMounted) {
    return <div style={{ width, height }} className={className}>{fallbackContent}</div>;
  }

  return (
    <div style={{ width, height, ...style }} className={className}>
      <ChartComponent
        ref={chartRef}
        data={data}
        options={options}
        onHover={handleHover}
        onClick={handleClick}
      />
    </div>
  );
};

// Helper components for common chart types
export const LineChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="line" {...props} />
);

export const BarChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="bar" {...props} />
);

export const PieChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="pie" {...props} />
);

export const DoughnutChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="doughnut" {...props} />
);

export const RadarChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="radar" {...props} />
);

export const PolarAreaChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="polarArea" {...props} />
);

export const BubbleChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="bubble" {...props} />
);

export const ScatterChart: React.FC<Omit<ChartProps, 'type'>> = (props) => (
  <Chart type="scatter" {...props} />
);

// Helper hooks
export const useChartData = <T,>(
  initialData: T[],
  transformFn: (data: T[]) => ChartData
) => {
  const [chartData, setChartData] = useState<ChartData>(() => 
    transformFn(initialData)
  );

  const updateData = useCallback((newData: T[]) => {
    setChartData(transformFn(newData));
  }, [transformFn]);

  return [chartData, updateData] as const;
};

// Utility functions
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const generateTimeSeriesData = (
  labels: (string | number | Date)[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
    tension?: number;
  }>,
  options: {
    stacked?: boolean;
    yAxisFormat?: 'number' | 'currency' | 'percentage';
    yAxisCurrency?: string;
  } = {}
): ChartData => {
  const { stacked = false, yAxisFormat = 'number', yAxisCurrency = 'USD' } = options;

  const formatYAxis = (value: number): string => {
    switch (yAxisFormat) {
      case 'currency':
        return formatCurrency(value, yAxisCurrency);
      case 'percentage':
        return formatPercentage(value / 100);
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  return {
    labels: labels.map(label => {
      if (label instanceof Date) {
        return label.toISOString();
      }
      return label;
    }),
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.color || getChartColor(index),
      borderColor: dataset.color || getChartColor(index),
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: dataset.color || getChartColor(index),
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: dataset.color || getChartColor(index),
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 2,
      fill: dataset.fill ?? false,
      tension: dataset.tension ?? 0.4,
      yAxisID: 'y',
    })),
  };
};

export const generateBarChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>,
  options: {
    stacked?: boolean;
    yAxisFormat?: 'number' | 'currency' | 'percentage';
    yAxisCurrency?: string;
  } = {}
): ChartData => {
  const { stacked = false, yAxisFormat = 'number', yAxisCurrency = 'USD' } = options;

  const formatYAxis = (value: number): string => {
    switch (yAxisFormat) {
      case 'currency':
        return formatCurrency(value, yAxisCurrency);
      case 'percentage':
        return formatPercentage(value / 100);
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.color || getChartColor(index),
      borderColor: dataset.color || getChartColor(index),
      borderWidth: 1,
      hoverBackgroundColor: dataset.color ? `${dataset.color}CC` : `${getChartColor(index)}CC`,
      hoverBorderColor: dataset.color || getChartColor(index),
      yAxisID: 'y',
    })),
  };
};

export const generatePieChartData = (
  labels: string[],
  data: number[],
  colors: string[] = []
): ChartData => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: colors.length ? colors : labels.map((_, i) => getChartColor(i)),
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 8,
    },
  ],
});

export const generateDoughnutChartData = (
  labels: string[],
  data: number[],
  colors: string[] = []
): ChartData => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: colors.length ? colors : labels.map((_, i) => getChartColor(i)),
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 8,
      cutout: '70%',
    },
  ],
});

export const generateRadarChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }>
): ChartData => ({
  labels,
  datasets: datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor: dataset.color ? `${dataset.color}33` : `${getChartColor(index)}33`,
    borderColor: dataset.color || getChartColor(index),
    pointBackgroundColor: dataset.color || getChartColor(index),
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: dataset.color || getChartColor(index),
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    fill: dataset.fill ?? true,
  })),
});

export const generatePolarAreaChartData = (
  labels: string[],
  data: number[],
  colors: string[] = []
): ChartData => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: colors.length ? colors : labels.map((_, i) => getChartColor(i)),
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
});

export const generateBubbleChartData = (
  data: Array<{
    x: number;
    y: number;
    r: number;
    label?: string;
  }>,
  color?: string
): ChartData => ({
  datasets: [
    {
      label: 'Bubble Dataset',
      data: data.map(item => ({
        x: item.x,
        y: item.y,
        r: item.r,
        label: item.label,
      })),
      backgroundColor: color || CHART_COLORS.primary,
      borderColor: color ? `${color}CC` : `${CHART_COLORS.primary}CC`,
      borderWidth: 1,
    },
  ],
});

export const generateScatterChartData = (
  data: Array<{
    x: number | string | Date;
    y: number;
    label?: string;
  }>,
  color?: string
): ChartData => ({
  datasets: [
    {
      label: 'Scatter Dataset',
      data: data.map(item => ({
        x: item.x,
        y: item.y,
        label: item.label,
      })),
      backgroundColor: color || CHART_COLORS.primary,
      borderColor: color || CHART_COLORS.primary,
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
});
