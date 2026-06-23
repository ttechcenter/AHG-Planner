import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import PlanViewer from '../../components/dashboard/PlanViewer';
import ITAdminDashboard from './ITAdminDashboard';
import {
  BarChart3, Users, Calendar, ChevronLeft, ChevronRight, UserCog,
} from 'lucide-react';
import { getWeekStartsInMonth } from '../../lib/dateUtils';

interface CEODashboardProps {
  profile: Profile;
}

interface DeptPerformance {
  dept: string;
  totalTasks: number;
  completedTasks: number;
  rate: number;
  financial: number;
  employees: number;
}

type Tab = 'plans' | 'performance' | 'users';

export default function CEODashboard({ profile }: CEODashboardProps) {
  const [tab, setTab] = useState<Tab>('plans');
  const [perfMonth, setPerfMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [deptPerf, setDeptPerf] = useState<DeptPerformance[]>([]);
  const [perfLoading, setPerfLoading] = useState(false);

  const loadMonthlyPerformance = async () => {
    setPerfLoading(true);
    const weeks = getWeekStartsInMonth(perfMonth.year, perfMonth.month);

    const { data: employees } = await supabase.from('profiles').select('id, full_name, department').eq('role', 'employee');
    if (!employees) { setPerfLoading(false); return; }

    const { data: plans } = await supabase.from('weekly_plans').select('id, user_id, week_start_date').in('week_start_date', weeks);
    const planIds = (plans ?? []).map(p => p.id);

    let items: any[] = [];
    if (planIds.length > 0) {
      const { data } = await supabase.from('plan_items').select('plan_id, is_completed').in('plan_id', planIds);
      items = data ?? [];
    }

    const { data: reports } = await supabase.from('weekly_reports').select('user_id, resource_financial, week_start_date').in('week_start_date', weeks);

    const deptMap = new Map<string, DeptPerformance>();
    employees.forEach((e) => {
      const dept = e.department || 'Unassigned';
      if (!deptMap.has(dept)) deptMap.set(dept, { dept, totalTasks: 0, completedTasks: 0, rate: 0, financial: 0, employees: 0 });
      deptMap.get(dept)!.employees++;
    });

    (plans ?? []).forEach((plan) => {
      const emp = employees.find(e => e.id === plan.user_id);
      if (!emp) return;
      const dept = emp.department || 'Unassigned';
      const entry = deptMap.get(dept);
      if (!entry) return;
      const planItems = items.filter(i => i.plan_id === plan.id);
      entry.totalTasks += planItems.length;
      entry.completedTasks += planItems.filter((i: any) => i.is_completed).length;
    });

    (reports ?? []).forEach((r) => {
      const emp = employees.find(e => e.id === r.user_id);
      if (!emp) return;
      const dept = emp.department || 'Unassigned';
      const entry = deptMap.get(dept);
      if (entry) entry.financial += r.resource_financial ?? 0;
    });

    const result = Array.from(deptMap.values()).map(d => ({
      ...d,
      rate: d.totalTasks > 0 ? Math.round((d.completedTasks / d.totalTasks) * 100) : 0,
    })).sort((a, b) => b.rate - a.rate);

    setDeptPerf(result);
    setPerfLoading(false);
  };

  useEffect(() => { if (tab === 'performance') loadMonthlyPerformance(); }, [tab, perfMonth]);

  const monthLabel = new Date(perfMonth.year, perfMonth.month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        {[
          { key: 'plans', label: 'Employee Plans', icon: <Users size={15} /> },
          { key: 'performance', label: 'Monthly Performance', icon: <BarChart3 size={15} /> },
          { key: 'users', label: 'Manage Users', icon: <UserCog size={15} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === t.key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'plans' && <PlanViewer viewerProfile={profile} viewerRole={profile.role} />}

      {tab === 'users' && <ITAdminDashboard profile={profile} />}

      {tab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-green-700" />
              <span className="font-semibold text-gray-700 text-sm">Monthly Performance:</span>
              <span className="text-gray-900 font-medium">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPerfMonth(p => { const d = new Date(p.year, p.month - 2, 1); return { year: d.getFullYear(), month: d.getMonth() + 1 }; })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronLeft size={18} /></button>
              <button onClick={() => { const d = new Date(); setPerfMonth({ year: d.getFullYear(), month: d.getMonth() + 1 }); }} className="text-xs font-medium text-green-700 hover:text-green-900 px-2 py-1 rounded-lg hover:bg-green-50">Current Month</button>
              <button onClick={() => setPerfMonth(p => { const d = new Date(p.year, p.month, 1); return { year: d.getFullYear(), month: d.getMonth() + 1 }; })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronRight size={18} /></button>
            </div>
          </div>

          {perfLoading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : deptPerf.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">No performance data for this month.</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <BarChart3 size={17} className="text-green-700" />
                <h3 className="font-semibold text-gray-800">Department Performance — {monthLabel}</h3>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Employees</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Tasks</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Completion Rate</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Financial Mobilized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deptPerf.map((d) => (
                    <tr key={d.dept} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800">{d.dept}</td>
                      <td className="px-5 py-4 text-center text-gray-600">{d.employees}</td>
                      <td className="px-5 py-4 text-center text-gray-600">{d.completedTasks}/{d.totalTasks}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="flex-1 max-w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${d.rate}%`, backgroundColor: d.rate >= 80 ? '#10b981' : d.rate >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className={`text-xs font-bold w-10 ${d.rate >= 80 ? 'text-emerald-600' : d.rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{d.rate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-green-700">{d.financial > 0 ? `${d.financial.toLocaleString()} ETB` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
