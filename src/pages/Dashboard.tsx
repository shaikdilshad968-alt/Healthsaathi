import { Link } from 'react-router-dom';
import {
  Heart, Activity, Utensils, Bell, FileText, TrendingUp,
  Plus, MessageSquare, Upload, ClipboardList, Zap,
  ArrowRight, CheckCircle2, AlertCircle, Clock, ChevronRight,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { useApp, useActiveProfile } from '@/context/AppContext';
import { DEMO_REPORTS, DEMO_TIMELINE, DEMO_WEIGHT_HISTORY, DEMO_NUTRITION_TARGETS } from '@/lib/demoData';
import { calculateAge, calculateBMI, bmiCategory } from '@/lib/nutritionCalculator';
import { formatDate, getRelativeTime } from '@/lib/utils';

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#0f9b8e', trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color?: string; trend?: { dir: 'up' | 'down' | 'stable'; text: string };
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            trend.dir === 'up'     ? 'bg-red-50 text-red-600' :
            trend.dir === 'down'   ? 'bg-emerald-50 text-emerald-600' :
                                     'bg-slate-100 text-slate-500'
          }`}>{trend.text}</span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Quick Action Button ────────────────────────────────────────
function QuickAction({ icon: Icon, label, to, color = '#0f9b8e' }: {
  icon: React.ElementType; label: string; to: string; color?: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-200 hover:shadow-md transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110 duration-200" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </div>
      <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{label}</span>
    </Link>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const { reminders, actions, foodLog } = useApp();
  const profile = useActiveProfile();

  if (!profile) return null;

  const age        = calculateAge(profile.dob);
  const bmi        = calculateBMI(profile.weight_kg, profile.height_cm);
  const bmiCat     = bmiCategory(bmi);
  const targets    = DEMO_NUTRITION_TARGETS;
  const todayLog   = foodLog;
  const totalCal   = todayLog.reduce((s, f) => s + f.calories, 0);
  const totalProt  = todayLog.reduce((s, f) => s + f.protein_g, 0);
  const calPct     = Math.min(Math.round((totalCal / targets.calories) * 100), 100);
  const protPct    = Math.min(Math.round((totalProt / targets.protein_g) * 100), 100);
  const pendingActs = actions.filter(a => a.status === 'pending' || a.status === 'in_progress');
  const overduRems  = reminders.filter(r => r.is_overdue && r.is_active);
  const todayRems   = reminders.filter(r => r.is_active && !r.is_overdue).slice(0, 3);

  // Radial chart data for today's nutrition
  const radialData = [
    { name: 'Calories', value: calPct,  fill: '#0f9b8e' },
    { name: 'Protein',  value: protPct, fill: '#10b981' },
  ];

  // Weight trend chart
  const weightData = DEMO_WEIGHT_HISTORY.map(m => ({
    date: formatDate(m.recorded_at, { month: 'short', year: '2-digit' }),
    weight: m.value,
  }));

  const recentReport = DEMO_REPORTS[0];
  const flaggedObs   = recentReport.observations.filter(o => o.flag !== 'normal');

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Welcome ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Namaste, {profile.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/chat" className="btn-primary text-sm gap-1.5">
          <MessageSquare size={15} />
          Ask HealthSaathi
        </Link>
      </div>

      {/* ── Health Stats ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart}    label="BMI"           value={bmi.toString()} sub={bmiCat.label}      color={bmiCat.color} />
        <StatCard icon={Activity} label="Weight"        value={`${profile.weight_kg} kg`} sub="Last: Sep 25" color="#3b82f6" trend={{ dir: 'down', text: '−2 kg' }} />
        <StatCard icon={Utensils} label="Calories Today" value={`${totalCal}`} sub={`of ${targets.calories} kcal target`} color="#f59e0b" />
        <StatCard icon={Zap}      label="Active Actions" value={pendingActs.length.toString()} sub="health tasks pending" color="#8b5cf6" />
      </div>

      {/* ── Today's Overview ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Nutrition Ring */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title text-base">Today's Nutrition</p>
              <p className="section-sub">vs your daily targets</p>
            </div>
            <Link to="/food-tracker" className="btn-ghost text-xs py-1.5">
              Log food <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div style={{ width: 110, height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius={28} outerRadius={50} data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f1f5f9' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Calories', val: totalCal, target: targets.calories, unit: 'kcal', pct: calPct, color: '#0f9b8e' },
                { label: 'Protein',  val: Math.round(totalProt), target: targets.protein_g, unit: 'g', pct: protPct, color: '#10b981' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="text-slate-400">{item.val}/{item.target}{item.unit}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400">{Math.max(0, targets.calories - totalCal)} kcal remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Trend Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title text-base">Weight Trend</p>
              <p className="section-sub">Last 9 months</p>
            </div>
            <span className="badge-green">−2 kg this year</span>
          </div>
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0f9b8e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0f9b8e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[60, 68]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(value) => [`${value ?? 0} kg`, 'Weight']}
                />
                <Area type="monotone" dataKey="weight" stroke="#0f9b8e" strokeWidth={2.5} fill="url(#wGrad)" dot={{ r: 3, fill: '#0f9b8e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Reports + Reminders ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Report Flags */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title text-base">Recent Report Flags</p>
              <p className="section-sub">{recentReport.title} — {formatDate(recentReport.report_date)}</p>
            </div>
            <Link to="/reports" className="btn-ghost text-xs py-1.5">
              All reports <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {flaggedObs.slice(0, 4).map(obs => (
              <div key={obs.test_name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{obs.test_name}</p>
                  <p className="text-[11px] text-slate-400">{obs.value} {obs.unit} · Ref: {obs.ref_range}</p>
                </div>
                <span className={`badge ${obs.flag === 'low' ? 'badge-blue' : obs.flag === 'high' ? 'badge-amber' : 'badge-red'}`}>
                  {obs.flag?.toUpperCase()}
                </span>
              </div>
            ))}
            {flaggedObs.length > 4 && (
              <Link to="/reports" className="text-xs text-teal-600 font-medium hover:underline">+{flaggedObs.length - 4} more</Link>
            )}
          </div>
        </div>

        {/* Reminders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title text-base">Today's Reminders</p>
              <p className="section-sub">{overduRems.length > 0 ? `${overduRems.length} overdue` : 'All on track'}</p>
            </div>
            <Link to="/reminders" className="btn-ghost text-xs py-1.5">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {overduRems.slice(0,2).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-700 truncate">{r.title}</p>
                  <p className="text-[11px] text-red-400">{r.schedule}</p>
                </div>
                <span className="badge-red ml-auto">Overdue</span>
              </div>
            ))}
            {todayRems.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Clock size={15} className="text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{r.title}</p>
                  <p className="text-[11px] text-slate-400">{r.schedule}</p>
                </div>
                <span className="badge-teal ml-auto">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Health Timeline ───────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-title text-base">Health Timeline</p>
            <p className="section-sub">Recent events in your health journey</p>
          </div>
          <Link to="/timeline" className="btn-ghost text-xs py-1.5">
            Full timeline <ArrowRight size={12} />
          </Link>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />
          <div className="space-y-3 ml-2">
            {DEMO_TIMELINE.slice(0, 5).map(evt => (
              <div key={evt.id} className="flex items-start gap-3 pl-6 relative">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center z-10 ${
                  evt.event_type === 'report'      ? 'bg-blue-400' :
                  evt.event_type === 'appointment' ? 'bg-teal-400' :
                  evt.event_type === 'medication'  ? 'bg-purple-400' :
                  evt.event_type === 'measurement' ? 'bg-emerald-400' : 'bg-slate-300'
                }`} />
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-700 truncate">{evt.title}</p>
                    <p className="text-[10px] text-slate-400 flex-shrink-0">{formatDate(evt.event_date)}</p>
                  </div>
                  {evt.description && <p className="text-[11px] text-slate-400 truncate">{evt.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Health Action Plan ────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-title text-base">Your Health Action Plan</p>
            <p className="section-sub">{pendingActs.length} tasks pending · AI-suggested, you review</p>
          </div>
          <Link to="/reports" className="btn-ghost text-xs py-1.5">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {pendingActs.slice(0, 4).map(a => (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <CheckCircle2 size={16} className={a.status === 'in_progress' ? 'text-teal-500' : 'text-slate-300'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">{a.title}</p>
                {a.description && <p className="text-[11px] text-slate-400 truncate">{a.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {a.due_date && <span className="text-[10px] text-slate-400">{formatDate(a.due_date)}</span>}
                <span className={`badge ${
                  a.priority === 'high'   ? 'badge-red' :
                  a.priority === 'medium' ? 'badge-amber' : 'badge-teal'
                }`}>{a.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────── */}
      <div className="card p-5">
        <p className="section-title text-base mb-4">Quick Actions</p>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          <QuickAction icon={Upload}       label="Upload Report"     to="/reports"       color="#3b82f6" />
          <QuickAction icon={Utensils}     label="Log Food"          to="/food-tracker"  color="#f59e0b" />
          <QuickAction icon={Activity}     label="Symptom Check"     to="/symptoms"      color="#ef4444" />
          <QuickAction icon={MessageSquare}label="AI Health Chat"    to="/chat"          color="#0f9b8e" />
        </div>
      </div>

    </div>
  );
}
