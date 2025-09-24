import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  events?: Array<{
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    [key: string]: any;
  }>;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  events = [],
  ...props
}: CalendarProps) {
  // Create a map of dates to event counts
  const eventDates = React.useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((event) => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : start;
      
      // For all-day events, we'll mark each day in the range
      if (event.allDay) {
        const current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          map.set(dateStr, (map.get(dateStr) || 0) + 1);
          current.setDate(current.getDate() + 1);
        }
      } else {
        // For timed events, just mark the start date
        const dateStr = start.toISOString().split('T')[0];
        map.set(dateStr, (map.get(dateStr) || 0) + 1);
      }
    });
    return map;
  }, [events]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
          'hover:bg-gray-100 rounded-md',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          'flex flex-col items-center justify-center'
        ),
        day_selected:
          'bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white',
        day_today: 'bg-gray-100',
        day_outside: 'text-gray-400 opacity-50',
        day_disabled: 'text-gray-400 opacity-50',
        day_range_middle: 'aria-selected:bg-indigo-100 aria-selected:text-indigo-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Day: (dayProps) => {
          const date = dayProps.date;
          const dateStr = date?.toISOString().split('T')[0] || '';
          const eventCount = eventDates.get(dateStr) || 0;
          
          return (
            <div
              className={cn(
                'relative h-full w-full p-0',
                dayProps.className
              )}
              onClick={dayProps.onClick}
              onBlur={dayProps.onBlur}
              onFocus={dayProps.onFocus}
            >
              <time dateTime={dateStr} className="block">
                {date?.getDate()}
              </time>
              {eventCount > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                  {[...Array(Math.min(eventCount, 3))].map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                    />
                  ))}
                  {eventCount > 3 && (
                    <span className="text-xs text-gray-500">+{eventCount - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
