import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, description, value, onChange }) => (
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

export const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    show_email: true,
    show_phone: true,
    show_cv_url: true,
    is_hidden: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
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

  const handleChange = async (field: string, value: boolean) => {
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

  return (
    <div className="mt-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Privacy Settings</h2>
        {saving && <span className="text-xs text-gray-500">Saving...</span>}
        {saved && <span className="text-xs text-green-400">Saved ✓</span>}
      </div>
      <Toggle
        label="Show email to recruiters"
        description="When OFF — email is completely hidden, even Premium recruiters cannot see it"
        value={settings.show_email}
        onChange={(v) => handleChange('show_email', v)}
      />
      <Toggle
        label="Show phone to recruiters"
        description="When OFF — phone number is completely hidden from all viewers"
        value={settings.show_phone}
        onChange={(v) => handleChange('show_phone', v)}
      />
      <Toggle
        label="Show profile URL"
        description="When OFF — your aircraft.engineer/cv/XXXX link is hidden"
        value={settings.show_cv_url}
        onChange={(v) => handleChange('show_cv_url', v)}
      />
      <Toggle
        label="Profile visible to public"
        description="When OFF — your CV is completely hidden, only you can see it"
        value={!settings.is_hidden}
        onChange={(v) => handleChange('is_hidden', !v)}
      />
    </div>
  );
};

export default PrivacySettings;
