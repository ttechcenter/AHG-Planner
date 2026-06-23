import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Department } from '../../types';
import { Eye, EyeOff, UserPlus, LogIn, AlertCircle, ShieldCheck, ChevronDown } from 'lucide-react';

const CEO_EMAIL = 'ceo@africanholding.com';

type Mode = 'login' | 'register';

interface AuthPageProps {
  onAuthenticated: () => void;
}



export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const isCEOEmail = email.trim().toLowerCase() === CEO_EMAIL;

  useEffect(() => {
    supabase.from('departments').select('*').order('name').then(({ data }) => {
      if (data) setDepartments(data);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (err) setError(err.message);
    else onAuthenticated();
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true);
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const role = trimmedEmail === CEO_EMAIL ? 'ceo' : 'employee';

    const { data, error: signUpErr } = await supabase.auth.signUp({ email: trimmedEmail, password });
    if (signUpErr || !data.user) { setError(signUpErr?.message ?? 'Registration failed.'); setLoading(false); return; }

    const selectedDept = departments.find((d) => d.id === departmentId);

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: isCEOEmail ? 'CEO' : fullName.trim(),
      email: trimmedEmail,
      role,
      department: isCEOEmail ? 'Executive' : (selectedDept?.name ?? ''),
      department_id: isCEOEmail ? null : (departmentId || null),
    });

    if (profileErr) { setError(profileErr.message); setLoading(false); return; }
    onAuthenticated();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">AFRICAN HOLDING GROUPS</h1>
          <div className="flex justify-center items-center my-4">
            <img src="/logo.png" alt="AHG" className="w-20 h-20 object-contain" />
          </div>
          <p className="text-green-200 text-sm">Weekly Planning System</p>
          <p className="text-xl font-semibold text-orange-300 tracking-wide mt-1">Think Big, Start Small, Act Now!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === m ? 'bg-green-700 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                onClick={() => { setMode(m); setError(''); }}>
                {m === 'login' ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Register</>}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="p-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your full name" />
                </div>
                {!isCEOEmail && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Department</label>
                    <div className="relative">
                      <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white pr-10">
                        <option value="">Select department...</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${isCEOEmail ? 'border-orange-400 focus:ring-orange-400 bg-orange-50' : 'border-gray-200 focus:ring-green-500'}`}
                  placeholder="Enter your email" />
                {isCEOEmail && <ShieldCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500" />}
              </div>
              {isCEOEmail && <p className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1"><ShieldCheck size={12} /> CEO administrator account</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-white-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 shadow-md">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'login' ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>
        </div>
        <p className="text-center text-green-300 text-xs mt-6">African Holding Groups — Internal Use Only</p>
      </div>
    </div>
  );
}
