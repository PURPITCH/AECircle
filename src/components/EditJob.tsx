import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Eye, EyeOff, Plus, X } from 'lucide-react';

const CATEGORIES = ['Certifying', 'Non-Certifying', 'Post Holder', 'Managerial', 'Compliance & Safety', 'Other'];
const DEPARTMENTS = ['Line','Base','Line & Base','Workshop','NDT','Training','Tech Pub','Planning','Compliance','Safety','Stores / Logistics','Other'];
const JOB_TYPES = ['Full time', 'Contract', 'Freelance'];
const PART66_CATS = ['A','B1.1','B1.2','B1.3','B1.4','B2','C','Other'];

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-300 mb-1";

const CheckboxGroup: React.FC<{ options: string[]; selected: string[]; onChange: (val: string[]) => void }> = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button key={opt} type="button"
        onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selected.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white border border-gray-600'}`}>
        {opt}
      </button>
    ))}
  </div>
);

export const EditJob: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSalary, setShowSalary] = useState(false);
  const [otherRequirements, setOtherRequirements] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', categories: [] as string[], departments: [] as string[],
    job_types: [] as string[], location: '', is_remote: false,
    part66_categories: [] as string[], license_authority: '',
    type_endorsement: '', other_licenses: [] as string[],
    experience_type: '', experience_min: '', experience_max: '',
    salary_range: '', working_hours: '', description: '', deadline: '',
    visa_sponsorship: false, visa_requirements: '',
    apply_inhouse: true, apply_external_link: '', apply_email: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('job_posts').select('*').eq('id', id).maybeSingle();
      if (!data) { navigate('/co/jobs'); return; }
      
      // Extract part66 categories from licenses
      const part66 = (data.licenses || []).filter((l: string) => l.startsWith('EASA Part 66')).map((l: string) => l.replace('EASA Part 66 ', ''));
      const others = (data.licenses || []).filter((l: string) => !l.startsWith('EASA Part 66'));

      setShowSalary(data.show_salary || false);
      setForm({
        title: data.title || '',
        categories: data.categories || [],
        departments: data.departments || [],
        job_types: data.job_types || [],
        location: data.location || '',
        is_remote: data.is_remote || false,
        part66_categories: part66,
        license_authority: data.license_authority || '',
        type_endorsement: data.aircraft_types || '',
        other_licenses: others,
        experience_type: data.experience_type || '',
        experience_min: data.experience_min?.toString() || '',
        experience_max: data.experience_max?.toString() || '',
        salary_range: data.salary_range || '',
        working_hours: data.working_hours || '',
        description: data.description || '',
        deadline: data.deadline || '',
        visa_sponsorship: data.visa_sponsorship || false,
        visa_requirements: data.visa_requirements || '',
        apply_inhouse: data.apply_inhouse ?? true,
        apply_external_link: data.apply_external_link || '',
        apply_email: data.apply_email || '',
      });
      setOtherRequirements(data.other_requirements || []);
      setIsFetching(false);
    };
    fetch();
  }, [id]);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const addRequirement = () => setOtherRequirements(prev => [...prev, '']);
  const updateRequirement = (i: number, val: string) => setOtherRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  const removeRequirement = (i: number) => setOtherRequirements(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const allLicenses = [...form.part66_categories.map(c => `EASA Part 66 ${c}`), ...form.other_licenses];
      const { error } = await supabase.from('job_posts').update({
        title: form.title, categories: form.categories, departments: form.departments,
        job_types: form.job_types, location: form.location, is_remote: form.is_remote,
        licenses: allLicenses, aircraft_types: form.type_endorsement || null,
        license_authority: form.license_authority || null,
        experience_type: form.experience_type || null,
        experience_min: form.experience_min ? parseInt(form.experience_min) : null,
        experience_max: form.experience_max ? parseInt(form.experience_max) : null,
        salary_range: showSalary ? form.salary_range : null, show_salary: showSalary,
        description: form.description, working_hours: form.working_hours || null,
        deadline: form.deadline || null, visa_sponsorship: form.visa_sponsorship,
        visa_requirements: form.visa_requirements || null, apply_inhouse: form.apply_inhouse,
        apply_external_link: form.apply_external_link || null, apply_email: form.apply_email || null,
        other_requirements: otherRequirements.filter(r => r.trim()),
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      navigate('/co/jobs');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  if (isFetching) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/co/jobs')} className="text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-bold text-white">Edit job post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Job Details</h2>
            <div><label className={labelClass}>Job title *</label><input required className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div><label className={labelClass}>Job category</label><CheckboxGroup options={CATEGORIES} selected={form.categories} onChange={v => set('categories', v)} /></div>
            <div><label className={labelClass}>Department</label><CheckboxGroup options={DEPARTMENTS} selected={form.departments} onChange={v => set('departments', v)} /></div>
            <div><label className={labelClass}>Job type</label><CheckboxGroup options={JOB_TYPES} selected={form.job_types} onChange={v => set('job_types', v)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Location</label><input className={inputClass} value={form.location} onChange={e => set('location', e.target.value)} /></div>
              <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={form.is_remote} onChange={e => set('is_remote', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" /><label className="text-gray-300 text-sm">Remote / Hybrid</label></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">License Requirements</h2>
            <div><label className={labelClass}>EASA Part 66 Category</label><CheckboxGroup options={PART66_CATS} selected={form.part66_categories} onChange={v => set('part66_categories', v)} /></div>
            {form.part66_categories.includes('Other') && <div><label className={labelClass}>Other license</label><input className={inputClass} placeholder="e.g. FAA A&P, GCAA CAR 66..." value={form.other_licenses.join(', ')} onChange={e => set('other_licenses', [e.target.value])} /></div>}
            <div><label className={labelClass}>Issuing authority</label><input className={inputClass} placeholder="e.g. GCAA UAE, EASA, FAA..." value={form.license_authority} onChange={e => set('license_authority', e.target.value)} /></div>
            <div><label className={labelClass}>Type endorsement requirement</label><input className={inputClass} placeholder="e.g. B737-800/CFM56-7B endorsed..." value={form.type_endorsement} onChange={e => set('type_endorsement', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Experience Required</h2>
            <div><label className={labelClass}>Type of experience</label><input className={inputClass} placeholder="e.g. certifying, base maintenance, auditing..." value={form.experience_type} onChange={e => set('experience_type', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Min years</label><input type="number" min="0" max="50" className={inputClass} value={form.experience_min} onChange={e => set('experience_min', e.target.value)} /></div>
              <div><label className={labelClass}>Max years</label><input type="number" min="0" max="50" className={inputClass} value={form.experience_max} onChange={e => set('experience_max', e.target.value)} /></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Compensation & Hours</h2>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Salary range</label>
                <button type="button" onClick={() => setShowSalary(!showSalary)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                  {showSalary ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
              </div>
              {showSalary && <input className={inputClass} placeholder="e.g. AED 8,000–12,000/month" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} />}
            </div>
            <div><label className={labelClass}>Working hours</label><input className={inputClass} value={form.working_hours} onChange={e => set('working_hours', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Description</h2>
            <div>
              <label className={labelClass}>Description <span className="text-gray-500 text-xs">(max 2000)</span></label>
              <textarea className={inputClass} rows={8} value={form.description} onChange={e => set('description', e.target.value)} maxLength={2000} />
              <p className="text-xs text-gray-600 mt-1">{form.description.length}/2000</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Other requirements</label>
                <button type="button" onClick={addRequirement} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus className="w-3 h-3" /> Add</button>
              </div>
              {otherRequirements.map((req, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={inputClass} value={req} onChange={e => updateRequirement(i, e.target.value)} />
                  <button type="button" onClick={() => removeRequirement(i)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div><label className={labelClass}>Application deadline</label><input type="date" className={inputClass} value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Visa & Work Permit</h2>
            <div className="flex items-center gap-3"><input type="checkbox" checked={form.visa_sponsorship} onChange={e => set('visa_sponsorship', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" /><label className="text-gray-300 text-sm">Visa sponsorship available</label></div>
            <div><label className={labelClass}>Work permit requirements</label><input className={inputClass} value={form.visa_requirements} onChange={e => set('visa_requirements', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Application Method</h2>
            <div className="flex items-center gap-3"><input type="checkbox" checked={form.apply_inhouse} onChange={e => set('apply_inhouse', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" /><label className="text-gray-300 text-sm">Apply via AECircle <span className="text-blue-400 text-xs">— Recommended</span></label></div>
            <div><label className={labelClass}>External link</label><input className={inputClass} placeholder="https://..." value={form.apply_external_link} onChange={e => set('apply_external_link', e.target.value)} /></div>
            <div><label className={labelClass}>Email applications to</label><input type="email" className={inputClass} placeholder="recruit@company.com" value={form.apply_email} onChange={e => set('apply_email', e.target.value)} /></div>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Saving...</> : 'Save changes'}
            </button>
            <button type="button" onClick={() => navigate('/co/jobs')} className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
