import { supabase } from './supabase'
import type {
  BusinessSettings,
  Customer,
  CustomerStatus,
  FollowUp,
  Invoice,
  InvoiceStatus,
  Profile,
  Quotation,
  QuotationStatus,
} from '../types'

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0)
}

// PostgREST returns embedded one-to-one relations as objects (or arrays when
// the relation shape is ambiguous); normalize to the company name.
function embeddedCompany(customer: unknown): string | null {
  if (Array.isArray(customer)) {
    const first = customer[0] as { company?: string | null } | undefined
    return first?.company ?? null
  }
  if (customer && typeof customer === 'object') {
    return (customer as { company?: string | null }).company ?? null
  }
  return null
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, business_id, full_name')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    businessId: data.business_id,
    fullName: data.full_name ?? '',
  }
}

// ---------------------------------------------------------------------------
// Business settings
// ---------------------------------------------------------------------------

export async function fetchBusinessSettings(businessId: string): Promise<BusinessSettings> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, owner_id, name, contact_email, currency, notify_follow_ups, notify_invoices')
    .eq('id', businessId)
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    contactEmail: data.contact_email,
    currency: data.currency,
    notifyFollowUps: data.notify_follow_ups,
    notifyInvoices: data.notify_invoices,
  }
}

export interface BusinessSettingsPatch {
  name: string
  contactEmail: string
  currency: string
  notifyFollowUps: boolean
  notifyInvoices: boolean
}

export async function updateBusinessSettings(
  businessId: string,
  patch: BusinessSettingsPatch,
): Promise<void> {
  const { error } = await supabase
    .from('businesses')
    .update({
      name: patch.name,
      contact_email: patch.contactEmail || null,
      currency: patch.currency,
      notify_follow_ups: patch.notifyFollowUps,
      notify_invoices: patch.notifyInvoices,
    })
    .eq('id', businessId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Business data
// ---------------------------------------------------------------------------

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, company, email, phone, status, total_spend, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    status: (row.status ?? 'active') as CustomerStatus,
    totalSpend: toNumber(row.total_spend),
    createdAt: row.created_at,
  }))
}

export async function fetchQuotations(): Promise<Quotation[]> {
  const { data, error } = await supabase
    .from('quotations')
    .select(
      `id, customer_id, number, status, valid_until, created_at,
       customer:customers (company),
       items:quotation_items (id, description, quantity, unit_price)`,
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    number: row.number,
    customerId: row.customer_id,
    customerCompany: embeddedCompany(row.customer),
    status: (row.status ?? 'draft') as QuotationStatus,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      description: item.description,
      quantity: toNumber(item.quantity),
      unitPrice: toNumber(item.unit_price),
    })),
    validUntil: row.valid_until,
    createdAt: row.created_at,
  }))
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(
      `id, customer_id, number, status, amount, issued_at, due_at,
       customer:customers (company)`,
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    number: row.number,
    customerId: row.customer_id,
    customerCompany: embeddedCompany(row.customer),
    amount: toNumber(row.amount),
    status: (row.status ?? 'draft') as InvoiceStatus,
    issuedAt: row.issued_at,
    dueAt: row.due_at,
  }))
}

export async function fetchFollowUps(): Promise<FollowUp[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select(
      `id, customer_id, subject, notes, status, due_at,
       customer:customers (company)`,
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    customerId: row.customer_id,
    customerCompany: embeddedCompany(row.customer),
    subject: row.subject,
    notes: row.notes ?? '',
    status: (row.status ?? 'open') as FollowUp['status'],
    dueAt: row.due_at,
  }))
}

/** Marks a follow-up completed; the RLS policy scopes this to the workspace. */
export async function completeFollowUp(followUpId: string): Promise<void> {
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', followUpId)
  if (error) throw error
}

export interface OverviewData {
  revenueCollected: number
  outstanding: number
  activeCustomers: number
  openQuotations: number
  recentInvoices: Invoice[]
  dueFollowUps: FollowUp[]
}

export async function fetchOverview(): Promise<OverviewData> {
  const [customers, quotations, invoices, followUps] = await Promise.all([
    fetchCustomers(),
    fetchQuotations(),
    fetchInvoices(),
    fetchFollowUps(),
  ])
  return {
    revenueCollected: invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0),
    outstanding: invoices
      .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0),
    activeCustomers: customers.filter((c) => c.status === 'active').length,
    openQuotations: quotations.filter((q) => q.status === 'sent' || q.status === 'accepted').length,
    recentInvoices: invoices.slice(0, 4),
    dueFollowUps: followUps.filter((f) => f.status === 'open'),
  }
}
