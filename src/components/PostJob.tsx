import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Eye, EyeOff, Plus, X } from 'lucide-react';

const CATEGORIES = ['Certifying', 'Non-Certifying', 'Post Holder', 'Managerial', 'Compliance & Safety', 'Other'];
const DEPARTMENTS = ['Line','Base','Line & Base','Workshop','NDT','Training','Tech Pub','Planning','Compliance','Safety','Stores / Logistics','Other'];
const JOB_TYPES = ['Full time', 'Contract', 'Freelance'];
const PART66_CATS = ['A','B1.1','B1.2','B1.3','B1.4','B2','C','Other'];
const OTHER_LICENSES = ['FAA A&P','GCAA CAR 66','CAAS','CAAM','DGCA','No license required','Other'];

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

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showSalary, setShowSalary] = useState(false);
  const [otherRequirements, setOtherRequirements] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    categories: [] as string[],
    departments: [] as string[],
    job_types: [] as string[],
    location: '',
    is_remote: false,
    part66_categories: [] as string[],
    license_authority: '',
    type_endorsement: '',
    other_licenses: [] as string[],
    experience_type: '',
    experience_min: '',
    experience_max: '',
    salary_range: '',
    working_hours: '',
    description: '',
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
    const p1 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
    const p2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
    return `${p1}-${p2}`;
  };

  const addRequirement = () => setOtherRequirements(prev => [...prev, '']);
  const updateRequirement = (i: number, val: string) => setOtherRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  const removeRequirement = (i: number) => setOtherRequirements(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const job_code = generateJobCode();
      const allLicenses = [...form.part66_categories.map(c => `EASA Part 66 ${c}`), ...form.other_licenses];

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
        licenses: allLicenses,
        aircraft_types: form.type_endorsement || null,
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
            <p className="text-gray-500 text-xs mt-0.5">Your post will be reviewed before going live</p>
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
                <input className={inputClass} placeholder="e.g. London, UK" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="remote" checked={form.is_remote} onChange={e => set('is_remote', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                <label htmlFor="remote" className="text-gray-300 text-sm">Remote / Hybrid available</label>
              </div>
            </div>
          </div>

          {/* License requirements */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">License Requirements</h2>

            <div>
              <label className={labelClass}>EASA Part 66 Category</label>
              <CheckboxGroup options={PART66_CATS} selected={form.part66_categories} onChange={v => set('part66_categories', v)} />
            </div>

            {form.part66_categories.includes('Other') && (
              <div>
                <label className={labelClass}>Other license — please specify</label>
                <input className={inputClass} placeholder="e.g. FAA A&P, GCAA CAR 66, CAAS, CAAM, DGCA..." value={form.other_licenses.join(', ')} onChange={e => set('other_licenses', [e.target.value])} />
              </div>
            )}

            <div>
              <label className={labelClass}>Issuing authority <span className="text-gray-500 text-xs">(free text)</span></label>
              <input className={inputClass} placeholder="e.g. GCAA UAE, EASA, FAA, CAAS Singapore..." value={form.license_authority} onChange={e => set('license_authority', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Type endorsement requirement <span className="text-gray-500 text-xs">(free text)</span></label>
              <input className={inputClass} placeholder="e.g. B737-800/CFM56-7B, A320/v2500..." value={form.type_endorsement} onChange={e => set('type_endorsement', e.target.value)} />
            </div>
          </div>
          
          {/* Experience */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Experience Required</h2>

            <div>
              <label className={labelClass}>Type of experience <span className="text-gray-500 text-xs">(free text)</span></label>
              <input className={inputClass} placeholder="e.g. certifying experience, base maintenance, auditing experience..." value={form.experience_type} onChange={e => set('experience_type', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Minimum years</label>
                <input type="number" min="0" max="50" className={inputClass} placeholder="e.g. 2" value={form.experience_min} onChange={e => set('experience_min', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Maximum years</label>
                <input type="number" min="0" max="50" className={inputClass} placeholder="e.g. 10" value={form.experience_max} onChange={e => set('experience_max', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Compensation & Hours</h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Salary range</label>
                <button type="button" onClick={() => setShowSalary(!showSalary)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                  {showSalary ? <><Eye className="w-3 h-3" /> Visible on listing</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
              </div>
              {showSalary
                ? <input className={inputClass} placeholder="e.g. AED 8,000–12,000/month or Competitive" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} />
                : <p className="text-xs text-gray-500">Salary will not be shown publicly</p>
              }
            </div>

            <div>
              <label className={labelClass}>Working hours</label>
              <input className={inputClass} placeholder="e.g. 40 hrs/week, 5 days on 2 days off, roster..." value={form.working_hours} onChange={e => set('working_hours', e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Job Description</h2>
            <div>
              <label className={labelClass}>Description <span className="text-gray-500 text-xs">(max 2000 chars)</span></label>
              <textarea className={inputClass} rows={8} placeholder="Describe the role, responsibilities, company culture, benefits..." value={form.description} onChange={e => set('description', e.target.value)} maxLength={2000} />
              <p className="text-xs text-gray-600 mt-1">{form.description.length}/2000</p>
            </div>

            {/* Other requirements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Other requirements</label>
                <button type="button" onClick={addRequirement}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <Plus className="w-3 h-3" /> Add requirement
                </button>
              </div>
              {otherRequirements.map((req, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={inputClass} placeholder={`e.g. Valid medical certificate, Own toolbox...`} value={req} onChange={e => updateRequirement(i, e.target.value)} />
                  <button type="button" onClick={() => removeRequirement(i)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className={labelClass}>Application deadline</label>
              <input type="date" className={inputClass} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
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
            <p className="text-xs text-gray-500">Select one or more</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="inhouse" checked={form.apply_inhouse} onChange={e => set('apply_inhouse', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                <label htmlFor="inhouse" className="text-gray-300 text-sm">Apply in-house via AECircle <span className="text-blue-400 text-xs">— Recommended</span></label>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" id="external" checked={!!form.apply_external_link} onChange={e => { if (!e.target.checked) set('apply_external_link', ''); }} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                  <label htmlFor="external" className="text-gray-300 text-sm">External link</label>
                </div>
                {!!form.apply_external_link !== false && <input className={inputClass} placeholder="https://yourcompany.com/careers/this-role" value={form.apply_external_link} onChange={e => set('apply_external_link', e.target.value)} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" id="email_apply" checked={!!form.apply_email} onChange={e => { if (!e.target.checked) set('apply_email', ''); }} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                  <label htmlFor="email_apply" className="text-gray-300 text-sm">Send CV by email</label>
                </div>
                {!!form.apply_email !== false && <input type="email" className={inputClass} placeholder="recruit@yourcompany.com" value={form.apply_email} onChange={e => set('apply_email', e.target.value)} />}
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
