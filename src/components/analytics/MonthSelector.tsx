import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const inputClasses = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200';

interface MonthSelectorProps {
  startMonth: string;
  compareMonth: string;
  onMonthsChange: (startMonth: string, compareMonth: string) => void;
}

const toDate = (month: string): Date => {
  const parsed = new Date(`${month}-01T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const MonthSelector = ({ startMonth, compareMonth, onMonthsChange }: MonthSelectorProps) => {
  const [startDate, setStartDate] = useState<Date>(toDate(startMonth));
  const [compareDate, setCompareDate] = useState<Date>(toDate(compareMonth));

  const sharedPickerProps = {
    dateFormat: 'MMM yyyy',
    showMonthYearPicker: true,
    className: inputClasses,
    placeholderText: 'Select month',
    portalId: 'calendar-portal',
  };

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    setStartDate(date);
    const monthStr = format(date, 'yyyy-MM');
    onMonthsChange(monthStr, compareMonth);
  };

  const handleCompareDateChange = (date: Date | null) => {
    if (!date) return;
    setCompareDate(date);
    const monthStr = format(date, 'yyyy-MM');
    onMonthsChange(startMonth, monthStr);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Marketing Analytics</h2>
            <p className="text-sm text-slate-500">Select any two months to compare campaign performance.</p>
          </div>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2 sm:items-end lg:w-auto lg:grid-cols-[repeat(2,minmax(0,1fr))]">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Calendar className="h-4 w-4" />
              Current period
            </span>
            <DatePicker selected={startDate} onChange={handleStartDateChange} {...sharedPickerProps} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comparison period</span>
            <DatePicker
              selected={compareDate}
              onChange={handleCompareDateChange}
              {...sharedPickerProps}
              placeholderText="Compare month"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MonthSelector;

