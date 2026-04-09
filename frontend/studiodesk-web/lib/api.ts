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
    title?: string | null;
    event_type?: string | null;
    client_name?: string | null;
    client_phone?: string | null;
    client_whatsapp?: string | null;
    venue_name?: string | null;
    call_time?: string | null;
    shoot_start_time?: string | null;
    shoot_end_time?: string | null;
    venue_address?: string | null;
    venue_map_link?: string | null;
    assigned_team?: Array<{ name?: string | null; avatar?: string | null; role?: string | null }> | null;
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

export async function submitStudioProfile(data: Step1Data) {
  // Directly call the onboarding step API which handles profile updates internally
  return completeOnboardingStep(1, {
    name: data.name,
    city: data.city,
    state: data.state,
    experience: data.experience,
    specialty: data.specialty,
    tagline: data.tagline || undefined,
  });
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
  const payload = await fetchApiData<{ list: InvoiceRecord[]; count: number }>(url);
  return {
    list: Array.isArray(payload.list) ? payload.list : [],
    count: Number(payload.count ?? 0),
  };
}

export async function fetchInvoiceDetail(id: string): Promise<InvoiceRecord & { lineItems?: Array<{ description: string; amount: number }>; payments?: Array<{ id: string; date: string; amount: number; method: string }> }> {
  return await fetchApiData(`/api/v1/invoices/${id}`);
}

export async function fetchPaymentsList(url: string): Promise<PaymentListResult> {
  const payload = await fetchApiData<{ list: PaymentRecord[]; count: number }>(url);
  return {
    list: Array.isArray(payload.list) ? payload.list : [],
    count: Number(payload.count ?? 0),
  };
}

export async function fetchExpensesList(url: string): Promise<{ list: Array<Record<string, unknown>>; count: number }> {
  const payload = await fetchApiData<{ list: Array<Record<string, unknown>>; count: number }>(url);
  return {
    list: Array.isArray(payload.list) ? payload.list : [],
    count: Number(payload.count ?? 0),
  };
}

// Gallery fetchers
export async function fetchGalleriesList(url: string): Promise<GallerySummary[]> {
  const payload = await fetchApiData<GallerySummary[]>(url);
  return Array.isArray(payload) ? payload : [];
}

export async function fetchGalleryDetail(url: string): Promise<GalleryDetail> {
  const payload = await fetchApiData<GalleryDetail>(url);
  if (!payload) {
    return { id: "", name: "", clientName: "", slug: "", eventType: "", shootDate: "", status: "", photoCount: 0, videoCount: 0, sizeGb: 0, selectedCount: 0, selectionQuota: 0, uploadProgress: 0, accessType: "", coverUrl: null, photos: [], faceClusters: [] } as GalleryDetail;
  }
  return {
    ...payload,
    photos: Array.isArray(payload.photos) ? payload.photos : [],
    faceClusters: Array.isArray(payload.faceClusters) ? payload.faceClusters : [],
  };
}

// Bookings Mutations
export async function createBooking(data: JsonObject): Promise<BookingSummary> {
  // First, create the client using the form's clientName string
  const clientPayload = {
    full_name: data.clientName as string,
    phone: String(data.phone ?? "").replace(/\D/g, "").slice(0, 10),
    city: data.city as string || undefined,
  };
  const newClient = await createClient(clientPayload);

  // Map frontend event types to backend enums
  let backendEventType = "other";
  switch (data.eventType) {
    case "Wedding": backendEventType = "wedding"; break;
    case "Engagement": backendEventType = "engagement"; break;
    case "Corporate": backendEventType = "corporate"; break;
    case "Birthday": backendEventType = "birthday"; break;
    case "Product Shoot": backendEventType = "product"; break;
    default: backendEventType = "other"; break;
  }

  // Then structure the actual Booking database payload
  const bookingPayload = {
    client_id: newClient.id,
    title: String(data.eventName),
    event_type: backendEventType,
    event_date: data.date ? new Date(data.date as string).toISOString() : null,
    total_amount: Number(data.amount) || 0,
    venue_name: (data.venue as string) || null,
    venue_city: (data.city as string) || null,
    notes: (data.notes as string) || null,
  };

  const res = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingPayload),
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
  if (!res.ok) {
    const body = await readJsonSafe<{ error?: string }>(res);
    throw new Error(body?.error || `Failed to update stage to ${stage}`);
  }
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

export async function fetchPackages(url: string = "/api/v1/packages"): Promise<any[]> {
  return await fetchApiData(url);
}

export async function createPackage(data: any) {
  const res = await fetch("/api/v1/packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create package");
  return res.json();
}

export async function updatePackage(id: string, data: any) {
  const res = await fetch(`/api/v1/packages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update package");
  return res.json();
}

export async function deletePackage(id: string) {
  const res = await fetch(`/api/v1/packages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete package");
  return res.json();
}

export async function fetchIntegrationsStatus(): Promise<{ razorpay: { connected: boolean; keyId?: string }; whatsapp: { connected: boolean; phoneNumber?: string }; gcal: { connected: boolean; email?: string; syncBookings: boolean; syncTeam: boolean } }> {
  return await fetchApiData("/api/v1/integrations/status");
}

export async function connectIntegration(provider: string, data: any) {
  const res = await fetch(`/api/v1/integrations/${provider}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to connect ${provider}`);
  return res.json();
}

export async function disconnectIntegration(provider: string) {
  const res = await fetch(`/api/v1/integrations/${provider}/disconnect`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to disconnect ${provider}`);
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
  const payload = await fetchApiData<TeamMember[]>(url);
  return {
    list: Array.isArray(payload) ? payload : [],
    count: Array.isArray(payload) ? payload.length : 0,
  };
}

// Analytics API
export async function fetchAnalyticsOverview(url: string = "/api/v1/analytics/overview"): Promise<AnalyticsOverview> {
  return await fetchApiData<AnalyticsOverview>(url);
}

// Settings API
export async function fetchStudioProfile(url: string = "/api/v1/studio/profile"): Promise<StudioProfile> {
  return await fetchApiData<StudioProfile>(url);
}

// ============================================================
// Additional API fetchers added during integration audit
// ============================================================

// --- Contracts ---
export type ContractRecord = {
  id: string;
  clientName: string;
  date: string;
  type: string;
  status: string;
  amount?: number;
  packageName?: string;
};

export type ContractListResult = {
  list: ContractRecord[];
  count: number;
};

export async function fetchContractsList(url: string = "/api/v1/contracts"): Promise<ContractListResult> {
  const payload = await fetchApiData<ContractRecord[]>(url);
  return {
    list: Array.isArray(payload) ? payload : [],
    count: Array.isArray(payload) ? payload.length : 0,
  };
}

// --- Proposals ---
export type ProposalRecord = {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  status: string;
  packageName?: string;
};

export type ProposalListResult = {
  list: ProposalRecord[];
  count: number;
};

export async function fetchProposalsList(url: string = "/api/v1/proposals"): Promise<ProposalListResult> {
  const payload = await fetchApiData<ProposalRecord[]>(url);
  return {
    list: Array.isArray(payload) ? payload : [],
    count: Array.isArray(payload) ? payload.length : 0,
  };
}

export async function fetchProposalDetail(id: string): Promise<ProposalRecord & { description?: string; terms?: string; items?: Array<{ name: string; amount: number }> }> {
  return await fetchApiData(`/api/v1/proposals/${id}`);
}

export async function fetchContractDetail(id: string): Promise<ContractRecord & { description?: string; terms?: string; clauses?: Array<{ title: string; content: string }> }> {
  return await fetchApiData(`/api/v1/contracts/${id}`);
}

export type LeadRecord = BookingSummary;

export async function fetchLeadDetail(id: string): Promise<BookingSummary> {
  return await fetchApiData(`/api/v1/bookings/${id}`);
}

// --- Addons ---
export type AddonRecord = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  active: boolean;
};

export type AddonListResult = {
  list: AddonRecord[];
  count: number;
};

export async function fetchAddonsList(url: string = "/api/v1/addons"): Promise<AddonListResult> {
  const payload = await fetchApiData<AddonRecord[]>(url);
  return {
    list: Array.isArray(payload) ? payload : [],
    count: Array.isArray(payload) ? payload.length : 0,
  };
}

// --- Team Schedule ---
export type ScheduleAssignment = {
  memberId: string;
  memberName: string;
  date: string;
  bookingId: string;
  bookingTitle: string;
  eventType: string;
};

export async function fetchTeamSchedule(url: string = "/api/v1/team/schedule"): Promise<ScheduleAssignment[]> {
  const payload = await fetchApiData<ScheduleAssignment[]>(url);
  return Array.isArray(payload) ? payload : [];
}

// --- Team Payouts ---
export type PayoutRecord = {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  status: string;
  bookingRef?: string;
};

export type PayoutListResult = {
  list: PayoutRecord[];
  count: number;
  totalPaid: number;
  totalPending: number;
};

export async function fetchPayoutsList(url: string = "/api/v1/payouts"): Promise<PayoutListResult> {
  const payload = await fetchApiData<{ list: PayoutRecord[]; totalPaid: number; totalPending: number }>(url);
  return {
    list: Array.isArray(payload?.list) ? payload.list : [],
    count: Array.isArray(payload?.list) ? payload.list.length : 0,
    totalPaid: Number(payload?.totalPaid ?? 0),
    totalPending: Number(payload?.totalPending ?? 0),
  };
}

// --- Client Portal APIs ---
export type ClientPortalAction = {
  id: string;
  type: string;
  title: string;
  description: string;
  link: string;
  color: string;
  dueDate?: string;
};

export async function fetchClientActions(url: string): Promise<ClientPortalAction[]> {
  const payload = await fetchApiData<ClientPortalAction[]>(url);
  return Array.isArray(payload) ? payload : [];
}

export type ClientPortalBooking = {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: string;
  packageName: string;
  amount: number;
};

export async function fetchClientBookings(url: string): Promise<ClientPortalBooking[]> {
  const payload = await fetchApiData<ClientPortalBooking[]>(url);
  return Array.isArray(payload) ? payload : [];
}

export type ClientPortalInvoice = {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: string;
};

export async function fetchClientInvoices(url: string): Promise<ClientPortalInvoice[]> {
  const payload = await fetchApiData<ClientPortalInvoice[]>(url);
  return Array.isArray(payload) ? payload : [];
}

// --- Expenses (normalized fetcher) ---
export type ExpenseRecord = {
  id: string;
  date: string;
  description: string;
  category: string;
  vendor: string;
  amount: number;
  gstInput: number;
  hasReceipt: boolean;
};

export async function fetchExpensesListTyped(url: string = "/api/v1/expenses"): Promise<{ list: ExpenseRecord[]; count: number; totalExp: number; totalGst: number }> {
  try {
    const payload = await fetchApiData<ExpenseRecord[]>(url);
    const list = Array.isArray(payload) ? payload : [];
    const totalExp = list.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
    const totalGst = list.reduce((sum, e) => sum + Number(e.gstInput ?? 0), 0);
    return { list, count: list.length, totalExp, totalGst };
  } catch {
    // Endpoint may not exist yet — return empty data gracefully
    return { list: [], count: 0, totalExp: 0, totalGst: 0 };
  }
}
