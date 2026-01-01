import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  KeyRound,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onLogout?: () => void;
}

const navItems = [
  {
    title: 'แดชบอร์ด',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'ที่พัก',
    href: '/properties',
    icon: Building2,
  },
  {
    title: 'ห้องพัก',
    href: '/rooms',
    icon: BedDouble,
  },
  {
    title: 'การจอง',
    href: '/bookings',
    icon: CalendarDays,
  },
  {
    title: 'รหัสเข้าห้อง',
    href: '/access-codes',
    icon: KeyRound,
  },
];

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">StayLock</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t p-4">
          <Link
            to="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              location.pathname === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            ตั้งค่า
          </Link>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </aside>
  );
}
