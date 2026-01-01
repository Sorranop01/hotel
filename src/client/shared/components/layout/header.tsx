import { Bell, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';

interface HeaderProps {
  title?: string;
  user?: {
    displayName: string;
    email: string;
    photoURL?: string;
  };
  onMenuClick?: () => void;
}

export function Header({ title, user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            3
          </span>
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">
              {user?.displayName || 'ผู้ใช้'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
