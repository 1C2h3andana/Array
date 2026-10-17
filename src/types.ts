export type CustomerStatus = 'active' | 'inactive'

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: CustomerStatus
  totalSpend: number
  createdAt: string
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined'

export interface QuotationLineItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Quotation {
  id: string
  number: string
  customerId: string
  status: QuotationStatus
  items: QuotationLineItem[]
  validUntil: string
  createdAt: string
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft'

export interface Invoice {
  id: string
  number: string
  customerId: string
  amount: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
}

export type FollowUpStatus = 'open' | 'completed'

export interface FollowUp {
  id: string
  customerId: string
  subject: string
  notes: string
  status: FollowUpStatus
  dueAt: string
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
