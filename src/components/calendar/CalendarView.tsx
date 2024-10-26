// src/components/calendar/CalendarView.tsx
import { Calendar } from '../ui/calendar/Calendar';

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
        components={{
          DayContent: ({ date }) => {
            const dayEvents = events.filter(
              event => isSameDay(parseISO(event.date), date)
            );
            return (
              <div className="relative w-full h-full">
                <div>{date.getDate()}</div>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-blue-500 rounded-full" />
                  </div>
                )}
              </div>
            );
          },
        }}
      />
      {selectedDate && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {/* Task list for selected date */}
        </div>
      )}
    </div>
  );
};