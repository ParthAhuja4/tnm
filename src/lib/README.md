# Analytics & Visualization Utilities

This directory contains reusable utilities and React components for data visualization and analytics processing in the application.

## Table of Contents

- [Installation](#installation)
- [Chart Utilities](#chart-utilities)
- [Analytics Utilities](#analytics-utilities)
- [Visualization Components](#visualization-components)
- [Theming](#theming)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Installation

These utilities require the following peer dependencies:

```bash
npm install chart.js react-chartjs-2 chartjs-plugin-zoom date-fns date-fns-tz
```

## Chart Utilities (`chart-utils.ts`)

Provides configurations and helpers for working with Chart.js.

### Features

- Predefined color palettes (primary, secondary, semantic, etc.)
- Default chart options with responsive design
- Theme-aware color generation
- Gradient generation for charts
- Date and number formatting utilities
- Predefined chart configurations for common chart types
- Random data generation for demos

### Basic Usage

```typescript
import { getDefaultChartOptions, generateChartData } from './chart-utils';

const options = getDefaultChartOptions('line', {
  title: 'Sample Chart',
  xAxisLabel: 'Date',
  yAxisLabel: 'Value'
});

const data = generateChartData(
  ['Jan', 'Feb', 'Mar'],
  [
    { label: 'Dataset 1', data: [10, 20, 30] },
    { label: 'Dataset 2', data: [15, 25, 35] }
  ]
);
```

## Analytics Utilities (`analytics-utils.ts`)

Provides functions for processing and analyzing analytics data.

### Features

- Date range utilities (today, last 7 days, this month, etc.)
- Data aggregation by time units (day, week, month, etc.)
- Common metric calculations (CTR, CPA, ROAS, etc.)
- Data transformation and filtering
- Sorting and pagination
- Anomaly detection
- Timezone handling

### Basic Usage

```typescript
import { 
  getDateRange, 
  DateRangeType,
  calculateCTR,
  aggregateDataByTimeUnit
} from './analytics-utils';

// Get date range
const { startDate, endDate } = getDateRange(DateRangeType.LAST_30_DAYS);

// Calculate metrics
const ctr = calculateCTR(1000, 50); // 5%

// Aggregate data
const aggregated = aggregateDataByTimeUnit(rawData, 'day', 'date');
```

## Visualization Components (`viz-utils.tsx`)

React components and hooks for data visualization.

### Components

- `Chart`: A generic chart component that supports all Chart.js chart types
- Pre-built chart components: `LineChart`, `BarChart`, `PieChart`, etc.

### Hooks

- `useChartData`: Manage chart data with transformation functions
- `useChartOptions`: Generate theme-aware chart options

### Basic Usage

```tsx
import { LineChart } from './viz-utils';

function AnalyticsDashboard() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Visitors',
        data: [100, 200, 150, 300, 250],
        borderColor: 'primary',
        fill: false
      }
    ]
  };

  return (
    <LineChart 
      data={data}
      title="Monthly Visitors"
      height={400}
      showLegend
      showTooltips
      zoomEnabled
    />
  );
}
```

## Theming

All visualization components are theme-aware and will automatically adapt to light/dark themes when used with the application's theming system.

### Customizing Colors

You can customize the color palette by providing theme overrides:

```typescript
const theme = {
  colors: {
    primary: '#4f46e5',
    secondary: '#10b981',
    // ... other theme colors
  }
};
```

## Usage Examples

### Creating a Time Series Chart

```tsx
import { LineChart } from './viz-utils';
import { generateTimeSeriesData } from './chart-utils';

function TimeSeriesExample() {
  const data = generateTimeSeriesData(
    new Date('2023-01-01'),
    new Date('2023-12-31'),
    'month',
    [
      { label: 'Users', min: 100, max: 500 },
      { label: 'Sessions', min: 200, max: 800 }
    ]
  );

  return (
    <LineChart
      data={data}
      title="Monthly Traffic"
      xAxisLabel="Date"
      yAxisLabel="Count"
      height={400}
      showLegend
      zoomEnabled
    />
  );
}
```

### Creating a Dashboard with Multiple Charts

```tsx
import { Grid } from '@mui/material';
import { LineChart, BarChart, PieChart } from './viz-utils';
import { generateChartData } from './chart-utils';

function Dashboard() {
  const lineData = generateChartData(
    ['Q1', 'Q2', 'Q3', 'Q4'],
    [
      { label: '2022', data: [120, 190, 150, 200] },
      { label: '2023', data: [180, 210, 250, 220] }
    ]
  );

  const barData = generateChartData(
    ['Product A', 'Product B', 'Product C', 'Product D'],
    [
      { label: 'Sales', data: [12000, 15000, 8000, 10000] }
    ]
  );

  const pieData = generateChartData(
    ['Desktop', 'Mobile', 'Tablet'],
    [
      { label: 'Devices', data: [60, 35, 5] }
    ]
  );

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <LineChart
            data={lineData}
            title="Quarterly Revenue"
            yAxisLabel="Revenue ($)"
            height={300}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PieChart
            data={pieData}
            title="Traffic by Device"
            height={300}
          />
        </Grid>
        <Grid item xs={12}>
          <BarChart
            data={barData}
            title="Product Sales"
            yAxisLabel="Sales ($)"
            height={300}
          />
        </Grid>
      </Grid>
    </div>
  );
}
```

## API Reference

### Chart Component Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `type` | string | Chart type (line, bar, pie, etc.) | 'line' |
| `data` | object | Chart data object | required |
| `title` | string | Chart title | '' |
| `width` | number | Chart width in pixels | '100%' |
| `height` | number | Chart height in pixels | 300 |
| `showLegend` | boolean | Whether to show the legend | true |
| `showTooltips` | boolean | Whether to show tooltips | true |
| `zoomEnabled` | boolean | Whether zoom/pan is enabled | false |
| `xAxisLabel` | string | Label for the X axis | '' |
| `yAxisLabel` | string | Label for the Y axis | '' |
| `options` | object | Custom Chart.js options | {} |

### Common Utilities

#### generateChartData(labels, datasets, options)
Generates a Chart.js compatible data object.

#### getDefaultChartOptions(type, options)
Gets default options for a chart type.

#### formatNumber(value, options)
Formats a number with optional decimal places and unit.

#### formatDate(date, format, timezone)
Formats a date with optional timezone support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

Please ensure all code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
