import { Step1Data, Step2Data, Step3Data, Step4Data } from "./validations/onboarding";

export async function submitStudioProfile(data: Step1Data) {
  const res = await fetch("/api/v1/studio/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit studio profile");
  return res.json();
}

export async function submitOwnerProfile(data: Step2Data) {
  const res = await fetch("/api/v1/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: data.fullName,
      phone: data.phone,
      whatsapp: data.whatsapp,
      preferred_language: data.language,
      designation: data.designation
    }),
  });
  if (!res.ok) throw new Error("Failed to submit owner details");
  return res.json();
}

export async function submitTeamMembers(data: Step3Data) {
  const validMembers = data.members.filter(m => m.name && m.name.trim() !== "");
  if (validMembers.length === 0) return null;

  const res = await fetch("/api/v1/team/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members: validMembers }),
  });
  if (!res.ok) throw new Error("Failed to submit team members");
  return res.json();
}

export async function submitPackages(data: Step4Data) {
  if (data.packages.length === 0) return null;

  const res = await fetch("/api/v1/packages/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packages: data.packages }),
  });
  if (!res.ok) throw new Error("Failed to submit packages");
  return res.json();
}

export async function completeOnboardingFlag() {
  const res = await fetch("/api/v1/settings/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true }),
  });
  if (!res.ok) throw new Error("Failed to mark onboarding as completed");
  return res.json();
}

// SWR Fetcher
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json();
};

// Bookings Mutations
export async function createBooking(data: any) {
  const res = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}

export async function updateBookingStage(id: string, stage: string) {
  const res = await fetch(`/api/v1/bookings/${id}/stage`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error("Failed to update stage");
  return res.json();
}

export async function updateBookingNotes(id: string, noteText: string) {
  const res = await fetch(`/api/v1/bookings/${id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: noteText }),
  });
  if (!res.ok) throw new Error("Failed to save note");
  return res.json();
}

// Clients Mutations
export async function createClient(data: any) {
  const res = await fetch("/api/v1/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create client");
  return res.json();
}

export async function updateClient(id: string, data: any) {
  const res = await fetch(`/api/v1/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update client");
  return res.json();
}

export async function updateClientNotes(id: string, noteText: string) {
  const res = await fetch(`/api/v1/clients/${id}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: noteText }),
  });
  if (!res.ok) throw new Error("Failed to save note");
  return res.json();
}

export async function logClientCommunication(id: string, data: any) {
  const res = await fetch(`/api/v1/clients/${id}/communication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to log communication");
  return res.json();
}

// Finance - Invoices
export async function createInvoice(data: any) {
  const res = await fetch("/api/v1/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create invoice");
  return res.json();
}

export async function updateInvoice(id: string, data: any) {
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
export async function recordPayment(data: any) {
  const res = await fetch("/api/v1/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to record payment");
  return res.json();
}

export async function updatePayment(id: string, data: any) {
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
export async function createExpense(data: any) {
  const res = await fetch("/api/v1/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create expense");
  return res.json();
}

export async function updateExpense(id: string, data: any) {
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
export async function createGallery(data: any) {
  const res = await fetch("/api/v1/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create gallery");
  return res.json();
}

export async function updateGallerySettings(id: string, data: any) {
  const res = await fetch(`/api/v1/gallery/${id}/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

export async function tagFace(id: string, clusterId: string, data: any) {
  const res = await fetch(`/api/v1/gallery/${id}/faces/${clusterId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

export async function createTeamMember(data: any) {
  const res = await fetch("/api/v1/team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add member");
  return res.json();
}

export async function updateMemberBank(id: string, data: any) {
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

export async function recordPayout(data: any) {
  const res = await fetch("/api/v1/payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed recording payout");
  return res.json();
}
