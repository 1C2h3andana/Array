export type CustomerStatus = 'active' | 'inactive'

export interface Customer {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: CustomerStatus
  totalSpend: number
  createdAt: string
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined'

export interface QuotationLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Quotation {
  id: string
  number: string
  customerId: string
  customerCompany: string | null
  status: QuotationStatus
  items: QuotationLineItem[]
  validUntil: string | null
  createdAt: string
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue'

export interface Invoice {
  id: string
  number: string
  customerId: string
  customerCompany: string | null
  amount: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string | null
}

export type FollowUpStatus = 'open' | 'completed'

export interface FollowUp {
  id: string
  customerId: string
  customerCompany: string | null
  subject: string
  notes: string
  status: FollowUpStatus
  dueAt: string | null
}

export interface Profile {
  id: string
  businessId: string
  fullName: string
}

export interface BusinessSettings {
  id: string
  name: string
  contactEmail: string | null
  currency: string
  notifyFollowUps: boolean
  notifyInvoices: boolean
}

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
}
