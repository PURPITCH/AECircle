import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Eye, EyeOff } from 'lucide-react';

const CATEGORIES = ['Certifying', 'Non-Certifying', 'Post Holder', 'Managerial', 'Compliance & Safety', 'Other'];
const DEPARTMENTS = ['Line','Base','Line & Base','Workshop','NDT','Training','Tech Pub','Planning','Compliance','Safety','Stores / Logistics','Other'];
const JOB_TYPES = ['Full time', 'Contract', 'Freelance'];
const LICENSES = ['EASA Part 66 B1.1','EASA Part 66 B1.2','EASA Part 66 B1.3','EASA Part 66 B1.4','EASA Part 66 B2','EASA Part 66 C','FAA A&P','GCAA CAR 66','CAAS','CAAM','DGCA','No license required','Other'];

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-300 mb-1";

const CheckboxGroup: React.FC<{
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}> = ({ options, selected, onChange }) => (
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

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showSalary, setShowSalary] = useState(false);
  const [form, setForm] = useState({
    title: '',
    categories: [] as string[],
    departments: [] as string[],
    job_types: [] as string[],
    location: '',
    is_remote: false,
    licenses: [] as string[],
    aircraft_types: '',
    experience_min: '',
    experience_max: '',
    salary_range: '',
    description: '',
    working_hours: '',
    deadline: '',
    visa_sponsorship: false,
    visa_requirements: '',
    apply_inhouse: true,
    apply_external_link: '',
    apply_email: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/co'); return; }
      const { data } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (!data) { navigate('/co/register'); return; }
      setCompanyId(data.id);
    };
    fetch();
  }, []);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const generateJobCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part1 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
    const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
    return `${part1}-${part2}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const job_code = generateJobCode();
      const { error } = await supabase.from('job_posts').insert({
        company_id: companyId,
        user_id: user.id,
        job_code,
        title: form.title,
        categories: form.categories,
        departments: form.departments,
        job_types: form.job_types,
        location: form.location,
        is_remote: form.is_remote,
        licenses: form.licenses,
        aircraft_types: form.aircraft_types || null,
        experience_min: form.experience_min ? parseInt(form.experience_min) : null,
        experience_max: form.experience_max ? parseInt(form.experience_max) : null,
        salary_range: showSalary ? form.salary_range : null,
        show_salary: showSalary,
        description: form.description,
        working_hours: form.working_hours || null,
        deadline: form.deadline || null,
        visa_sponsorship: form.visa_sponsorship,
        visa_requirements: form.visa_requirements || null,
        apply_inhouse: form.apply_inhouse,
        apply_external_link: form.apply_external_link || null,
        apply_email: form.apply_email || null,
        is_active: true,
        is_premium: false,
      });

      if (error) throw error;
      navigate('/co/jobs');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/co/jobs')} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Post a job</h1>
            <p className="text-gray-500 text-xs mt-0.5">Fill in the details — your post will be reviewed before going live</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Job basics */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Job Details</h2>

            <div>
              <label className={labelClass}>Job title *</label>
              <input required className={inputClass} placeholder="e.g. B737 Line Maintenance Engineer" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Job category</label>
              <CheckboxGroup options={CATEGORIES} selected={form.categories} onChange={v => set('categories', v)} />
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <CheckboxGroup options={DEPARTMENTS} selected={form.departments} onChange={v => set('departments', v)} />
            </div>

            <div>
              <label className={labelClass}>Job type</label>
              <CheckboxGroup options={JOB_TYPES} selected={form.job_types} onChange={v => set('job_types', v)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} placeholder="e.g. Dubai, UAE" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="remote" checked={form.is_remote} onChange={e => set('is_remote', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                <label htmlFor="remote" className="text-gray-300 text-sm">Remote / Hybrid available</label>
              </div>
            </div>

            <div>
              <label className={labelClass}>License required</label>
              <CheckboxGroup options={LICENSES} selected={form.licenses} onChange={v => set('licenses', v)} />
            </div>

            <div>
              <label className={labelClass}>Aircraft / Component type</label>
              <input className={inputClass} placeholder="e.g. B737-800/CFM56-7B, A320, Landing Gear" value={form.aircraft_types} onChange={e => set('aircraft_types', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Experience min (years)</label>
                <input type="number" min="0" max="50" className={inputClass} placeholder="e.g. 2" value={form.experience_min} onChange={e => set('experience_min', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Experience max (years)</label>
                <input type="number" min="0" max="50" className={inputClass} placeholder="e.g. 10" value={form.experience_max} onChange={e => set('experience_max', e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Salary range</label>
                <button type="button" onClick={() => setShowSalary(!showSalary)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                  {showSalary ? <><Eye className="w-3 h-3" /> Showing</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
              </div>
              {showSalary && <input className={inputClass} placeholder="e.g. AED 8,000 - 12,000 per month" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} />}
              {!showSalary && <p className="text-xs text-gray-500">Salary will not be shown on the listing</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Working hours</label>
                <input className={inputClass} placeholder="e.g. 40 hrs/week or 160 hrs/month" value={form.working_hours} onChange={e => set('working_hours', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Application deadline</label>
                <input type="date" className={inputClass} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Job description <span className="text-gray-500 text-xs">(max 1000 chars)</span></label>
              <textarea className={inputClass} rows={5} placeholder="Describe the role, responsibilities, and requirements..." value={form.description} onChange={e => set('description', e.target.value)} maxLength={1000} />
              <p className="text-xs text-gray-600 mt-1">{form.description.length}/1000</p>
            </div>
          </div>

          {/* Visa */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Visa & Work Permit</h2>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="visa" checked={form.visa_sponsorship} onChange={e => set('visa_sponsorship', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
              <label htmlFor="visa" className="text-gray-300 text-sm">Visa sponsorship available</label>
            </div>
            <div>
              <label className={labelClass}>Work permit requirements <span className="text-gray-500 text-xs">(optional)</span></label>
              <input className={inputClass} placeholder="e.g. Malaysian nationals only, EU work permit required..." value={form.visa_requirements} onChange={e => set('visa_requirements', e.target.value)} />
            </div>
          </div>

          {/* Application method */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Application Method</h2>
            <p className="text-xs text-gray-500">Select one or more ways engineers can apply</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="inhouse" checked={form.apply_inhouse} onChange={e => set('apply_inhouse', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                <label htmlFor="inhouse" className="text-gray-300 text-sm">Apply in-house (via AECircle) <span className="text-blue-400 text-xs">— Recommended</span></label>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" id="external" checked={!!form.apply_external_link} onChange={e => { if (!e.target.checked) set('apply_external_link', ''); }} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                  <label htmlFor="external" className="text-gray-300 text-sm">External link (view job on your website)</label>
                </div>
                <input className={inputClass} placeholder="https://yourcompany.com/jobs/this-role" value={form.apply_external_link} onChange={e => set('apply_external_link', e.target.value)} />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" id="email" checked={!!form.apply_email} onChange={e => { if (!e.target.checked) set('apply_email', ''); }} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                  <label htmlFor="email" className="text-gray-300 text-sm">Send CV by email</label>
                </div>
                <input type="email" className={inputClass} placeholder="recruit@yourcompany.com" value={form.apply_email} onChange={e => set('apply_email', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Payment notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
            <p className="font-medium mb-1">💳 Payment — $159 per job post</p>
            <p className="text-xs text-blue-400">Your post will be reviewed and activated within 24 hours. We will contact you at your registered email to complete payment.</p>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Submitting...</> : 'Submit job post — $159'}
            </button>
            <button type="button" onClick={() => navigate('/co/jobs')}
              className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
