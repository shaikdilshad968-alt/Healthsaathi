import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, MessageSquare, FileText, Salad } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { to: '/',           label: 'Home',     icon: LayoutDashboard },
  { to: '/reports',    label: 'Reports',  icon: FileText },
  { to: '/chat',       label: 'Chat',     icon: MessageSquare },
  { to: '/nutrition',  label: 'Nutrition',icon: Salad },
  { to: '/profile',    label: 'Profile',  icon: User },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex lg:hidden">
      {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn('flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-teal-600' : 'text-slate-400')
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn('p-1.5 rounded-lg transition-colors', isActive && 'bg-teal-50')}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
