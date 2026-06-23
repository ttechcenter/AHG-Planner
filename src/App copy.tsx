import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Profile } from './types';
import AuthPage from './components/AuthPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import CEODashboard from './components/CEODashboard';
import { LogOut, User, Loader2, Bell } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const CEO_EMAIL = 'ceo@gmail.com';
  
  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data ?? null;
  };

  useEffect(() => {
    const setupUser = async (currentUser: SupabaseUser | null) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Try to fetch existing profile
      let { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      // If no profile exists, create one
      if (!existingProfile) {
        const email = currentUser.email?.toLowerCase() || '';
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            full_name:
              currentUser.user_metadata.full_name ||
              currentUser.user_metadata.name ||
              'User',
            email,
            role: email === CEO_EMAIL ? 'ceo' : 'employee',
            department: '',
          })
          .select('*')
          .single();

        if (!error && newProfile) {
          existingProfile = newProfile;
        }
      }

      setProfile(existingProfile);
      setLoading(false);
    };

    // Initialize session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setupUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setupUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setupUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="African Holding Groups"
            className="w-20 h-20 object-contain mx-auto"
          />
          <Loader2 size={24} className="animate-spin text-green-600 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <AuthPage
        onAuthenticated={async () => {
          setLoading(true);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            const userProfile = await loadProfile(session.user.id);
            setProfile(userProfile);
          }
          setLoading(false);
        }}
      />
    );
  }

  const isCEO = profile.role === 'ceo';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="bg-green-900 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow overflow-hidden">
                <img
                  src="/logo.png"
                  alt="African Holding Groups"
                  className="w-full h-full object-contain"/>
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-bold text-sm leading-none tracking-wide">
                  AFRICAN HOLDING GROUPS
                </p>
                <p className="text-green-300 text-xs">Weekly Planning System</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Role badge */}
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                  isCEO
                    ? 'bg-orange-500 text-white'
                    : 'bg-green-700 text-green-100'
                }`}
              >
                {isCEO ? 'CEO View' : 'Employee'}
              </span>

              {/* User info */}
              <div className="flex items-center gap-2 bg-green-800 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-white text-sm font-medium hidden md:block max-w-32 truncate">
                  {profile.full_name}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-green-300 hover:text-white text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-green-800"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 border-b border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-white font-bold text-xl">
                {isCEO ? 'CEO Dashboard' : 'My Weekly Plan'}
              </h1>
              <p className="text-green-300 text-sm mt-0.5">
                {isCEO
                  ? 'Overview of all employee weekly plans'
                  : `Welcome back, ${profile.full_name?.split(' ')[0] || 'User'}!`}
              </p>
            </div>

            {!isCEO && profile.department && (
              <div className="flex items-center gap-2 bg-green-900 bg-opacity-50 rounded-lg px-3 py-2">
                <User size={14} className="text-green-400" />
                <span className="text-green-200 text-sm">{profile.department}</span>
              </div>
            )}

            {isCEO && (
              <div className="flex items-center gap-2 bg-orange-500 bg-opacity-20 border border-orange-400 border-opacity-30 rounded-lg px-3 py-2">
                <Bell size={14} className="text-orange-300" />
                <span className="text-orange-200 text-sm font-medium">CEO Access — All Plans Visible</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {isCEO ? (
          <CEODashboard profile={profile} />
        ) : (
          <EmployeeDashboard profile={profile} />
        ) }
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-green-400 text-xs text-center py-3 px-4">
       Developed By: African Holding Groups - IT Department <br/>
        &copy; {new Date().getFullYear()} African Holding Groups &mdash; Internal Use Only &mdash; All Rights Reserved
      </footer>
    </div>
  );
}