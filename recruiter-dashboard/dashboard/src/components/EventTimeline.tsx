import { Activity, FileText, MessageSquare, Phone, MousePointer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SegmentEvent } from '../types';

interface EventTimelineProps {
  events: SegmentEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const getEventIcon = (eventName: string) => {
    if (eventName.includes('Abandoned')) return FileText;
    if (eventName.includes('Message')) return MessageSquare;
    if (eventName.includes('Call') || eventName.includes('Transferred')) return Phone;
    if (eventName.includes('Clicked')) return MousePointer;
    return Activity;
  };

  const getEventColor = (eventName: string) => {
    if (eventName.includes('Abandoned')) return 'bg-amber-100 text-amber-700 border-amber-300';
    if (eventName.includes('Message')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (eventName.includes('Call') || eventName.includes('Transferred')) return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="gradient-gray px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Activity Timeline</h2>
          <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-bold shadow-sm">
            {events.length} events
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium">No activity recorded</p>
        </div>
      ) : (
        <div className="p-6 max-h-[500px] overflow-y-auto">
          <div className="space-y-3">
            {events.slice(0, 20).map((event, index) => {
              const Icon = getEventIcon(event.name);
              const colorClasses = getEventColor(event.name);
              const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });

              return (
                <div
                  key={index}
                  className={`border-l-4 px-4 py-3 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 ${colorClasses}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{event.name}</div>
                      <div className="text-xs opacity-80 mt-1.5 font-semibold">{timeAgo}</div>
                      {event.properties?.abandonment_step && (
                        <div className="text-xs mt-2 font-bold">
                          At: {event.properties.abandonment_step}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {events.length > 20 && (
            <div className="text-center text-xs text-gray-500 font-semibold mt-4 pt-4 border-t border-gray-200">
              Showing 20 of {events.length} events
            </div>
          )}
        </div>
      )}
    </div>
  );
}
