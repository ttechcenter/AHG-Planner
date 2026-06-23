import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Target, AlertTriangle, ShieldCheck, Zap, DollarSign, Users, Briefcase, PlusCircle } from 'lucide-react';
import { WeeklyReport } from '../../types';

interface SWOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<WeeklyReport, 'id' | 'user_id' | 'week_start_date' | 'created_at' | 'updated_at'>) => void;
  employeeName: string;
  weekLabel: string;
  existing?: WeeklyReport | null;
}

const EMPTY = {
  strengths: '', weaknesses: '', opportunities: '', threats: '',
  resource_financial: 0, resource_financial_comment: '', resource_social: '',
  departmental_work: '', additional_work: '',
};

export default function SWOTModal({ isOpen, onClose, onSubmit, employeeName, weekLabel, existing }: SWOTModalProps) {
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (isOpen) {
      if (existing) {
        setForm({
          strengths: existing.strengths ?? '',
          weaknesses: existing.weaknesses ?? '',
          opportunities: existing.opportunities ?? '',
          threats: existing.threats ?? '',
          resource_financial: existing.resource_financial ?? 0,
          resource_financial_comment: existing.resource_financial_comment ?? '',
          resource_social: existing.resource_social ?? '',
          departmental_work: existing.departmental_work ?? '',
          additional_work: existing.additional_work ?? '',
        });
      } else {
        setForm({ ...EMPTY });
      }
    }
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const set = (key: string, val: string | number) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  const swotFields = [
    { key: 'strengths', label: 'Strengths', icon: <ShieldCheck size={16} />, color: 'emerald', placeholder: 'What went well this week? Key achievements...' },
    { key: 'weaknesses', label: 'Weaknesses', icon: <AlertTriangle size={16} />, color: 'rose', placeholder: 'Challenges faced, areas to improve...' },
    { key: 'opportunities', label: 'Opportunities', icon: <Lightbulb size={16} />, color: 'sky', placeholder: 'Opportunities to leverage next week...' },
    { key: 'threats', label: 'Threats', icon: <Target size={16} />, color: 'amber', placeholder: 'Risks or obstacles ahead...' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-400',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 focus:ring-rose-400',
    sky: 'border-sky-200 bg-sky-50 text-sky-700 focus:ring-sky-400',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-amber-400" />
              Weekly Report — {existing ? 'Edit' : 'Submit'}
            </h2>
            <p className="text-slate-300 text-sm mt-1">{employeeName} — {weekLabel}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resource Mobilization */}
          <section>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <DollarSign size={16} className="text-green-600" />
              A. Resource Mobilization (This Week)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Financial */}
              <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-green-700">
                  <DollarSign size={14} /> Financial
                </label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.resource_financial || ''}
                  onChange={(e) => set('resource_financial', parseFloat(e.target.value) || 0)}
                  placeholder="Amount (e.g. 5000)"
                  className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
                <textarea
                  value={form.resource_financial_comment}
                  onChange={(e) => set('resource_financial_comment', e.target.value)}
                  placeholder="Comment about financial resource mobilization..."
                  rows={2}
                  className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
              </div>
              {/* Social */}
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-2">
                  <Users size={14} /> Social
                </label>
                <textarea
                  value={form.resource_social}
                  onChange={(e) => set('resource_social', e.target.value)}
                  placeholder="Describe social resource mobilization activities..."
                  rows={4}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            </div>
          </section>

          {/* Departmental Work */}
          <section>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Briefcase size={16} className="text-orange-600" />
              B. Departmental Work
            </h3>
            <textarea
              value={form.departmental_work}
              onChange={(e) => set('departmental_work', e.target.value)}
              placeholder="Describe your departmental work this week..."
              rows={3}
              className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm resize-none bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </section>

          {/* Additional Work */}
          <section>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <PlusCircle size={16} className="text-purple-600" />
              C. Additional Work
            </h3>
            <textarea
              value={form.additional_work}
              onChange={(e) => set('additional_work', e.target.value)}
              placeholder="Any additional work done outside your main responsibilities..."
              rows={3}
              className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm resize-none bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </section>

          {/* SWOT */}
          <section>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Zap size={16} className="text-slate-600" />
              SWOT Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {swotFields.map((f) => (
                <div key={f.key} className={`rounded-xl border-2 p-4 ${colorMap[f.color].split(' ').slice(0, 2).join(' ')}`}>
                  <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${colorMap[f.color].split(' ')[2]}`}>
                    {f.icon} {f.label}
                  </label>
                  <textarea
                    value={(form as any)[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className={`w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 bg-white ${colorMap[f.color].split(' ').slice(0, 1).join(' ')} ${colorMap[f.color].split(' ')[3]}`}
                  />
                </div>
              ))}
            </div>
          </section>
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all text-sm"
          >
            <Zap size={16} /> {existing ? 'Update Report' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
