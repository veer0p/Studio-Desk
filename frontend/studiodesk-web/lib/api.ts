import { Step1Data, Step2Data, Step3Data, Step4Data } from "./validations/onboarding";

type ApiError = Error & {
  status?: number;
  code?: string;
};

type ApiErrorBody = {
  error?: string;
  code?: string;
};

type ExistingPackage = {
  name?: string;
  event_type?: string;
};

type JsonObject = Record<string, unknown>;

type ClientWriteInput = {
  full_name?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  notes?: string;
  tags?: string[];
};

type FaceLabelInput = string | { label?: string; name?: string };

type ApiEnvelope<T> = {
  data?: T;
  error?: string | null;
  code?: string;
  meta?: {
    count?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
};

export type PaginationMeta = NonNullable<ApiEnvelope<never>["meta"]>;

export type BookingTeamMember = {
  name: string;
  role: string;
  avatar: string | null;
};

export type BookingSummary = {
  id: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  eventType: string;
  eventName: string;
  date: string;
  daysUntil?: string;
  venue: string;
  city: string | null;
  stage: string;
  amount: number;
  balanceDue: number;
  notes: string;
  packageInfo: { name: string } | null;
  team: BookingTeamMember[];
  timeline?: Array<Record<string, unknown>>;
  createdAt: string | null;
  updatedAt: string | null;
  rawStatus: string | null;
};

export type BookingListResult = {
  list: BookingSummary[];
  count: number;
};

export type ClientSummary = {
  id: string;
  name: string;
  fullName: string;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  tags: string[];
  bookingsCount: number;
  totalSpend: number;
  totalPaid: number;
  totalInvoiced: number;
  lastBookingDate: string | null;
  notes?: string;
};

export type ClientListResult = {
  list: ClientSummary[];
  meta: PaginationMeta;
};

export type ClientDetail = ClientSummary & {
  address: string | null;
  state: string | null;
  pincode: string | null;
  companyName: string | null;
  gstin: string | null;
  notes: string;
  bookings: BookingSummary[];
  communications: Array<Record<string, unknown>>;
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  documents: Array<Record<string, unknown>>;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientCity?: string;
  bookingName?: string;
  bookingId?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
  daysToDue?: number;
};

export type InvoiceListResult = {
  list: InvoiceRecord[];
  count: number;
};

export type PaymentRecord = {
  id: string;
  date: string;
  clientName: string;
  bookingName?: string;
  invoiceRef?: string;
  amount: number;
  method: string;
  reference?: string;
  recordedBy?: string;
};

export type PaymentListResult = {
  list: PaymentRecord[];
  count: number;
};

export type GallerySummary = {
  id: string;
  name: string;
  clientName: string;
  slug: string;
  eventType: string;
  shootDate: string;
  status: string;
  photoCount: number;
  videoCount: number;
  sizeGb: number;
  selectedCount: number;
  selectionQuota: number;
  uploadProgress: number;
  accessType: string;
  expiryDate?: string;
  coverUrl: string | null;
};

export type GalleryDetail = GallerySummary & {
  photos: GalleryPhoto[];
  faceClusters: FaceCluster[];
};

export type GalleryPhoto = {
  id: string;
  url: string;
  isFavorite: boolean;
  isSelected: boolean;
  size: number;
  dimensions: string;
};

export type FaceCluster = {
  id: string;
  name?: string;
  representativeUrl: string;
  photoCount: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar: string | null;
  status: "active" | "invited" | "inactive";
  joinedAt: string | null;
  skills: string[];
  totalProjects: number;
  rating?: number;
};

export type TeamListResult = {
  list: TeamMember[];
  count: number;
};

export type AnalyticsMetric = {
  label: string;
  value: number | string;
  change: number;
  trend: "up" | "down" | "neutral";
};

export type AnalyticsChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
};

export type AnalyticsOverview = {
  metrics: AnalyticsMetric[];
  revenue: AnalyticsChartData;
  bookings: AnalyticsChartData;
  clients: AnalyticsChartData;
};

export type StudioProfile = {
  id: string;
  name: string;
  tagline: string | null;
  logo: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  socials: Record<string, string>;
  isVerified: boolean;
};

export type DashboardAttentionItem = {
  type: string;
  severity: string;
  title: string;
  subtitle?: string;
  action_url?: string;
};

export type DashboardOverview = {
  greeting?: {
    name?: string;
    date?: string;
    time_of_day?: "morning" | "afternoon" | "evening";
  };
  attention_items: DashboardAttentionItem[];
  this_month: {
    revenue_collected: string;
    revenue_pending: string;
    revenue_overdue: string;
    total_bookings: number;
    new_leads: number;
    is_estimated?: boolean;
  };
  upcoming_week: {
    days: Array<{
      date: string;
      day_label: string;
      date_label: string;
      is_today: boolean;
      shoot_count: number;
      bookings: Array<{
        id: string;
        title: string;
        event_type: string;
        client_name: string;
      }>;
    }>;
  };
};

export type DashboardToday = {
  date?: string;
  shoot_count?: number;
  has_shoots?: boolean;
  shoots: Array<{
    id: string;
    clientName: string;
    eventType: string;
    time: string;
    venue: string;
    team: Array<{ name: string; avatar: string | null }>;
    status: string;
  }>;
};

export type FinanceSummary = {
  revenue: number;
  revenueGrowth: number;
  outstanding: number;
  outstandingCount: number;
  overdue: number;
  overdueCount: number;
  expenses: number;
  expensesCount: number;
  net: number;
};

type MoneyLike = string | number | null | undefined;

type BackendAssignedTeam = {
  name?: string | null;
  role?: string | null;
};

type BackendBookingRow = {
  id?: string | null;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  event_type?: string | null;
  title?: string | null;
  event_date?: string | null;
  date?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_city?: string | null;
  city?: string | null;
  status?: string | null;
  total_amount?: MoneyLike;
  amount_pending?: MoneyLike;
  notes?: string | null;
  package_name?: string | null;
  assigned_team?: BackendAssignedTeam[] | null;
  team?: BookingTeamMember[] | null;
  timeline?: Array<Record<string, unknown>>;
  created_at?: string | null;
  updated_at?: string | null;
};

type BackendBookingListPayload = {
  data: BackendBookingRow[];
  count: number;
};

type BackendClientSummary = {
  id?: string | null;
  full_name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type BackendClientDetail = BackendClientSummary & {
  address?: string | null;
  state?: string | null;
  pincode?: string | null;
  company_name?: string | null;
  gstin?: string | null;
  notes?: string | null;
  stats?: {
    total_bookings?: number;
    total_revenue?: MoneyLike;
    total_paid?: MoneyLike;
  } | null;
  bookings?: BackendBookingRow[] | null;
  communications?: Array<Record<string, unknown>> | null;
  invoices?: Array<Record<string, unknown>> | null;
  payments?: Array<Record<string, unknown>> | null;
  documents?: Array<Record<string, unknown>> | null;
};

type BackendDashboardOverview = DashboardOverview;

type BackendDashboardToday = {
  date?: string;
  shoot_count?: number;
  has_shoots?: boolean;
  shoots?: Array<{
    id?: string | null;
    client_name?: string | null;
    event_type?: string | null;
    call_time?: string | null;
    shoot_start_time?: string | null;
    venue_name?: string | null;
    venue_address?: string | null;
    assigned_team?: Array<{ name?: string | null }> | null;
  }> | null;
};

type BackendFinanceSummary = {
  revenue_collected?: MoneyLike;
  revenue_pending?: MoneyLike;
  revenue_overdue?: MoneyLike;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  pre_wedding: "Pre Wedding",
  engagement: "Engagement",
  maternity: "Maternity",
  newborn: "Newborn",
  fashion: "Fashion",
  corporate: "Corporate",
  birthday: "Birthday",
  product: "Product Shoot",
  other: "Other",
};

const STATUS_TO_STAGE: Record<string, string> = {
  new_lead: "Inquiry",
  contacted: "Inquiry",
  proposal_sent: "Proposal Sent",
  booked: "Confirmed",
  partially_paid: "Confirmed",
  paid: "Confirmed",
  shoot_completed: "In Progress",
  delivered: "Delivered",
  closed: "Delivered",
  lost: "Cancelled",
};

const STAGE_TO_STATUS: Record<string, string> = {
  Inquiry: "contacted",
  "Proposal Sent": "proposal_sent",
  Confirmed: "booked",
  "In Progress": "shoot_completed",
  Delivered: "delivered",
  Cancelled: "lost",
};

function toNumber(value: MoneyLike) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function titleCaseStatus(value?: string | null) {
  return STATUS_TO_STAGE[String(value ?? "").toLowerCase()] ?? "Inquiry";
}

function eventTypeLabel(value?: string | null) {
  if (!value) return "Other";
  const normalized = String(value).trim();
  return EVENT_TYPE_LABELS[normalized.toLowerCase()] ?? normalized;
}

function shortDate(value?: string | null) {
  if (!value) return "TBD";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeLabel(value?: string | null) {
  if (!value) return "TBD";
  const candidate = String(value);
  if (/^\d{2}:\d{2}/.test(candidate)) {
    const [hour, minute] = candidate.slice(0, 5).split(":").map(Number);
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  const date = new Date(candidate);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return candidate;
}

function relativeDateLabel(value?: string | null) {
  if (!value) return undefined;
  const target = new Date(String(value));
  if (Number.isNaN(target.getTime())) return undefined;
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return "Yesterday";
  return `${Math.abs(diffDays)} days ago`;
}

function normalizeBooking(row: BackendBookingRow): BookingSummary {
  return {
    id: String(row.id ?? ""),
    clientName: String(row.client_name ?? "Unknown Client"),
    clientPhone: row.client_phone ?? null,
    clientEmail: row.client_email ?? null,
    eventType: eventTypeLabel(row.event_type),
    eventName: String(row.title ?? row.event_type ?? "Untitled Booking"),
    date: shortDate(row.event_date ?? row.date),
    daysUntil: relativeDateLabel(row.event_date ?? row.date),
    venue: String(row.venue_name ?? row.venue_address ?? "TBD"),
    city: row.venue_city ?? row.city ?? null,
    stage: titleCaseStatus(row.status),
    amount: toNumber(row.total_amount),
    balanceDue: toNumber(row.amount_pending),
    notes: row.notes ?? "",
    packageInfo: row.package_name ? { name: row.package_name } : null,
    team: Array.isArray(row.assigned_team)
      ? row.assigned_team.map((member) => ({
          name: String(member.name ?? "Team"),
          role: String(member.role ?? "assistant"),
          avatar: null,
        }))
      : Array.isArray(row.team)
        ? row.team
        : [],
    timeline: row.timeline,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    rawStatus: row.status ?? null,
  };
}

function normalizeClientSummary(row: BackendClientSummary): ClientSummary {
  return {
    id: String(row.id ?? ""),
    name: String(row.full_name ?? "Unknown Client"),
    fullName: String(row.full_name ?? "Unknown Client"),
    city: row.city ?? null,
    phone: row.phone ?? null,
    whatsapp: row.whatsapp ?? null,
    email: row.email ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    bookingsCount: 0,
    totalSpend: 0,
    totalPaid: 0,
    totalInvoiced: 0,
    lastBookingDate: null,
  };
}

function normalizeClientDetail(row: BackendClientDetail): ClientDetail {
  const bookings = Array.isArray(row.bookings)
    ? row.bookings.map((booking) =>
        normalizeBooking({
          ...booking,
          client_name: row.full_name ?? undefined,
        })
      )
    : [];

  const stats = row.stats ?? {};
  const totalInvoiced = toNumber(stats.total_revenue);
  const totalPaid = toNumber(stats.total_paid);
  const latestBooking = bookings.map((booking) => booking.date).find(Boolean) ?? null;

  return {
    ...normalizeClientSummary(row),
    address: row.address ?? null,
    state: row.state ?? null,
    pincode: row.pincode ?? null,
    companyName: row.company_name ?? null,
    gstin: row.gstin ?? null,
    notes: row.notes ?? "",
    bookings,
    bookingsCount: toNumber(stats.total_bookings ?? bookings.length),
    totalSpend: totalInvoiced,
    totalInvoiced,
    totalPaid,
    lastBookingDate: latestBooking,
    communications: Array.isArray(row.communications) ? row.communications : [],
    invoices: Array.isArray(row.invoices) ? (row.invoices as any) : [],
    payments: Array.isArray(row.payments) ? (row.payments as any) : [],
    documents: Array.isArray(row.documents) ? row.documents : [],
  };
}

function normalizeTodayDashboard(row: BackendDashboardToday): DashboardToday {
  const shoots = Array.isArray(row.shoots)
    ? row.shoots.map((shoot) => ({
        id: String(shoot.id ?? ""),
        clientName: String(shoot.client_name ?? "Unknown Client"),
        eventType: eventTypeLabel(shoot.event_type),
        time: timeLabel(shoot.call_time ?? shoot.shoot_start_time),
        venue: String(shoot.venue_name ?? shoot.venue_address ?? "Venue TBA"),
        team: Array.isArray(shoot.assigned_team)
          ? shoot.assigned_team.map((member) => ({
              name: String(member.name ?? "Team"),
              avatar: null,
            }))
          : [],
        status: "In Progress",
      }))
    : [];

  return {
    date: row.date,
    shoot_count: row.shoot_count,
    has_shoots: row.has_shoots,
    shoots,
  };
}

function normalizeFinanceSummary(row: BackendFinanceSummary): FinanceSummary {
  const revenue = toNumber(row.revenue_collected);
  const outstanding = toNumber(row.revenue_pending);
  const overdue = toNumber(row.revenue_overdue);
  return {
    revenue,
    revenueGrowth: 0,
    outstanding,
    outstandingCount: 0,
    overdue,
    overdueCount: 0,
    expenses: 0,
    expensesCount: 0,
    net: revenue,
  };
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== "")
  ) as Partial<T>;
}

async function readJsonSafe<T>(res: globalThis.Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function parseOrThrow<T>(res: globalThis.Response, fallbackMessage: string): Promise<T> {
  const payload = await readJsonSafe<T & ApiErrorBody>(res);
  if (!res.ok) {
    const error = new Error(payload?.error || fallbackMessage) as ApiError;
    error.status = res.status;
    error.code = payload?.code;
    throw error;
  }
  return payload as T;
}

async function fetchApiEnvelope<T>(url: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(url);
  const payload = await readJsonSafe<ApiEnvelope<T>>(res);
  if (!res.ok) {
    const error = new Error(payload?.error || "An error occurred while fetching the data.") as ApiError;
    error.status = res.status;
    error.code = payload?.code ?? undefined;
    throw error;
  }
  if (!payload) {
    throw new Error("Empty API response");
  }
  return payload;
}

async function fetchApiData<T>(url: string): Promise<T> {
  const payload = await fetchApiEnvelope<T>(url);
  if (payload.data === undefined) {
    throw new Error("API response missing data");
  }
  return payload.data;
}

async function fetchPaginatedApiData<T>(url: string): Promise<{ data: T[]; meta: PaginationMeta }> {
  const payload = await fetchApiEnvelope<T[]>(url);
  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta ?? { count: 0, page: 0, pageSize: 0, totalPages: 0 },
  };
}

async function completeOnboardingStep(step: number, data: Record<string, unknown> = {}) {
  const res = await fetch(`/api/v1/studio/onboarding/${step}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  return parseOrThrow(res, `Failed to complete onboarding step ${step}`);
}

function mapTeamRole(role: Step3Data["members"][number]["role"]) {
  switch (role) {
    case "Photographer":
      return "photographer";
    case "Videographer":
      return "videographer";
    case "Editor":
      return "editor";
    case "Assistant":
    case "Drone Operator":
    case "Admin":
    default:
      return "assistant";
  }
}

function mapPackageEventType(eventType: Step4Data["packages"][number]["eventType"]) {
  switch (eventType) {
    case "Wedding":
      return "wedding";
    case "Engagement":
      return "engagement";
    case "Corporate":
      return "corporate";
    case "Birthday":
      return "birthday";
    case "Product Shoot":
      return "product";
    case "Other":
    default:
      return "other";
  }
}

function parseDeliverables(inclusions?: string) {
  if (!inclusions) return [];
  return inclusions
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function submitStudioProfile(data: Step1Data, ownerPhone?: string) {
  if (ownerPhone) {
    await completeOnboardingStep(1, {
      name: data.name,
      phone: ownerPhone,
      city: data.city,
      state: data.state,
    });
  }

  const payload = compactObject({
    name: ownerPhone ? undefined : data.name,
    city: ownerPhone ? undefined : data.city,
    state: ownerPhone ? undefined : data.state,
    tagline: data.tagline || undefined,
  });

  if (Object.keys(payload).length === 0) return null;

  const res = await fetch("/api/v1/studio/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "Failed to submit studio profile");
}

export async function submitOwnerProfile(data: Step2Data) {
  const payload = compactObject({
    full_name: data.fullName,
    phone: data.phone,
    whatsapp: data.whatsapp || undefined,
    preferred_language: data.language,
    designation: data.designation || undefined,
  });

  const res = await fetch("/api/v1/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "Failed to submit owner details");
}

export async function submitTeamMembers(data: Step3Data) {
  const validMembers = data.members.filter((member) => member.name && member.name.trim() !== "");
  const inviteableMembers = validMembers.filter((member) => member.email && member.email.trim() !== "");

  if (inviteableMembers.length === 0) {
    return {
      invited: 0,
      skipped: validMembers.length,
    };
  }

  let invited = 0;

  for (const member of inviteableMembers) {
    const res = await fetch("/api/v1/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: member.email,
        role: mapTeamRole(member.role),
      }),
    });

    if (!res.ok && res.status !== 409) {
      await parseOrThrow(res, "Failed to submit team members");
    } else {
      await readJsonSafe(res);
      invited += 1;
    }
  }

  return {
    invited,
    skipped: validMembers.length - inviteableMembers.length,
  };
}

export async function submitPackages(data: Step4Data) {
  const packages = data.packages.filter((item) => item.name && item.name.trim() !== "");
  if (packages.length === 0) return null;

  const existingRes = await fetch("/api/v1/packages", {
    cache: "no-store",
  });
  const existingPayload = await parseOrThrow<{ data?: ExistingPackage[] }>(existingRes, "Failed to load packages");
  const existingPackages = Array.isArray(existingPayload?.data) ? existingPayload.data : [];

  const created: Array<{ name: string; event_type: string }> = [];
  const skipped: Array<{ name: string; event_type: string }> = [];

  for (const pkg of packages) {
    const event_type = mapPackageEventType(pkg.eventType);
    const duplicate = existingPackages.some(
      (existing) => existing.name === pkg.name && existing.event_type === event_type
    );

    if (duplicate) {
      skipped.push({ name: pkg.name, event_type });
      continue;
    }

    const res = await fetch("/api/v1/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: pkg.name,
        event_type,
        description: pkg.duration ? `Coverage duration: ${pkg.duration} hours` : undefined,
        base_price: String(pkg.price),
        deliverables: parseDeliverables(pkg.inclusions),
        turnaround_days: 30,
      }),
    });

    await parseOrThrow(res, "Failed to submit packages");
    created.push({ name: pkg.name, event_type });
  }

  return { created, skipped };
}

export async function completeOnboardingFlag() {
  await completeOnboardingStep(2);
  await completeOnboardingStep(3);
  await completeOnboardingStep(4);
  return completeOnboardingStep(5);
}

export async function fetchBookingsList(url: string): Promise<BookingListResult> {
  const payload = await fetchApiData<BackendBookingListPayload>(url);
  return {
    list: Array.isArray(payload.data) ? payload.data.map(normalizeBooking) : [],
    count: Number(payload.count ?? 0),
  };
}

export async function fetchBookingDetail(url: string): Promise<BookingSummary> {
  return normalizeBooking(await fetchApiData<BackendBookingRow>(url));
}

export async function fetchClientsList(url: string): Promise<ClientListResult> {
  const payload = await fetchPaginatedApiData<BackendClientSummary>(url);
  return {
    list: payload.data.map(normalizeClientSummary),
    meta: payload.meta,
  };
}

export async function fetchClientDetail(url: string): Promise<ClientDetail> {
  return normalizeClientDetail(await fetchApiData<BackendClientDetail>(url));
}

export async function fetchDashboardOverview(url: string): Promise<DashboardOverview> {
  return await fetchApiData<BackendDashboardOverview>(url);
}

export async function fetchDashboardToday(url: string): Promise<DashboardToday> {
  return normalizeTodayDashboard(await fetchApiData<BackendDashboardToday>(url));
}

export async function fetchFinanceSummary(url: string): Promise<FinanceSummary> {
  return normalizeFinanceSummary(await fetchApiData<BackendFinanceSummary>(url));
}

export async function fetchInvoicesList(url: string): Promise<InvoiceListResult> {
  // Stub for now following plan - will map to backend when verified
  return {
    list: [
      {
        id: "INV-2026-001",
        invoiceNumber: "INV-2026-001",
        clientName: "Rohan & Priya",
        clientCity: "Mumbai",
        bookingName: "Wedding Coverage",
        bookingId: "b-001",
        issueDate: "12 Oct 2025",
        dueDate: "27 Oct 2025",
        amount: 240000,
        paidAmount: 100000,
        balance: 140000,
        status: "Partial",
        daysToDue: 5
      },
      {
        id: "INV-2026-002",
        invoiceNumber: "INV-2026-002",
        clientName: "Neha Sharma",
        clientCity: "Delhi",
        bookingName: "Pre-wedding Shoot",
        bookingId: "b-002",
        issueDate: "15 Oct 2025",
        dueDate: "16 Oct 2025",
        amount: 45000,
        paidAmount: 0,
        balance: 45000,
        status: "Overdue",
        daysToDue: -2
      }
    ],
    count: 2
  };
}

export async function fetchPaymentsList(url: string): Promise<PaymentListResult> {
  return {
    list: [
      {
        id: "pay-1",
        date: "12 Oct 2025",
        clientName: "Rohan & Priya",
        bookingName: "Wedding Coverage",
        invoiceRef: "INV-2026-001",
        amount: 100000,
        method: "Bank Transfer",
        reference: "IMPS1234901",
        recordedBy: "Ankit (Admin)"
      }
    ],
    count: 1
  };
}

export async function fetchExpensesList(url: string) {
  return {
    list: [],
    count: 0
  };
}

// Gallery fetchers
export async function fetchGalleriesList(url: string): Promise<GallerySummary[]> {
  // Stub for now following plan
  return [
    {
      id: "gal-1",
      name: "Wedding Highlights",
      clientName: "Rohan & Priya",
      slug: "rohan-priya-wedding",
      eventType: "Wedding",
      shootDate: "12 Oct 2025",
      status: "Selection Pending",
      photoCount: 450,
      videoCount: 2,
      sizeGb: 12.4,
      selectedCount: 45,
      selectionQuota: 100,
      uploadProgress: 100,
      accessType: "PIN Protected",
      expiryDate: "12 Nov 2025",
      coverUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "gal-2",
      name: "Engagement Shoot",
      clientName: "Neha Sharma",
      slug: "neha-sharma-engagement",
      eventType: "Pre-Wedding",
      shootDate: "15 Oct 2025",
      status: "Uploading",
      photoCount: 120,
      videoCount: 0,
      sizeGb: 3.2,
      selectedCount: 0,
      selectionQuota: 20,
      uploadProgress: 45,
      accessType: "PIN Protected",
      coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop"
    }
  ];
}

export async function fetchGalleryDetail(url: string): Promise<GalleryDetail> {
  // Extract ID from URL for real implementation
  return {
    id: "gal-1",
    name: "Wedding Highlights",
    clientName: "Rohan & Priya",
    slug: "rohan-priya-wedding",
    eventType: "Wedding",
    shootDate: "12 Oct 2025",
    status: "Selection Pending",
    photoCount: 450,
    videoCount: 2,
    sizeGb: 12.4,
    selectedCount: 45,
    selectionQuota: 100,
    uploadProgress: 100,
    accessType: "PIN Protected",
    expiryDate: "12 Nov 2025",
    coverUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
    photos: [],
    faceClusters: []
  };
}

// Bookings Mutations
export async function createBooking(data: JsonObject): Promise<BookingSummary> {
  const res = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  const payload = await readJsonSafe<ApiEnvelope<BackendBookingRow>>(res);
  if (!payload?.data) throw new Error("Booking response missing data");
  return normalizeBooking(payload.data);
}

export async function updateBookingStage(id: string, stage: string): Promise<BookingSummary> {
  const status = STAGE_TO_STATUS[stage] ?? "contacted";
  const res = await fetch(`/api/v1/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update stage");
  const payload = await readJsonSafe<ApiEnvelope<BackendBookingRow>>(res);
  if (!payload?.data) throw new Error("Booking response missing data");
  return normalizeBooking(payload.data);
}

export async function updateBookingNotes(id: string, noteText: string): Promise<BookingSummary> {
  const res = await fetch(`/api/v1/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: noteText || null }),
  });
  if (!res.ok) throw new Error("Failed to save note");
  const payload = await readJsonSafe<ApiEnvelope<BackendBookingRow>>(res);
  if (!payload?.data) throw new Error("Booking response missing data");
  return normalizeBooking(payload.data);
}

// Clients Mutations
export async function createClient(data: ClientWriteInput): Promise<ClientSummary> {
  const payload = compactObject({
    full_name: data.full_name ?? data.fullName ?? data.name,
    phone: data.phone,
    whatsapp: data.whatsapp || undefined,
    email: data.email || undefined,
    city: data.city || undefined,
    notes: data.notes || undefined,
    tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : undefined,
  });
  const res = await fetch("/api/v1/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create client");
  const response = await readJsonSafe<ApiEnvelope<BackendClientSummary>>(res);
  if (!response?.data) throw new Error("Client response missing data");
  return normalizeClientSummary(response.data);
}

export async function updateClient(id: string, data: ClientWriteInput): Promise<ClientSummary> {
  const payload = compactObject({
    full_name: data.full_name ?? data.fullName ?? data.name,
    phone: data.phone || undefined,
    whatsapp: data.whatsapp || undefined,
    email: data.email || undefined,
    city: data.city || undefined,
    notes: data.notes || undefined,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
  });
  const res = await fetch(`/api/v1/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update client");
  const response = await readJsonSafe<ApiEnvelope<BackendClientSummary>>(res);
  if (!response?.data) throw new Error("Client response missing data");
  return normalizeClientSummary(response.data);
}

export async function updateClientNotes(id: string, noteText: string): Promise<ClientSummary> {
  const res = await fetch(`/api/v1/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: noteText }),
  });
  if (!res.ok) throw new Error("Failed to save note");
  const response = await readJsonSafe<ApiEnvelope<BackendClientSummary>>(res);
  if (!response?.data) throw new Error("Client response missing data");
  return normalizeClientSummary(response.data);
}

export async function logClientCommunication(id: string, data: JsonObject) {
  const res = await fetch(`/api/v1/clients/${id}/communication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to log communication");
  return res.json();
}

// Finance - Invoices
export async function createInvoice(data: JsonObject) {
  const res = await fetch("/api/v1/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create invoice");
  return res.json();
}

export async function updateInvoice(id: string, data: JsonObject) {
  const res = await fetch(`/api/v1/invoices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update invoice");
  return res.json();
}

export async function sendInvoice(id: string) {
  const res = await fetch(`/api/v1/invoices/${id}/send`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to send invoice");
  return res.json();
}

export async function remindInvoice(id: string) {
  const res = await fetch(`/api/v1/invoices/${id}/remind`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to send reminder");
  return res.json();
}

export async function deleteInvoice(id: string) {
  const res = await fetch(`/api/v1/invoices/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete invoice");
  return res.json();
}

// Finance - Payments
export async function recordPayment(data: JsonObject) {
  const res = await fetch("/api/v1/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to record payment");
  return res.json();
}

export async function updatePayment(id: string, data: JsonObject) {
  const res = await fetch(`/api/v1/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update payment");
  return res.json();
}

export async function deletePayment(id: string) {
  const res = await fetch(`/api/v1/payments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete payment");
  return res.json();
}

// Finance - Expenses
export async function createExpense(data: JsonObject) {
  const res = await fetch("/api/v1/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create expense");
  return res.json();
}

export async function updateExpense(id: string, data: JsonObject) {
  const res = await fetch(`/api/v1/expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
}

export async function deleteExpense(id: string) {
  const res = await fetch(`/api/v1/expenses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete expense");
  return res.json();
}

// Gallery & Deliverables
export async function createGallery(data: JsonObject) {
  const res = await fetch("/api/v1/galleries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create gallery");
  return res.json();
}

export async function updateGallerySettings(id: string, data: JsonObject) {
  const res = await fetch(`/api/v1/galleries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

export async function tagFace(id: string, clusterId: string, data: FaceLabelInput) {
  const res = await fetch(`/api/v1/galleries/${id}/clusters/${clusterId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: typeof data === "string" ? data : data.label ?? data.name ?? "" }),
  });
  if (!res.ok) throw new Error("Failed to tag face");
  return res.json();
}

export async function verifyClientPin(slug: string, pin: string) {
  const res = await fetch(`/api/v1/gallery/${slug}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error("Incorrect PIN");
  return res.json();
}

// Team & Payouts
export async function getTeamMembers() {
  const res = await fetch("/api/v1/team");
  if (!res.ok) throw new Error("Failed to fetch team");
  return res.json();
}

export async function createTeamMember(data: JsonObject) {
  const res = await fetch("/api/v1/team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add member");
  return res.json();
}

export async function updateMemberBank(id: string, data: JsonObject) {
  const res = await fetch(`/api/v1/team/${id}/bank`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save bank details");
  return res.json();
}

export async function checkScheduleConflicts(weekStr: string) {
  const res = await fetch(`/api/v1/team/conflicts?week=${weekStr}`);
  if (!res.ok) throw new Error("Failed checking conflicts");
  return res.json();
}

export async function recordPayout(data: JsonObject) {
  const res = await fetch("/api/v1/payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed recording payout");
  return res.json();
}

// Team API
export async function fetchTeamMembers(url: string = "/api/v1/team"): Promise<TeamListResult> {
  // Stub for now following plan
  return {
    list: [
      {
        id: "T-1",
        name: "Ankit Sharma",
        role: "Lead Photographer",
        email: "ankit@studiodesk.com",
        phone: "+91 98765 43210",
        whatsapp: "+91 98765 43210",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit",
        status: "active",
        joinedAt: "12 Jan 2024",
        skills: ["Wedding", "Portrait"],
        totalProjects: 124
      },
      {
        id: "T-2",
        name: "Riya Kapoor",
        role: "Editor",
        email: "riya@studiodesk.com",
        phone: "+91 98765 43211",
        whatsapp: null,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya",
        status: "active",
        joinedAt: "15 Mar 2024",
        skills: ["Premiere Pro", "After Effects"],
        totalProjects: 86
      }
    ],
    count: 2
  };
}

// Analytics API
export async function fetchAnalyticsOverview(url: string = "/api/v1/analytics/overview"): Promise<AnalyticsOverview> {
  // Stub for now following plan
  return {
    metrics: [
      { label: "Total Revenue", value: "₹24.5L", change: 12, trend: "up" },
      { label: "Bookings", value: 156, change: 8, trend: "up" },
      { label: "Average Order", value: "₹45K", change: -2, trend: "down" },
      { label: "Conversion", value: "18%", change: 5, trend: "up" }
    ],
    revenue: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{ label: "Revenue", data: [450000, 520000, 480000, 610000, 590000, 720000] }]
    },
    bookings: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{ label: "Bookings", data: [22, 28, 24, 31, 30, 38] }]
    },
    clients: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{ label: "New Clients", data: [12, 18, 14, 21, 19, 25] }]
    }
  };
}

// Settings API
export async function fetchStudioProfile(url: string = "/api/v1/studio/profile"): Promise<StudioProfile> {
  // Stub for now following plan
  return {
    id: "S-1",
    name: "StudioDesk Defaults",
    tagline: "Capturing your best moments with artisan precision",
    logo: null,
    city: "Mumbai",
    state: "Maharashtra",
    address: "Bandra West, Mumbai, 400050",
    email: "contact@studiodesk.com",
    phone: "+91 99999 88888",
    socials: {
      instagram: "studiodesk",
      facebook: "studiodesk"
    },
    isVerified: true
  };
}
