
-- Enable storage for profile photos
-- Departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Profiles table (users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'employee'
    CHECK (role IN ('ceo','it_admin','manager','hr','ceo_office_head','strategic_advisor','employee')),
  department text DEFAULT '',
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Departments policies
CREATE POLICY "dept_select_all" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "dept_insert_admin" ON departments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('it_admin','ceo'))
);
CREATE POLICY "dept_update_admin" ON departments FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('it_admin','ceo'))
);
CREATE POLICY "dept_delete_admin" ON departments FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('it_admin','ceo'))
);

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('it_admin','ceo'))
);
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('it_admin','ceo'))
);

-- Weekly plans
CREATE TABLE weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  ceo_comment text DEFAULT '',
  ceo_comment_at timestamptz,
  manager_comment text DEFAULT '',
  manager_comment_at timestamptz,
  manager_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select" ON weekly_plans FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ceo','it_admin','manager','hr','ceo_office_head','strategic_advisor'))
);
CREATE POLICY "plans_insert" ON weekly_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "plans_update" ON weekly_plans FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ceo','it_admin','manager','hr','ceo_office_head','strategic_advisor'))
);
CREATE POLICY "plans_delete" ON weekly_plans FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Plan items
CREATE TABLE plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  s_no integer NOT NULL DEFAULT 1,
  day_of_week text NOT NULL,
  page_num integer NOT NULL DEFAULT 1,
  a_epie text DEFAULT '',
  preparation text DEFAULT '',
  principle text DEFAULT '',
  plan_col text DEFAULT '',
  perform text DEFAULT '',
  productivity text DEFAULT '',
  profit_impl text DEFAULT '',
  pragmatism text DEFAULT '',
  persistence text DEFAULT '',
  profit_eval text DEFAULT '',
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_select" ON plan_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM weekly_plans wp WHERE wp.id = plan_id AND (
      wp.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ceo','it_admin','manager','hr','ceo_office_head','strategic_advisor'))
    )
  )
);
CREATE POLICY "items_insert" ON plan_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM weekly_plans wp WHERE wp.id = plan_id AND wp.user_id = auth.uid())
);
CREATE POLICY "items_update" ON plan_items FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM weekly_plans wp WHERE wp.id = plan_id AND (
      wp.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ceo','it_admin','manager','hr','ceo_office_head','strategic_advisor'))
    )
  )
);
CREATE POLICY "items_delete" ON plan_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM weekly_plans wp WHERE wp.id = plan_id AND wp.user_id = auth.uid())
);

-- Weekly reports (SWOT + resource mobilization)
CREATE TABLE weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  -- SWOT
  strengths text DEFAULT '',
  weaknesses text DEFAULT '',
  opportunities text DEFAULT '',
  threats text DEFAULT '',
  -- Resource Mobilization
  resource_financial numeric DEFAULT 0,
  resource_financial_comment text DEFAULT '',
  resource_social text DEFAULT '',
  -- Departmental & Additional Work
  departmental_work text DEFAULT '',
  additional_work text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON weekly_reports FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ceo','it_admin','manager','hr','ceo_office_head','strategic_advisor'))
);
CREATE POLICY "reports_insert" ON weekly_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reports_update" ON weekly_reports FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "reports_delete" ON weekly_reports FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Seed default departments
INSERT INTO departments (name) VALUES
  ('Executive'),
  ('IT'),
  ('HR'),
  ('Finance'),
  ('Marketing'),
  ('Operations'),
  ('Sales'),
  ('Legal'),
  ('CEO Office'),
  ('Strategy');
