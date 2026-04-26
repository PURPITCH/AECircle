import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, KeyRound, Trash2, Loader2, ChevronLeft } from 'lucide-react';

const Toggle: React.FC<{ label: string; description: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-gray-600'}`}>
      <span className={`inline-block w-4 h-4 mt-0.5 bg-white rounded-full shadow transform transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

export const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [settings, setSettings] = useState({
    show_email: true,
    show_phone: true,
    show_cv_url: true,
    is_hidden: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setCurrentEmail(user.email || '');
      const { data } = await supabase.from('profiles')
        .select('show_email, show_phone, show_cv_url, is_hidden')
        .eq('id', user.id).maybeSingle();
      if (data) setSettings({
        show_email: data.show_email ?? true,
        show_phone: data.show_phone ?? true,
        show_cv_url: data.show_cv_url ?? true,
        is_hidden: data.is_hidden ?? false,
      });
    };
    fetchData();
  }, []);

  const handleToggle = async (field: string, value: boolean) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    setSaving(true);
    setSaved(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({ ...newSettings, updated_at: new Date().toISOString() }).eq('id', user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/cv')} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        </div>

        {/* Account */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <div>
                <p className="text-sm font-medium text-white">Email address</p>
                <p className="text-xs text-gray-500 mt-0.5">{currentEmail}</p>
              </div>
              <button onClick={() => navigate('/change-email')}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <Mail className="w-4 h-4" /> Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-white">Password</p>
                <p className="text-xs text-gray-500 mt-0.5">Change your login password</p>
              </div>
              <button onClick={() => navigate('/reset-password')}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <KeyRound className="w-4 h-4" /> Change
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Privacy Settings</h2>
            {saving && <span className="text-xs text-gray-500">Saving...</span>}
            {saved && <span className="text-xs text-green-400">Saved ✓</span>}
          </div>
          <Toggle
            label="Show email to recruiters"
            description="When OFF — completely hidden, even Premium recruiters cannot see it"
            value={settings.show_email}
            onChange={(v) => handleToggle('show_email', v)}
          />
          <Toggle
            label="Show phone to recruiters"
            description="When OFF — completely hidden from all viewers"
            value={settings.show_phone}
            onChange={(v) => handleToggle('show_phone', v)}
          />
          <Toggle
            label="Show profile URL"
            description="When OFF — your aircraft.engineer/cv/XXXX link is hidden"
            value={settings.show_cv_url}
            onChange={(v) => handleToggle('show_cv_url', v)}
          />
          <Toggle
            label="Profile visible to public"
            description="When OFF — your CV is completely hidden, only you can see it"
            value={!settings.is_hidden}
            onChange={(v) => handleToggle('is_hidden', !v)}
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800 rounded-xl border border-red-500/20 p-6">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h2>
          {!deleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete account</p>
                <p className="text-xs text-gray-500 mt-0.5">Permanently delete your profile and all data</p>
              </div>
              <button onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/30 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-400">This cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
              <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="block w-full bg-gray-700 border border-red-500/30 rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <div className="flex gap-3">
                <button onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteInput !== 'DELETE' || deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete my account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
