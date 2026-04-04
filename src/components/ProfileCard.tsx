import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ExperienceSection } from './ExperienceSection';
import { LicenseSection } from './LicenseSection';
import { Loader2, Settings, User, LogOut, KeyRound, Trash2, EyeOff, ChevronDown } from 'lucide-react';

export const ProfileCard: React.FC<{ profile: any }> = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-64 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-64 flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Welcome to AECircle</h2>
      <p className="text-gray-400 mb-6">You haven't created your engineer profile yet.</p>
      <button onClick={() => navigate('/cv/create')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
        Create my profile
      </button>
    </div>
  );

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const age = profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000) : null;

  const infoLine = [
    age ? `${age} years` : null,
    profile.citizenship,
    profile.sex,
  ].filter(Boolean).join(' · ');

  return (
    <div className="max-w-4xl mx-auto">

      {/* Profile header card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <div className="flex items-start gap-5">

          {/* Square photo */}
          <div className="w-24 h-24 rounded-lg bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
            {profile.photo_url
              ? <img src={profile.photo_url} alt={fullName} className="w-full h-full object-cover" />
              : <span>{fullName.charAt(0).toUpperCase() || '?'}</span>
            }
          </div>

          {/* Name and info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">{fullName}</h1>
                <p className="text-blue-400 font-medium">{profile.designation}</p>
                <p className="text-gray-400 text-sm mt-0.5">{infoLine}</p>
                {profile.residency_status && <p className="text-gray-500 text-sm">{profile.residency_status}</p>}
                {profile.username && (
                  <a href={`/cv/${profile.username}`} className="text-blue-500 text-xs mt-1 hover:text-blue-400 block">
                    aircraft.engineer/cv/{profile.username}
                  </a>
                )}
              </div>

              {/* Settings dropdown */}
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
                  <Settings className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button onClick={() => { navigate('/cv/create'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                      <User className="w-4 h-4" /> Edit profile
                    </button>
                    <button onClick={() => { navigate('/change-password'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                      <KeyRound className="w-4 h-4" /> Change password
                    </button>
                    <div className="border-t border-gray-700" />
                    <button onClick={() => { setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                      <EyeOff className="w-4 h-4" /> Hide my profile
                    </button>
                    <div className="border-t border-gray-700" />
                    {!deleteConfirm ? (
                      <button onClick={() => setDeleteConfirm(true)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete account
                      </button>
                    ) : (
                      <div className="px-4 py-3 bg-red-500/10">
                        <p className="text-xs text-red-400 mb-2">Are you sure? This cannot be undone.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirm(false)}
                            className="flex-1 text-xs py-1.5 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors">
                            Cancel
                          </button>
                          <button onClick={handleDeleteAccount}
                            className="flex-1 text-xs py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                            Yes, delete
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-gray-700" />
                    <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contact info — premium blurred */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📧</span>
                <span className="blur-sm select-none">hidden@email.com</span>
                <span className="text-blue-500 text-xs ml-1 cursor-pointer hover:text-blue-400">[Premium]</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📞</span>
                <span className="blur-sm select-none">+000 000 0000</span>
                <span className="text-blue-500 text-xs ml-1 cursor-pointer hover:text-blue-400">[Premium]</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic sections */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <ExperienceSection />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
        <LicenseSection />
      </div>

    </div>
  );
};

export default ProfileCard;
