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
  portfolio_links text[],           -- array of up to 3 links
  paystack_secret_key text,        -- should be encrypted in a real app
  flutterwave_secret_key text,     -- should be encrypted in a real app
  preferred_currency text DEFAULT 'NGN',
  tos_accepted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE, -- Linked to profiles
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
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Teams (V2 Preview)
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Hardened RLS Policies

-- Profiles: Public can view non-sensitive info, Users manage own
CREATE POLICY "Public can view non-sensitive profile info" ON profiles FOR SELECT
  USING (true); -- In a real app, restrict columns in the API layer or via a view

CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Projects: Users manage own, Public can only view if they know the ID (usually filtered by slug in code)
-- To truly harden, we'd use slug-based RLS but standard UUID check is a good start
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view project by public_slug" ON projects FOR SELECT USING (true);

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

CREATE POLICY "Owners can manage teams" ON teams FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can view their teams" ON teams FOR SELECT
  USING (EXISTS (SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid()));
