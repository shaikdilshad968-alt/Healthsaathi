import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp, useActiveProfile } from '@/context/AppContext';
import {
  LayoutDashboard, User, MessageSquare, FileText, Clock, Activity,
  Salad, Utensils, Bell, Heart, RotateCcw, ChevronRight, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',              label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/profile',       label: 'My Health Profile', icon: User },
  { to: '/chat',          label: 'AI Health Chat',    icon: MessageSquare },
  { to: '/reports',       label: 'Medical Reports',   icon: FileText },
  { to: '/timeline',      label: 'Health Timeline',   icon: Clock },
  { to: '/symptoms',      label: 'Symptom Guidance',  icon: Activity },
  { to: '/nutrition',     label: 'Nutrition Planner',  icon: Salad },
  { to: '/food-tracker',  label: 'Food Tracker',      icon: Utensils },
  { to: '/reminders',     label: 'Reminders',         icon: Bell },
] as const;

export default function Sidebar() {
  const { resetDemoData, signOut } = useApp();
  const profile = useActiveProfile();
  const location = useLocation();

  return (
    <aside className="sidebar scrollbar-thin overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-teal flex items-center justify-center shadow-teal">
            <Heart size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 leading-none">HealthSaathi</p>
            <p className="text-[10px] text-teal-600 font-semibold mt-0.5">AI Health Copilot</p>
          </div>
        </div>
      </div>

      {/* Active profile chip */}
      {profile && (
        <NavLink to="/profile" className="mx-3 my-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/80 hover:border-teal-200 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {profile.name.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{profile.name}</p>
            <p className="text-[10px] text-slate-500">{profile.is_self ? 'You' : profile.relationship}</p>
          </div>
          <ChevronRight size={14} className="ml-auto text-slate-400 flex-shrink-0" />
        </NavLink>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(isActive ? 'nav-item-active' : 'nav-item')
            }
          >
            <Icon size={16} strokeWidth={2} className="flex-shrink-0" />
            <span className="text-[13px]">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Demo reset */}
      <div className="px-3 py-3 border-t border-slate-100">
        <button
          onClick={signOut}
          className="mb-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
        <button
          onClick={resetDemoData}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <RotateCcw size={13} />
          Reset Demo Data
        </button>
      </div>
    </aside>
  );
}
