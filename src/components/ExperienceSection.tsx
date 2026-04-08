import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

const DEPARTMENTS = ['Line','Base','Line & Base','Workshop','Tech Pub','Planning','Compliance','Safety','Stores / Logistics','Other'];
const CATEGORIES = ['Certifying','Non-Certifying','Post Holder','Auditing'];
const SECTION_ORDER = ['Post Holder','Certifying','Non-Certifying','Auditing'];

interface Experience {
  id: string;
  company: string;
  location: string;
  role: string;
  department: string;
  department_other: string;
  category: string;
  aircraft_types: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  certifying_tasks: number;
}

const empty = (): Omit<Experience, 'id'> => ({
  company: '', location: '', role: '', department: 'Line',
  department_other: '', category: 'Certifying', aircraft_types: '',
  start_date: '', end_date: '', is_current: false, certifying_tasks: 0,
});

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

const categoryColor: Record<string, string> = {
  'Post Holder': 'bg-purple-500/20 text-purple-300',
  'Certifying': 'bg-blue-500/20 text-blue-300',
  'Non-Certifying': 'bg-gray-500/20 text-gray-300',
  'Auditing': 'bg-amber-500/20 text-amber-300',
};

export const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchExperiences(); }, []);

  const fetchExperiences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('experiences').select('*').eq('user_id', user.id).order('is_current', { ascending: false }).order('start_date', { ascending: false });
    if (data) setExperiences(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const payload = { ...form, end_date: form.is_current ? null : form.end_date };
      if (editingId) {
        await supabase.from('experiences').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingId);
      } else {
        await supabase.from('experiences').insert({ ...payload, user_id: user.id });
      }
      await fetchExperiences();
      setIsAdding(false);
      setEditingId(null);
      setForm(empty());
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience? This cannot be undone.')) return;
    await supabase.from('experiences').delete().eq('id', id);
    await fetchExperiences();
  };

  const handleEdit = (exp: Experience) => {
    setForm({ company: exp.company, location: exp.location, role: exp.role, department: exp.department, department_other: exp.department_other || '', category: exp.category, aircraft_types: exp.aircraft_types || '', start_date: exp.start_date || '', end_date: exp.end_date || '', is_current: exp.is_current, certifying_tasks: exp.certifying_tasks || 0 });
    setEditingId(exp.id);
    setIsAdding(true);
  };

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';

  // Group by category in defined order
  const grouped = SECTION_ORDER.reduce((acc, cat) => {
    const items = experiences.filter(e => e.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, Experience[]>);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
         Experience
        </h2>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setEditingId(null); setForm(empty()); }}
            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" /> Add 
          </button>
        )}
      </div>

      {/* Grouped display */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-5">
          <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[category]}`}>{category}</span>
            Experience
          </h3>
          {items.map(exp => (
            <div key={exp.id} className="mb-3 border border-gray-600 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-700 cursor-pointer"
                onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">{exp.role}</span>
                    <span className="text-gray-400 text-sm">— {exp.company}</span>
                    {exp.location && <span className="text-gray-500 text-xs">{exp.location}</span>}
                    {exp.is_current && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Current</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                    {exp.aircraft_types && ` · ${exp.aircraft_types}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={e => { e.stopPropagation(); handleEdit(exp); }} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">Edit</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(exp.id); }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
                  {expandedId === exp.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expandedId === exp.id && (
                <div className="px-4 py-3 text-sm text-gray-300 space-y-1">
                  <p><span className="text-gray-500">Department:</span> {exp.department === 'Other' ? exp.department_other : exp.department}</p>
                  {exp.aircraft_types && <p><span className="text-gray-500">Aircraft:</span> {exp.aircraft_types}</p>}
                  {exp.certifying_tasks > 0 && <p><span className="text-gray-500">Certifying tasks:</span> {exp.certifying_tasks}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {experiences.length === 0 && !isAdding && (
        <p className="text-gray-500 text-sm">No experience added yet</p>
      )}

      {/* Add/Edit form */}
      {isAdding && (
        <div className="border border-blue-500/30 rounded-lg p-5 bg-gray-800/50">
          <h3 className="text-sm font-medium text-blue-400 mb-4">{editingId ? 'Edit experience' : 'Add experience'}</h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>Role / Position</label>
              <input className={inputClass} placeholder="e.g. Line Maintenance Engineer" value={form.role} onChange={e => set('role', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input className={inputClass} placeholder="e.g. MY Airlines" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} placeholder="e.g. London, UK" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <select className={inputClass} value={form.department} onChange={e => set('department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            {form.department === 'Other' && (
              <div>
                <label className={labelClass}>Please specify</label>
                <input className={inputClass} placeholder="Your department" value={form.department_other} onChange={e => set('department_other', e.target.value)} />
              </div>
            )}
            <div className="col-span-2">
              <label className={labelClass}>Aircraft types <span className="text-gray-600">(or N/A)</span></label>
              <input className={inputClass} placeholder="e.g. B737-800, A320-200" value={form.aircraft_types} onChange={e => set('aircraft_types', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" className={inputClass} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input type="date" className={inputClass} value={form.end_date} onChange={e => set('end_date', e.target.value)} disabled={form.is_current} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" id="is_current" checked={form.is_current} onChange={e => set('is_current', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
              <label htmlFor="is_current" className="text-gray-300 text-sm">I currently work here — End date shows as Present</label>
            </div>
            {form.category === 'Certifying' && (
              <div>
                <label className={labelClass}>Certifying tasks logged</label>
                <input type="number" className={inputClass} placeholder="0" value={form.certifying_tasks} onChange={e => set('certifying_tasks', parseInt(e.target.value) || 0)} />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save experience'}
            </button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); setForm(empty()); }}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;
