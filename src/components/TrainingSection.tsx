import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const TABS = ['Academic', 'Type Training', 'Continuous', 'Additional', 'Post Graduate'];

const CONTINUOUS_COURSES = [
  'Human Factors','Fuel Tank Safety','ETOPS','SMS','Part 145',
  'EWIS','Lithium Battery','Runway Safety','Wildlife Hazard',
  'Dangerous Goods','Fire Safety','Security Awareness','Other'
];

const TYPE_LEVELS = ['Level I — Familiarisation','Level II — Practical','Level III — Certifying'];
const ACADEMIC_LEVELS = ['Certificate','Diploma','Undergraduate','Other'];
const LANGUAGES = ['English','Arabic','French','German','Spanish','Mandarin','Hindi','Malay','Filipino','Other'];
const LANG_LEVELS = ['Basic','Conversational','Professional','Native'];

interface Training {
  id: string;
  tab: string;
  title: string;
  institution: string;
  level: string;
  aircraft_type: string;
  engine_type: string;
  date_completed: string;
  expiry_date: string;
  language: string;
  language_level: string;
  other_specify: string;
}

const empty = (tab: string): Omit<Training, 'id'> => ({
  tab, title: '', institution: '', level: '',
  aircraft_type: '', engine_type: '',
  date_completed: '', expiry_date: '',
  language: '', language_level: '',
  other_specify: '',
});

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

const getExpiryStatus = (expiry: string) => {
  if (!expiry) return null;
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: 'Expired', class: 'bg-red-500/20 text-red-400' };
  if (days <= 50) return { label: `Expires in ${days} days`, class: 'bg-amber-500/20 text-amber-400' };
  return { label: `Valid until ${new Date(expiry).toLocaleDateString('en-GB')}`, class: 'bg-green-500/20 text-green-400' };
};

export const TrainingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Academic');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty('Academic'));
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchTrainings(); }, []);

  const fetchTrainings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('trainings').select('*').eq('user_id', user.id).order('date_completed', { ascending: false });
    if (data) setTrainings(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (editingId) {
        await supabase.from('trainings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId);
      } else {
        const payload = { ...form, tab: activeTab, user_id: user.id }; console.log('Sending:', payload); const { error: insertErr } = await supabase.from('trainings').insert(payload); if (insertErr) { alert('Insert error: ' + insertErr.message); throw insertErr; }
      }
      await fetchTrainings();
      setIsAdding(false);
      setEditingId(null);
      setForm(empty(activeTab));
    } catch (err: any) {       console.error('Save error:', err);       alert('Save failed: ' + (err?.message || JSON.stringify(err)));     } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this training? This cannot be undone.')) return;
    await supabase.from('trainings').delete().eq('id', id);
    await fetchTrainings();
  };

  const handleEdit = (t: Training) => {
    setForm({ tab: t.tab, title: t.title, institution: t.institution, level: t.level, aircraft_type: t.aircraft_type || '', engine_type: t.engine_type || '', date_completed: t.date_completed || '', expiry_date: t.expiry_date || '', language: t.language || '', language_level: t.language_level || '', other_specify: t.other_specify || '' });
    setEditingId(t.id);
    setActiveTab(t.tab);
    setIsAdding(true);
  };

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const tabTrainings = trainings.filter(t => t.tab === activeTab);
  const tabCount = (tab: string) => trainings.filter(t => t.tab === tab).length;

  const renderForm = () => {
    switch (activeTab) {
      case 'Academic':
        return <>
          <div><label className={labelClass}>Qualification / Course name</label>
            <input className={inputClass} placeholder="e.g. Diploma in Aircraft Maintenance Engineering" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label className={labelClass}>Level</label>
            <select className={inputClass} value={form.level} onChange={e => set('level', e.target.value)}>
              <option value="">Select level</option>
              {ACADEMIC_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select></div>
          <div><label className={labelClass}>Institution</label>
            <input className={inputClass} placeholder="e.g. Aircraft Engineering Academy" value={form.institution} onChange={e => set('institution', e.target.value)} /></div>
          <div><label className={labelClass}>Year completed</label>
            <input type="date" className={inputClass} value={form.date_completed} onChange={e => set('date_completed', e.target.value)} /></div>
        </>;

      case 'Type Training':
        return <>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Aircraft type</label>
              <input className={inputClass} placeholder="e.g. B737-800" value={form.aircraft_type} onChange={e => set('aircraft_type', e.target.value)} /></div>
            <div><label className={labelClass}>Engine type</label>
              <input className={inputClass} placeholder="e.g. CFM56-7B" value={form.engine_type} onChange={e => set('engine_type', e.target.value)} /></div>
          </div>
          <div><label className={labelClass}>Training level</label>
            <select className={inputClass} value={form.level} onChange={e => set('level', e.target.value)}>
              <option value="">Select level</option>
              {TYPE_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select></div>
          <div><label className={labelClass}>Training institute</label>
            <input className={inputClass} placeholder="e.g. Boeing Training Academy" value={form.institution} onChange={e => set('institution', e.target.value)} /></div>
          <div><label className={labelClass}>Date completed</label>
            <input type="date" className={inputClass} value={form.date_completed} onChange={e => set('date_completed', e.target.value)} /></div>
        </>;

      case 'Continuous':
        return <>
          <div><label className={labelClass}>Course</label>
            <select className={inputClass} value={form.title} onChange={e => set('title', e.target.value)}>
              <option value="">Select course</option>
              {CONTINUOUS_COURSES.map(c => <option key={c}>{c}</option>)}
            </select></div>
          {form.title === 'Other' && <div><label className={labelClass}>Please specify</label>
            <input className={inputClass} placeholder="Course name" value={form.other_specify} onChange={e => set('other_specify', e.target.value)} /></div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Date completed</label>
              <input type="date" className={inputClass} value={form.date_completed} onChange={e => set('date_completed', e.target.value)} /></div>
            <div><label className={labelClass}>Expiry date</label>
              <input type="date" className={inputClass} value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} /></div>
          </div>
        </>;

      case 'Additional':
        return <>
          <div><label className={labelClass}>Course / Training name</label>
            <input className={inputClass} placeholder="e.g. ICAO Dangerous Goods" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label className={labelClass}>Provider / Institution</label>
            <input className={inputClass} placeholder="e.g. IATA Training" value={form.institution} onChange={e => set('institution', e.target.value)} /></div>
          <div><label className={labelClass}>Date completed</label>
            <input type="date" className={inputClass} value={form.date_completed} onChange={e => set('date_completed', e.target.value)} /></div>
        </>;

      case 'Post Graduate':
        return <>
          <div><label className={labelClass}>Qualification</label>
            <input className={inputClass} placeholder="e.g. Executive Masters in Digital Marketing" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label className={labelClass}>Institution</label>
            <input className={inputClass} placeholder="e.g. University name" value={form.institution} onChange={e => set('institution', e.target.value)} /></div>
          <div><label className={labelClass}>Year completed</label>
            <input type="date" className={inputClass} value={form.date_completed} onChange={e => set('date_completed', e.target.value)} /></div>
          <div className="border-t border-gray-700 pt-3 mt-1">
            <p className="text-xs font-medium text-gray-400 mb-3">Language Proficiency</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Language</label>
                <select className={inputClass} value={form.language} onChange={e => set('language', e.target.value)}>
                  <option value="">Select language</option>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select></div>
              <div><label className={labelClass}>Level</label>
                <select className={inputClass} value={form.language_level} onChange={e => set('language_level', e.target.value)}>
                  <option value="">Select level</option>
                  {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select></div>
            </div>
          </div>
        </>;

      default: return null;
    }
  };

  return (
    <div className="mt-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Training & Education</h2>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setEditingId(null); setForm(empty(activeTab)); }}
            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-4">
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setIsAdding(false); setForm(empty(tab)); }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
            {tab} {tabCount(tab) > 0 && <span className="ml-1 opacity-70">({tabCount(tab)})</span>}
          </button>
        ))}
      </div>

      {/* Training cards */}
      {tabTrainings.map(t => {
        const status = getExpiryStatus(t.expiry_date);
        return (
          <div key={t.id} className="mb-3 border border-gray-600 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-700 cursor-pointer"
              onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">
                    {t.tab === 'Type Training' ? `${t.aircraft_type}${t.engine_type ? ' / ' + t.engine_type : ''}` : (t.title === 'Other' ? t.other_specify : t.title)}
                  </span>
                  {t.level && <span className="text-xs text-gray-400">{t.level}</span>}
                  {status && <span className={`text-xs px-2 py-0.5 rounded-full ${status.class}`}>{status.label}</span>}
                </div>
                {t.institution && <p className="text-xs text-gray-500 mt-0.5">{t.institution}{t.date_completed ? ` · ${new Date(t.date_completed).getFullYear()}` : ''}</p>}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={e => { e.stopPropagation(); handleEdit(t); }} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">Edit</button>
                <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
                {expandedId === t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
            {expandedId === t.id && (
              <div className="px-4 py-3 text-sm text-gray-300 space-y-1">
                {t.tab === 'Type Training' && <p><span className="text-gray-500">Level:</span> {t.level}</p>}
                {t.institution && <p><span className="text-gray-500">Institution:</span> {t.institution}</p>}
                {t.date_completed && <p><span className="text-gray-500">Completed:</span> {new Date(t.date_completed).toLocaleDateString('en-GB')}</p>}
                {t.language && <p><span className="text-gray-500">Language:</span> {t.language} — {t.language_level}</p>}
              </div>
            )}
          </div>
        );
      })}

      {tabTrainings.length === 0 && !isAdding && (
        <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} entries yet</p>
      )}

      {/* Form */}
      {isAdding && (
        <div className="border border-blue-500/30 rounded-lg p-5 bg-gray-800/50 space-y-3">
          <h3 className="text-sm font-medium text-blue-400">{editingId ? 'Edit' : 'Add'} {activeTab}</h3>
          {renderForm()}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); setForm(empty(activeTab)); }}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSection;
