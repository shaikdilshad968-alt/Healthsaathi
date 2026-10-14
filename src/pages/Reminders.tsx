import { useState } from 'react';
import { useApp, useActiveProfile } from '@/context/AppContext';
import { Bell, Plus, Trash2, Pause, Play, CheckCircle2, AlertCircle, Calendar, Pill, Heart } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Reminder, ReminderType } from '@/types';
import toast from 'react-hot-toast';

const TYPE_CONFIG: Record<ReminderType, { icon: React.ElementType; color: string; label: string }> = {
  medication:  { icon: Pill,      color: '#8b5cf6', label: 'Medication' },
  appointment: { icon: Calendar,  color: '#0f9b8e', label: 'Appointment' },
  wellness:    { icon: Heart,     color: '#10b981', label: 'Wellness' },
  follow_up:   { icon: Bell,      color: '#f59e0b', label: 'Follow-up' },
};

export default function Reminders() {
  const { reminders, addReminder, updateReminder, removeReminder } = useApp();
  const profile = useActiveProfile();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'medication' as ReminderType, description: '', schedule: '' });

  const activeReminders = reminders.filter(r => r.profile_id === profile?.id);
  const overdue = activeReminders.filter(r => r.is_overdue && r.is_active);
  const active  = activeReminders.filter(r => !r.is_overdue && r.is_active);
  const paused  = activeReminders.filter(r => !r.is_active);

  const handleAdd = () => {
    if (!form.title || !form.schedule) return toast.error('Please fill in title and schedule');
    const newRem: Reminder = {
      id: Date.now().toString(),
      profile_id: profile?.id ?? '',
      type: form.type,
      title: form.title,
      description: form.description,
      schedule: form.schedule,
      is_active: true,
      next_due: new Date().toISOString(),
      is_overdue: false,
    };
    addReminder(newRem);
    setForm({ title: '', type: 'medication', description: '', schedule: '' });
    setShowForm(false);
    toast.success('Reminder added!');
  };

  const toggle = (r: Reminder) => {
    updateReminder({ ...r, is_active: !r.is_active });
    toast.success(r.is_active ? 'Reminder paused' : 'Reminder activated');
  };

  const ReminderRow = ({ r }: { r: Reminder }) => {
    const cfg = TYPE_CONFIG[r.type];
    const Icon = cfg.icon;
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        r.is_overdue ? 'bg-red-50 border-red-100' : r.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
      }`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '18' }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800 truncate">{r.title}</p>
            {r.is_overdue && <AlertCircle size={12} className="text-red-500 flex-shrink-0" />}
          </div>
          {r.description && <p className="text-xs text-slate-500 truncate">{r.description}</p>}
          <p className="text-[11px] text-slate-400">{r.schedule}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {r.is_overdue && <span className="badge-red">Overdue</span>}
          {!r.is_overdue && r.is_active && <span className="badge-green">Active</span>}
          {!r.is_active && <span className="badge text-slate-500 bg-slate-100">Paused</span>}
          <button className="btn-ghost py-1.5 px-2" onClick={() => toggle(r)} title={r.is_active ? 'Pause' : 'Activate'}>
            {r.is_active ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button className="btn-ghost py-1.5 px-2 text-red-400 hover:text-red-600" onClick={() => { removeReminder(r.id); toast.success('Removed'); }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Reminders</h1>
          <p className="section-sub">{overdue.length > 0 ? `⚠️ ${overdue.length} overdue` : 'All reminders on track'}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} />Add Reminder
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5 space-y-3">
          <p className="font-bold text-slate-800 text-sm">New Reminder</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Title *</label><input className="input" placeholder="e.g. Iron Supplement" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ReminderType }))}>
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="wellness">Wellness</option>
                <option value="follow_up">Follow-up</option>
              </select>
            </div>
            <div><label className="label">Description (optional)</label><input className="input" placeholder="e.g. Take with orange juice" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><label className="label">Schedule *</label><input className="input" placeholder="e.g. Daily at 08:00 AM" value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleAdd}><CheckCircle2 size={14} />Save Reminder</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">⚠️ Overdue ({overdue.length})</p>
          <div className="space-y-2">{overdue.map(r => <ReminderRow key={r.id} r={r} />)}</div>
        </div>
      )}

      {/* Active */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active ({active.length})</p>
        {active.length > 0
          ? <div className="space-y-2">{active.map(r => <ReminderRow key={r.id} r={r} />)}</div>
          : <div className="empty-state py-8"><Bell size={32} className="text-slate-300 mb-2" /><p className="text-sm">No active reminders</p></div>
        }
      </div>

      {/* Paused */}
      {paused.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Paused ({paused.length})</p>
          <div className="space-y-2">{paused.map(r => <ReminderRow key={r.id} r={r} />)}</div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center">
        Reminders are displayed in-app only. Push notifications require additional configuration.
        These are not medical prescriptions — always follow your doctor's instructions.
      </p>
    </div>
  );
}
