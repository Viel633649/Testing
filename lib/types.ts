export interface Profile {
  id: string
  email: string
  full_name?: string
  username?: string
  discipline?: string
  bio?: string
  avatar_url?: string
  portfolio_links?: string[]
  paystack_secret_key?: string
  flutterwave_secret_key?: string
  preferred_currency: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  client_name: string
  client_email: string
  deadline?: string
  status: 'active' | 'awaiting_feedback' | 'revision' | 'completed' | 'archived'
  public_slug: string
  created_at: string
  updated_at: string
  deliverables?: Deliverable[]
  profiles?: Profile
  invoices?: Invoice[]
}

export interface Deliverable {
  id: string
  project_id: string
  file_name: string
  file_url: string
  file_size_bytes: number
  uploaded_at: string
}

export interface Invoice {
  id: string
  project_id: string
  user_id: string
  currency: string
  due_date?: string
  status: 'draft' | 'sent' | 'paid'
  payment_provider?: string
  payment_reference?: string
  paid_at?: string
  created_at: string
  invoice_items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Feedback {
  id: string
  project_id: string
  deliverable_id?: string
  content: string
  submitted_at: string
  deliverables?: { file_name: string }
}
