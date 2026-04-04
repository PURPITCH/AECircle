import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";
const LEVELS = ['I', 'II', 'III'];
const LANG_LEVELS = ['Basic', 'Conversational', 'Professional', 'Native'];
const ACADEMIC_LEVELS = ['Certificate', 'Diploma', 'Undergraduate', 'Post Graduate Diploma', 'Masters', 'PhD', 'Other'];
const SUBSECTIONS = ['academic', 'type_training', 'continuous', 'additional', 'language'] as const;
type SubSection = typeof SUBSECTIONS[number];

const LABELS: Record<SubSection, string> = {
  academic: 'Academic / Basic Training',
  type_training: 'Type Training',
  continuous: 'Continuous Training',
  additional: 'Additional Training',
  language: 'Language Proficiency',
};

const PRIORITY: Record<SubSection, boolean> = {
  academic: true, type_training: true, continuous: true,
  additional: false, language: false,
};

const daysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
};

const expiryBadge = (dateStr: string) => {
  const days = daysUntil(dateStr);
  if (days === null) return null;
  if (days < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Expired</span>;
  if (days <= 50) return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Expires in {days}d</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Valid</span>;
};

export const TrainingSection: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<SubSection>('academic');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('trainings').select('*').eq('user_id', user.id).order('created_at');
    if (data) setItems(data);
  };

  const set = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const emptyForm = (tab: SubSection) => {
    const base = { subsection: tab };
    if (tab === 'academic') return { ...base, qualification: '', level: 'Certificate', institution: '', year: '' };
    if (tab === 'type_training') return { ...base, aircraft_type: '', engine_type: '', category: '', level: 'III', institute: '', location: '', cert_date: '', cert_number: '' };
    if (tab === 'continuous') return { ...base, course_name: '', expiry_date: '' };
    if (tab === 'additional') return { ...base, course_name: '', provider: '', date: '' };
    if (tab === 'language') return { ...base, language: '', proficiency: 'Professional' };
    return base;
  };

  const startAdd = () => { setForm(emptyForm(activeTab)); setIsAdding(true); setEditingId(null); };

  const handleEdit = (item: any) => {
    setActiveTab(item.subsection);
    setForm({ ...item });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (editingId) {
        await supabase.from('trainings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId);
      } else {
        await supabase.from('trainings').insert({ ...form, user_id: user.id });
      }
      await fetchItems();
      setIsAdding(false);
      setEditingId(null);
      setForm({});
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('trainings').delete().eq('id', id);
    await fetchItems();
  };

  const tabItems = items.filter(i => i.subsection === activeTab);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const renderItem = (item: any) => {
    const expanded = expandedId === item.id;
    const sub: SubSection = item.subsection;
    return (
      <div key={item.id} className="mb-3 border border-gray-600 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-700 cursor-pointer"
          onClick={() => setExpandedId(expanded ? null : item.id)}>
          <div className="flex-1 min-w-0">
            {sub === 'academic' && (
              <div>
                <span className="font-medium text-white text-sm">{item.qualification}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 ml-2">{item.level}</span>
                <div className="text-xs text-gray-500 mt-0.5">{item.institution}{item.year ? ` · ${item.year}` : ''}</div>
              </div>
            )}
            {sub === 'type_training' && (
              <div>
                <span className="font-medium text-white text-sm">{item.aircraft_type}{item.engine_type ? ` / ${item.engine_type}` : ''}</span>
                {item.category && <span className="text-gray-400 text-sm ml-2">{item.category}</span>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 ml-2">Level {item.level}</span>
                <div className="text-xs text-gray-500 mt-0.5">{item.institute}{item.location ? ` — ${item.location}` : ''}{item.cert_date ? ` · ${formatDate(item.cert_date)}` : ''}</div>
              </div>
            )}
            {sub === 'continuous' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white text-sm">{item.course_name}</span>
                {item.expiry_date && expiryBadge(item.expiry_date)}
                {item.expiry_date && <span className="text-xs text-gray-500">· {formatDate(item.expiry_date)}</span>}
              </div>
            )}
            {sub === 'additional' && (
              <div>
                <span className="font-medium text-white text-sm">{item.course_name}</span>
                <div className="text-xs text-gray-500 mt-0.5">{item.provider}{item.date ? ` · ${formatDate(item.date)}` : ''}</div>
              </div>
            )}
            {sub === 'language' && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{item.language}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">{item.proficiency}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={e => { e.stopPropagation(); handleEdit(item); }} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">Edit</button>
            <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
        {expanded && sub === 'type_training' && (
          <div className="px-4 py-3 text-sm text-gray-300 space-y-1">
            {item.cert_number && <p><span className="text-gray-500">Certificate No:</span> {item.cert_number}</p>}
            {item.location && <p><span className="text-gray-500">Location:</span> {item.location}</p>}
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => {
    const sub = activeTab;
    return (
      <div className="border border-blue-500/30 rounded-lg p-5 bg-gray-800/50 mt-3">
        <h3 className="text-sm font-medium text-blue-400 mb-4">{editingId ? 'Edit' : 'Add'} {LABELS[sub]}</h3>
        <div className="grid grid-cols-2 gap-3">
          {sub === 'academic' && <>
            <div className="col-span-2"><label className={labelClass}>Qualification</label><input className={inputClass} placeholder="e.g. Diploma in Aircraft Maintenance" value={form.qualification || ''} onChange={e => set('qualification', e.target.value)} /></div>
            <div><label className={labelClass}>Level</label><select className={inputClass} value={form.level || 'Certificate'} onChange={e => set('level', e.target.value)}>{ACADEMIC_LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
            <div><label className={labelClass}>Year</label><input type="number" className={inputClass} placeholder="2010" value={form.year || ''} onChange={e => set('year', e.target.value)} /></div>
            <div className="col-span-2"><label className={labelClass}>Institution</label><input className={inputClass} placeholder="e.g. Hindustan Institute of Technology" value={form.institution || ''} onChange={e => set('institution', e.target.value)} /></div>
          </>}
          {sub === 'type_training' && <>
            <div><label className={labelClass}>Aircraft type</label><input className={inputClass} placeholder="B737-800" value={form.aircraft_type || ''} onChange={e => set('aircraft_type', e.target.value)} /></div>
            <div><label className={labelClass}>Engine type</label><input className={inputClass} placeholder="CFM56-7B" value={form.engine_type || ''} onChange={e => set('engine_type', e.target.value)} /></div>
            <div><label className={labelClass}>Category</label><input className={inputClass} placeholder="e.g. B1.1" value={form.category || ''} onChange={e => set('category', e.target.value)} /></div>
            <div><label className={labelClass}>Level</label><select className={inputClass} value={form.level || 'III'} onChange={e => set('level', e.target.value)}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
            <div><label className={labelClass}>Training institute</label><input className={inputClass} placeholder="e.g. CAE" value={form.institute || ''} onChange={e => set('institute', e.target.value)} /></div>
            <div><label className={labelClass}>Location</label><input className={inputClass} placeholder="e.g. Dubai" value={form.location || ''} onChange={e => set('location', e.target.value)} /></div>
            <div><label className={labelClass}>Certificate date</label><input type="date" className={inputClass} value={form.cert_date || ''} onChange={e => set('cert_date', e.target.value)} /></div>
            <div><label className={labelClass}>Certificate number</label><input className={inputClass} placeholder="e.g. CAI040426BB" value={form.cert_number || ''} onChange={e => set('cert_number', e.target.value)} /></div>
          </>}
          {sub === 'continuous' && <>
            <div className="col-span-2"><label className={labelClass}>Course name</label><input className={inputClass} placeholder="e.g. Human Factors" value={form.course_name || ''} onChange={e => set('course_name', e.target.value)} /></div>
            <div className="col-span-2"><label className={labelClass}>Expiry date</label><input type="date" className={inputClass} value={form.expiry_date || ''} onChange={e => set('expiry_date', e.target.value)} /></div>
          </>}
          {sub === 'additional' && <>
            <div className="col-span-2"><label className={labelClass}>Course name</label><input className={inputClass} placeholder="e.g. ICAO Dangerous Goods" value={form.course_name || ''} onChange={e => set('course_name', e.target.value)} /></div>
            <div><label className={labelClass}>Provider</label><input className={inputClass} placeholder="e.g. IATA" value={form.provider || ''} onChange={e => set('provider', e.target.value)} /></div>
            <div><label className={labelClass}>Date</label><input type="date" className={inputClass} value={form.date || ''} onChange={e => set('date', e.target.value)} /></div>
          </>}
          {sub === 'language' && <>
            <div><label className={labelClass}>Language</label><input className={inputClass} placeholder="e.g. Arabic" value={form.language || ''} onChange={e => set('language', e.target.value)} /></div>
            <div><label className={labelClass}>Proficiency</label><select className={inputClass} value={form.proficiency || 'Professional'} onChange={e => set('proficiency', e.target.value)}>{LANG_LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
          </>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
          </button>
          <button onClick={() => { setIsAdding(false); setEditingId(null); setForm({}); }} className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400"><BookOpen className="w-5 h-5" /> Training & Education</h2>
        {!isAdding && <button onClick={startAdd} className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"><Plus className="w-4 h-4" /> Add</button>}
      </div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {SUBSECTIONS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setIsAdding(false); setEditingId(null); }}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'} ${PRIORITY[tab] ? '' : 'opacity-70'}`}>
            {LABELS[tab]}
            {items.filter(i => i.subsection === tab).length > 0 && <span className="ml-1 text-xs opacity-70">({items.filter(i => i.subsection === tab).length})</span>}
          </button>
        ))}
      </div>
      {tabItems.map(renderItem)}
      {tabItems.length === 0 && !isAdding && <p className="text-gray-500 text-sm">No {LABELS[activeTab].toLowerCase()} added yet</p>}
      {isAdding && renderForm()}
    </div>
  );
};

export default TrainingSection;
