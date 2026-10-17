import { Bot, Send, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PageHeader, LoadError } from '../components/ui'
import { fetchCustomers, fetchInvoices, fetchQuotations } from '../lib/data'
import type { Customer, Invoice, Quotation } from '../types'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatCurrency, formatQuotationTotal } from '../utils/format'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

interface WorkspaceData {
  customers: Customer[]
  invoices: Invoice[]
  quotations: Quotation[]
}

const suggestions = [
  'How much money have I collected?',
  'Who owes me money?',
  'Which quotations are still open?',
  'How many active customers do I have?',
]

function answerQuestion(question: string, data: WorkspaceData): string {
  const q = question.toLowerCase()
  const { customers, invoices, quotations } = data
  const companyOf = (id: string) =>
    customers.find((c) => c.id === id)?.company ?? 'a customer'

  if (q.includes('collect') || q.includes('revenue') || q.includes('paid')) {
    const paid = invoices.filter((inv) => inv.status === 'paid')
    const total = paid.reduce((sum, inv) => sum + inv.amount, 0)
    if (paid.length === 0) return 'No invoices are marked as paid yet, so nothing has been collected.'
    return `You have collected ${formatCurrency(total)} from ${paid.length} paid invoice${paid.length === 1 ? '' : 's'} (${paid.map((inv) => inv.number).join(', ')}).`
  }
  if (q.includes('owe') || q.includes('outstanding') || q.includes('unpaid')) {
    const unpaid = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    const total = unpaid.reduce((sum, inv) => sum + inv.amount, 0)
    if (unpaid.length === 0) return 'Great news — no pending or overdue invoices, so nothing is owed.'
    return `There is ${formatCurrency(total)} outstanding across ${unpaid.length} invoice${unpaid.length === 1 ? '' : 's'}: ${unpaid.map((inv) => `${inv.number} from ${companyOf(inv.customerId)} (${inv.status})`).join('; ')}.`
  }
  if (q.includes('overdue')) {
    const overdue = invoices.filter((inv) => inv.status === 'overdue')
    if (overdue.length === 0) return 'Good news — nothing is overdue.'
    return `${overdue.length} invoice is overdue: ${overdue.map((inv) => `${inv.number} from ${companyOf(inv.customerId)} (${formatCurrency(inv.amount)})`).join(', ')}. A polite reminder usually works well.`
  }
  if (q.includes('quotation') || q.includes('quote') || q.includes('proposal')) {
    const open = quotations.filter((qt) => qt.status === 'sent' || qt.status === 'draft')
    if (open.length === 0) return 'No quotations are currently open.'
    return `You have ${open.length} open quotation${open.length === 1 ? '' : 's'}: ${open
      .map(
        (qt) =>
          `${qt.number} for ${qt.customerCompany ?? 'a customer'} (${qt.status}, ${formatCurrency(formatQuotationTotal(qt.items))})`,
      )
      .join('; ')}.`
  }
  if (q.includes('customer') || q.includes('active') || q.includes('client')) {
    if (customers.length === 0) return 'You have no customers in your directory yet.'
    const active = customers.filter((c) => c.status === 'active')
    const biggest = customers.reduce((best, c) => (c.totalSpend > best.totalSpend ? c : best), customers[0])
    return `You have ${active.length} active customer${active.length === 1 ? '' : 's'} out of ${customers.length} total. The biggest by spend is ${biggest.company ?? biggest.name} at ${formatCurrency(biggest.totalSpend)}.`
  }
  return "I can answer questions about your workspace — try asking about collected revenue, outstanding invoices, open quotations, overdue payments or your active customers."
}

const greeting =
  'Hi! I am the BizPilot assistant. I answer questions about your workspace data — computed right here in the app, not by a live AI service.'

export function AIAssistant() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [customers, invoices, quotations] = await Promise.all([
      fetchCustomers(),
      fetchInvoices(),
      fetchQuotations(),
    ])
    return { customers, invoices, quotations }
  })

  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', text: greeting },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const nextIdRef = useRef(1)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || thinking || !data) return
    const userMessage: Message = { id: nextIdRef.current++, role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setThinking(true)
    // Answers are derived locally from the workspace data that was loaded from Supabase.
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextIdRef.current++, role: 'assistant', text: answerQuestion(trimmed, data) },
      ])
      setThinking(false)
    }, 500)
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col space-y-6 lg:h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Assistant"
        description="Ask quick questions about your numbers. Answers are computed in-app from your workspace data."
      />

      {error ? (
        <LoadError message={error} onRetry={reload} />
      ) : (
        <>
          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with the assistant"
            className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    message.role === 'assistant' ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                  ) : (
                    <User className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === 'assistant'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {thinking ? (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600">
                  <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3" aria-label="Assistant is typing">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  disabled={thinking || loading || !data}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/30 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                send(input)
              }}
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask the assistant a question
              </label>
              <input
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={loading ? 'Loading your workspace…' : 'Ask about your invoices, quotes or customers…'}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                disabled={thinking || loading || !data || !input.trim()}
                aria-label="Send message"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
