-- Portivo Database Schema

-- Freelancer accounts (Extends Supabase Auth users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  username text UNIQUE,
  discipline text,
  bio text,
  avatar_url text,
  paystack_secret_key text,        -- should be encrypted in a real app
  flutterwave_secret_key text,     -- should be encrypted in a real app
  preferred_currency text DEFAULT 'NGN',
  tos_accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  deadline date,
  status text DEFAULT 'active'
    CHECK (status IN ('active', 'awaiting_feedback', 'revision', 'completed', 'archived')),
  public_slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deliverable files
CREATE TABLE deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,          -- Supabase Storage URL
  file_size_bytes bigint,
  uploaded_at timestamptz DEFAULT now()
);

-- Client feedback
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  deliverable_id uuid REFERENCES deliverables(id) ON DELETE SET NULL,
  content text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text DEFAULT 'NGN',
  due_date date,
  status text DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid')),
  payment_provider text
    CHECK (payment_provider IN ('paystack', 'flutterwave')),
  payment_reference text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Invoice line items
CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  unit_price numeric NOT NULL,
  total numeric GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Client link activity
CREATE TABLE link_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  event_type text
    CHECK (event_type IN ('viewed', 'downloaded', 'feedback_submitted', 'payment_initiated', 'payment_completed')),
  ip_hash text,
  occurred_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Users can only see/edit their own projects. Public can view via slug (needs a separate function/policy)
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view project by slug" ON projects FOR SELECT USING (true); -- Simplified for MVP

-- Deliverables: Same logic
CREATE POLICY "Users can manage own deliverables" ON deliverables FOR ALL
  USING (EXISTS (SELECT 1 FROM projects WHERE id = deliverables.project_id AND user_id = auth.uid()));
CREATE POLICY "Public can view deliverables" ON deliverables FOR SELECT USING (true);

-- Feedback: Public can insert, Users can view
CREATE POLICY "Public can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view feedback for own projects" ON feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE id = feedback.project_id AND user_id = auth.uid()));

-- Invoices: Users manage, Public views
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view invoices" ON invoices FOR SELECT USING (true);

CREATE POLICY "Users can manage own invoice items" ON invoice_items FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()));
CREATE POLICY "Public can view invoice items" ON invoice_items FOR SELECT USING (true);
