import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  Info,
  MapPin,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AuroraHero } from '@/components/motion/AuroraHero';
import { GlassCard } from '@/components/motion/GlassCard';
import { NumberTicker } from '@/components/motion/NumberTicker';
import { PageContainer } from '@/components/layout/PageContainer';
import { useDashboardOverview, useDashboardToday } from './hooks';
import { formatIndianPhone } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { AttentionItem, TodayShoot, WeekDay } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a backend-formatted INR string back to a float. "1,25,000.00" → 125000 */
function parseFormattedINR(s: string): number {
  return parseFloat(s.replace(/,/g, '')) || 0;
}

/** "09:30:00" → "9:30 AM" */
function formatTime(t: string | null | undefined): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonKpi() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-5">
      <div className="h-3 w-20 animate-pulse rounded bg-border/40" />
      <div className="mt-3 h-8 w-32 animate-pulse rounded bg-border/50" />
      <div className="mt-1.5 h-3 w-16 animate-pulse rounded bg-border/30" />
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  format,
  isEstimated,
  sub,
}: {
  label: string;
  value: number;
  format: 'INR' | 'number';
  isEstimated?: boolean;
  sub?: string;
}) {
  return (
    <GlassCard className="flex flex-col gap-1 p-5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-fg/60">{label}</span>
        {isEstimated && (
          <span className="rounded-pill border border-border bg-bg/60 px-1.5 py-px text-[9px] uppercase tracking-wide text-muted-fg/60">
            Est
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold tabular-nums text-fg">
        <NumberTicker value={value} format={format} duration={1.2} />
      </p>
      {sub && <p className="text-xs text-muted-fg">{sub}</p>}
    </GlassCard>
  );
}

// ─── Attention item ───────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { card: string; icon: string; IconComponent: typeof AlertCircle }> = {
  red: {
    card: 'border-red-200/70 bg-red-50/50 dark:border-red-900/40 dark:bg-red-900/10',
    icon: 'text-red-600 dark:text-red-400',
    IconComponent: AlertCircle,
  },
  amber: {
    card: 'border-amber-200/70 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-900/10',
    icon: 'text-amber-600 dark:text-amber-400',
    IconComponent: AlertTriangle,
  },
  blue: {
    card: 'border-accent/30 bg-accent/5',
    icon: 'text-accent',
    IconComponent: Info,
  },
};

function AttentionCard({ item, onNavigate }: { item: AttentionItem; onNavigate: (url: string) => void }) {
  const s = SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.blue;
  const Icon = s.IconComponent;
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.action_url)}
      className={cn(
        'group flex w-full items-start gap-3 rounded-card border px-4 py-3 text-left transition-opacity hover:opacity-80',
        s.card,
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', s.icon)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-fg">{item.subtitle}</p>
      </div>
      <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-fg/40 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

// ─── Week strip ───────────────────────────────────────────────────────────────

function WeekDayChip({ day, onNavigate }: { day: WeekDay; onNavigate: () => void }) {
  return (
    <button
      type="button"
      onClick={day.shoot_count > 0 ? onNavigate : undefined}
      className={cn(
        'flex flex-col items-center gap-1 rounded-card border py-3 text-center transition-colors',
        day.is_today
          ? 'border-accent/50 bg-accent/8'
          : 'border-border/50 bg-card/50 hover:border-border hover:bg-card',
        day.shoot_count === 0 && !day.is_today && 'cursor-default',
      )}
    >
      <span
        className={cn(
          'text-[11px] font-medium uppercase tracking-wide',
          day.is_today ? 'text-accent' : 'text-muted-fg/60',
        )}
      >
        {day.day_label}
      </span>
      <span
        className={cn(
          'font-display text-base font-semibold tabular-nums',
          day.is_today ? 'text-accent' : 'text-fg',
        )}
      >
        {day.date_label}
      </span>
      {day.shoot_count > 0 ? (
        <span className="rounded-pill bg-accent px-1.5 py-px text-[10px] font-semibold text-white">
          {day.shoot_count}
        </span>
      ) : (
        <span className="h-4" />
      )}
    </button>
  );
}

// ─── Today shoot card ──────────────────────────────────────────────────────────

const EVENT_LABEL: Record<string, string> = {
  wedding: 'Wedding',
  pre_wedding: 'Pre-wedding',
  birthday: 'Birthday',
  corporate: 'Corporate',
  portrait: 'Portrait',
  maternity: 'Maternity',
  baby_shower: 'Baby shower',
  event_coverage: 'Event',
};

function ShootCard({ shoot }: { shoot: TodayShoot }) {
  const timeRange =
    shoot.shoot_start_time
      ? shoot.shoot_end_time
        ? `${formatTime(shoot.shoot_start_time)} – ${formatTime(shoot.shoot_end_time)}`
        : formatTime(shoot.shoot_start_time)
      : null;

  return (
    <div className="rounded-card border border-border bg-card/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-fg">{shoot.title}</p>
          <p className="mt-0.5 text-sm text-muted-fg">
            {EVENT_LABEL[shoot.event_type] ?? shoot.event_type} · {shoot.client_name}
          </p>
        </div>
        {shoot.client_phone && (
          <a
            href={`tel:${shoot.client_phone}`}
            className="flex items-center gap-1.5 rounded-pill border border-border/70 bg-bg px-3 py-1.5 text-xs font-medium text-muted-fg transition-colors hover:border-border hover:text-fg"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="size-3" />
            {formatIndianPhone(shoot.client_phone)}
          </a>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {shoot.call_time && (
          <div className="flex items-center gap-2 text-muted-fg">
            <Clock className="size-3.5 shrink-0 text-muted-fg/50" />
            <span>Call time: <strong className="text-fg">{formatTime(shoot.call_time)}</strong></span>
          </div>
        )}
        {timeRange && (
          <div className="flex items-center gap-2 text-muted-fg">
            <Clock className="size-3.5 shrink-0 text-muted-fg/50" />
            <span>{timeRange}</span>
          </div>
        )}
        {shoot.venue_name && (
          <div className="flex items-center gap-2 text-muted-fg sm:col-span-2">
            <MapPin className="size-3.5 shrink-0 text-muted-fg/50" />
            {shoot.venue_map_link ? (
              <a
                href={shoot.venue_map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {shoot.venue_name}
                {shoot.venue_address ? ` · ${shoot.venue_address}` : ''}
              </a>
            ) : (
              <span>{shoot.venue_name}{shoot.venue_address ? ` · ${shoot.venue_address}` : ''}</span>
            )}
          </div>
        )}
        {shoot.assigned_team.length > 0 && (
          <div className="flex items-center gap-2 text-muted-fg sm:col-span-2">
            <Users className="size-3.5 shrink-0 text-muted-fg/50" />
            <span>{shoot.assigned_team.map((m) => m.display_name).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: today } = useDashboardToday();

  const greeting = overview?.greeting;
  const kpis = overview?.this_month;
  const attentionItems = overview?.attention_items ?? [];
  const weekDays = overview?.upcoming_week?.days ?? [];
  const shoots = today?.shoots ?? [];

  const greetingLabel =
    greeting?.time_of_day === 'morning'
      ? 'Good morning'
      : greeting?.time_of_day === 'afternoon'
      ? 'Good afternoon'
      : 'Good evening';

  const handleAttentionNav = (url: string) => {
    if (url.startsWith('/')) navigate(url);
  };

  return (
    <div>
      {/* ── Aurora hero greeting — one per route, hero zone only ── */}
      <AuroraHero>
        <div className="px-4 pb-8 pt-8 sm:px-6 md:px-8 lg:px-10 2xl:px-12">
          <p className="text-sm font-medium text-muted-fg">{greetingLabel}</p>
          <h1 className="font-display text-3xl font-bold text-fg">
            {greeting?.name ?? 'Studio'}
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            {greeting?.date ?? ''}
            {today?.shoot_count != null && today.shoot_count > 0
              ? ` · ${today.shoot_count} shoot${today.shoot_count !== 1 ? 's' : ''} today`
              : today?.has_shoots === false
              ? ' · No shoots today'
              : ''}
          </p>
        </div>
      </AuroraHero>

      <PageContainer>
        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {overviewLoading || !kpis ? (
            <>
              <SkeletonKpi /><SkeletonKpi /><SkeletonKpi /><SkeletonKpi />
            </>
          ) : (
            <>
              <KpiCard
                label="Collected"
                value={parseFormattedINR(kpis.revenue_collected)}
                format="INR"
                isEstimated={kpis.is_estimated}
                sub="this month"
              />
              <KpiCard
                label="Pending"
                value={parseFormattedINR(kpis.revenue_pending)}
                format="INR"
                isEstimated={kpis.is_estimated}
                sub="outstanding"
              />
              <KpiCard
                label="Bookings"
                value={kpis.total_bookings}
                format="number"
                sub="active"
              />
              <KpiCard
                label="New leads"
                value={kpis.new_leads}
                format="number"
                sub="this month"
              />
            </>
          )}
        </div>

        {/* ── Attention items ── */}
        {attentionItems.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-fg/60">
              <AlertCircle className="size-3.5" />
              Needs attention
            </h2>
            <div className="space-y-2">
              {attentionItems.map((item) => (
                <AttentionCard key={item.type} item={item} onNavigate={handleAttentionNav} />
              ))}
            </div>
          </section>
        )}

        {/* ── This week ── */}
        {weekDays.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-fg/60">
              <Calendar className="size-3.5" />
              This week
            </h2>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => (
                <WeekDayChip
                  key={day.date}
                  day={day}
                  onNavigate={() => navigate(ROUTES.bookings)}
                />
              ))}
            </div>
            {/* Day bookings preview — today's mini list */}
            {weekDays.filter((d) => d.is_today && d.bookings.length > 0).map((d) => (
              <div key={d.date} className="mt-3 space-y-1">
                {d.bookings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => navigate(ROUTES.bookingDetail(b.id))}
                    className="flex w-full items-center gap-3 rounded-input px-3 py-2 text-sm transition-colors hover:bg-bg/60"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="flex-1 truncate text-left font-medium text-fg">{b.title}</span>
                    <span className="text-xs text-muted-fg">{b.client_name}</span>
                  </button>
                ))}
              </div>
            ))}
          </section>
        )}

        {/* ── Today's shoots ── */}
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-fg/60">
            <TrendingUp className="size-3.5" />
            Today's shoots
          </h2>
          {shoots.length > 0 ? (
            <div className="space-y-3">
              {shoots.map((s) => <ShootCard key={s.id} shoot={s} />)}
            </div>
          ) : (
            <div className="rounded-card border border-border/50 bg-card/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-fg">
                No shoots today — take a breath, review leads, or catch up on invoices.
              </p>
            </div>
          )}
        </section>
      </PageContainer>
    </div>
  );
}
