export type UserRole =
  | 'ceo'
  | 'it_admin'
  | 'manager'
  | 'hr'
  | 'ceo_office_head'
  | 'strategic_advisor'
  | 'employee';

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  department_id: string | null;
  avatar_url: string;
  created_at: string;
}

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  ceo_comment: string;
  ceo_comment_at: string | null;
  manager_comment: string;
  manager_comment_at: string | null;
  manager_id: string | null;
  created_at: string;
}

export interface PlanItem {
  id: string;
  plan_id: string;
  s_no: number;
  day_of_week: string;
  page_num: number;
  a_epie: string;
  preparation: string;
  principle: string;
  plan_col: string;
  perform: string;
  productivity: string;
  profit_impl: string;
  pragmatism: string;
  persistence: string;
  profit_eval: string;
  is_completed: boolean;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start_date: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
  resource_financial: number;
  resource_financial_comment: string;
  resource_social: string;
  departmental_work: string;
  additional_work: string;
  created_at: string;
  updated_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ceo: 'CEO (Founder)',
  it_admin: 'IT Admin',
  manager: 'Department Manager',
  hr: 'HR',
  ceo_office_head: 'CEO Office Head',
  strategic_advisor: 'Strategic Advisor',
  employee: 'Employee',
};

export const VIEWER_ROLES: UserRole[] = [
  'ceo',
  'it_admin',
  'manager',
  'hr',
  'ceo_office_head',
  'strategic_advisor',
];

export const SENIOR_VIEWER_ROLES: UserRole[] = [
  'ceo',
  'hr',
  'ceo_office_head',
  'strategic_advisor',
];
