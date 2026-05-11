import { Bell, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMe, useAuth } from '@/lib/auth/AuthProvider';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
}

export function TopBar({ onOpenPalette, onOpenMobileNav }: TopBarProps) {
  const { data } = useMe();
  const { logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'light',
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-bg/70 px-4 backdrop-blur-md md:h-16 md:gap-3 md:px-6 lg:px-10">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="grid size-10 shrink-0 place-items-center rounded-pill border border-border/70 bg-card/60 text-muted-fg transition-colors hover:bg-card hover:text-fg md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      {/* Desktop search bar (full width up to max-w-md) */}
      <button
        type="button"
        onClick={onOpenPalette}
        className={cn(
          'group ml-auto hidden h-10 w-full max-w-md items-center gap-3 rounded-pill border border-border/70 bg-card/60 px-4 text-sm text-muted-fg transition-all md:flex',
          'hover:border-accent/40 hover:bg-card hover:text-fg focus-visible:border-accent/60',
        )}
      >
        <Search className="size-4 transition-colors group-hover:text-accent" />
        <span className="truncate">Search bookings, clients, invoices…</span>
        <kbd className="ml-auto rounded-input border border-border/70 bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted-fg">
          ⌘ K
        </kbd>
      </button>

      {/* Mobile search button (icon-only) */}
      <button
        type="button"
        onClick={onOpenPalette}
        className="ml-auto grid size-10 shrink-0 place-items-center rounded-pill border border-border/70 bg-card/60 text-muted-fg transition-colors hover:bg-card hover:text-fg md:hidden"
        aria-label="Search"
      >
        <Search className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        className="grid size-10 shrink-0 place-items-center rounded-pill border border-border/70 bg-card/60 text-muted-fg transition-colors hover:bg-card hover:text-fg"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <button
        type="button"
        className="relative grid size-10 shrink-0 place-items-center rounded-pill border border-border/70 bg-card/60 text-muted-fg transition-colors hover:bg-card hover:text-fg"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        <span className="absolute right-2.5 top-2.5 size-1.5 rounded-pill bg-accent" />
      </button>

      {/* Avatar + dropdown */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-pill border border-border/70 bg-card/60 py-1 pl-1 pr-1 transition-colors hover:bg-card md:pr-3.5"
        >
          <div
            className="grid size-8 place-items-center rounded-pill font-display text-sm font-semibold text-white"
            style={{
              background:
                'linear-gradient(135deg, rgb(var(--aurora-2)) 0%, rgb(var(--aurora-1)) 100%)',
            }}
          >
            {(data.user.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium md:inline">{data.user.full_name}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 min-w-48 overflow-hidden rounded-card border border-border/70 bg-card shadow-elevated">
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-sm font-medium text-fg">{data.user.full_name}</p>
              <p className="truncate text-xs text-muted-fg">{data.user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); logout(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-muted-fg transition-colors hover:bg-bg hover:text-danger"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
