import { NavLink } from 'react-router-dom';
import {
  Calendar,
  ChevronsUpDown,
  FileSignature,
  FileText,
  Images,
  LayoutDashboard,
  Receipt,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useMe } from '@/lib/auth/AuthProvider';

type NavEntry = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
  count?: number;
};

const PRIMARY_NAV: NavEntry[] = [
  { to: ROUTES.leads, label: 'Leads', icon: UserPlus, enabled: true, count: 0 },
  { to: ROUTES.clients, label: 'Clients', icon: Users, enabled: true },
  { to: ROUTES.proposals, label: 'Proposals', icon: FileText, enabled: true },
  { to: ROUTES.contracts, label: 'Contracts', icon: FileSignature, enabled: true },
  { to: ROUTES.bookings, label: 'Bookings', icon: Calendar, enabled: true },
];

const FINANCE_NAV: NavEntry[] = [
  { to: ROUTES.invoices, label: 'Invoices', icon: Receipt, enabled: true },
  { to: ROUTES.payments, label: 'Payments', icon: Wallet, enabled: true },
];

const DELIVERY_NAV: NavEntry[] = [
  { to: ROUTES.gallery, label: 'Gallery', icon: Images, enabled: true },
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard, enabled: true },
];

interface NavTreeProps {
  /** Called after a real navigation happens — used by mobile drawer to close itself. */
  onNavigate?: () => void;
  /** Larger touch targets and visible chevrons on mobile drawers. */
  variant?: 'desktop' | 'mobile';
}

function NavSection({
  title,
  items,
  onNavigate,
  variant,
}: {
  title: string;
  items: NavEntry[];
  onNavigate?: () => void;
  variant: 'desktop' | 'mobile';
}) {
  const rowHeight = variant === 'mobile' ? 'min-h-11 py-2.5' : 'py-2';
  const fontSize = variant === 'mobile' ? 'text-[15px]' : 'text-sm';

  return (
    <div className="space-y-0.5">
      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-fg/60">
        {title}
      </p>
      {items.map(({ to, label, icon: Icon, enabled, count }) =>
        enabled ? (
          <NavLink
            key={label}
            to={to}
            end={to === ROUTES.leads}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-2.5 rounded-input px-3 transition-all duration-150',
                rowHeight,
                fontSize,
                isActive
                  ? 'bg-accent/8 text-fg font-medium'
                  : 'text-muted-fg hover:bg-card hover:text-fg',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon className={cn('size-4 shrink-0', isActive && 'text-accent')} />
                <span className="truncate">{label}</span>
                {typeof count === 'number' && count > 0 && (
                  <span className="ml-auto rounded-pill bg-accent/10 px-1.5 text-xs font-medium text-accent">
                    {count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ) : (
          <div
            key={label}
            title="Coming next sprint"
            className={cn(
              'flex cursor-not-allowed items-center gap-2.5 rounded-input px-3 text-muted-fg/45',
              rowHeight,
              fontSize,
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
            <span className="ml-auto rounded-pill border border-border bg-bg px-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-fg/60">
              Soon
            </span>
          </div>
        ),
      )}
    </div>
  );
}

/**
 * NavTree — shared nav contents used by both desktop sidebar and mobile drawer.
 * Variant controls touch-target sizing.
 */
export function NavTree({ onNavigate, variant = 'desktop' }: NavTreeProps) {
  const { data } = useMe();

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        className={cn(
          'group mx-1 mb-6 flex items-center gap-2.5 rounded-card border border-border/60 bg-card px-3 text-left shadow-card transition-shadow hover:shadow-elevated',
          variant === 'mobile' ? 'min-h-12 py-2.5' : 'py-2.5',
        )}
        onClick={onNavigate}
      >
        <div
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-card text-white shadow-card"
          style={{
            background:
              'linear-gradient(135deg, rgb(var(--aurora-2)) 0%, rgb(var(--aurora-1)) 100%)',
          }}
        >
          <span className="font-display text-sm font-bold">
            {data.studio?.name?.charAt(0) ?? 'S'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold">
            {data.studio?.name ?? 'StudioDesk'}
          </p>
          <p className="truncate text-[11px] text-muted-fg">{data.user.full_name} · Owner</p>
        </div>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-fg/60" />
      </button>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <NavSection title="Pipeline" items={PRIMARY_NAV} onNavigate={onNavigate} variant={variant} />
        <NavSection title="Finance" items={FINANCE_NAV} onNavigate={onNavigate} variant={variant} />
        <NavSection title="Delivery" items={DELIVERY_NAV} onNavigate={onNavigate} variant={variant} />
      </nav>

      <div className="mt-4 rounded-card border border-border/60 bg-card/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-fg">Storage</span>
          <span className="font-medium tabular-nums">
            {data.studio?.storage_used_gb ?? 0} / {data.studio?.storage_limit_gb ?? 0} GB
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-pill bg-border">
          <div
            className="h-full rounded-pill bg-accent"
            style={{
              width: `${Math.min(
                100,
                ((data.studio?.storage_used_gb ?? 0) / (data.studio?.storage_limit_gb ?? 1)) * 100,
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
