import { DEMO_TIMELINE, DEMO_REPORTS } from '@/lib/demoData';
import { formatDate } from '@/lib/utils';
import { FileText, Calendar, Pill, Activity, StickyNote, Ruler } from 'lucide-react';
import type { EventType } from '@/types';

const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; color: string; bg: string }> = {
  report:      { icon: FileText,   color: '#3b82f6', bg: '#eff6ff' },
  appointment: { icon: Calendar,   color: '#0f9b8e', bg: '#f0fdf9' },
  medication:  { icon: Pill,       color: '#8b5cf6', bg: '#f5f3ff' },
  measurement: { icon: Ruler,      color: '#10b981', bg: '#ecfdf5' },
  note:        { icon: StickyNote, color: '#f59e0b', bg: '#fffbeb' },
};

export default function Timeline() {
  const allEvents = [
    ...DEMO_TIMELINE,
    ...DEMO_REPORTS.map(r => ({
      id: 'r-' + r.id,
      profile_id: r.profile_id,
      event_type: 'report' as EventType,
      title: r.title + ' — uploaded',
      description: r.lab_name,
      event_date: r.uploaded_at,
    }))
  ].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-xl">Health Timeline</h1>
        <p className="section-sub">Your complete health history in chronological order</p>
      </div>

      <div className="card p-6">
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
          <div className="space-y-5">
            {allEvents.map(evt => {
              const cfg = EVENT_CONFIG[evt.event_type];
              const Icon = cfg.icon;
              return (
                <div key={evt.id} className="flex items-start gap-4 pl-12 relative animate-fade-in">
                  <div
                    className="absolute left-1.5 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10"
                    style={{ background: cfg.bg }}
                  >
                    <Icon size={14} style={{ color: cfg.color }} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{evt.title}</p>
                      <p className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{formatDate(evt.event_date)}</p>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{evt.description}</p>
                    )}
                    <span
                      className="mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {evt.event_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
