import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plane, Loader2, CheckCircle, Lock } from 'lucide-react';

const ENTITY_TYPES = ['AMO (Approved Maintenance Organisation)', 'Training Organisation', 'Recruitment Agency', 'Individual Recruiter'];
const ACTIVITIES = ['Recruitment only', 'Training only', 'Both recruitment and training'];

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-300 mb-1";

export const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'access' | 'signup' | 'profile' | 'success'>('access');
  const [accessMethod, setAccessMethod] = useState<'code' | 'pay' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [form, setForm] = useState({
    entity_name: '', entity_type: '', activity: '', affiliation: '',
    location: '', website: '', about: '', email: '', phone: '',
    linkedin: '', social_handles: '',
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const validateCode = async () => {
    if (!inviteCode.trim()) { setCodeError('Please enter an invite code.'); return; }
    setIsLoading(true);
    setCodeError('');
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode.trim().toUpperCase())
        .eq('used', false)
        .maybeSingle();
      if (error || !data) {
        setCodeError('Invalid or already used invite code.');
      } else {
        setCodeValid(true);
        setStep('signup');
      }
    } finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { emailRedirectTo: `${window.location.origin}/co/register` }
      });
      if (error) throw error;
      setStep('profile');
    } catch (err: any) {
      setSignupError(err.message);
    } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const uniqueCode = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
      const handle = form.entity_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      const username = `${uniqueCode}-${handle}`;
      const { error: profileError } = await supabase.from('company_profiles').insert({
        user_id: user.id, username, ...form,
        invite_code: inviteCode.trim().toUpperCase() || null,
        plan: 'free',
      });
      if (profileError) throw profileError;
      if (inviteCode) {
        await supabase.from('invite_codes')
          .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
          .eq('code', inviteCode.trim().toUpperCase());
      }
      setStep('success');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md mx-auto bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to AECircle!</h2>
          <p className="text-gray-400 text-sm mb-6">Your company profile has been created.</p>
          <button onClick={() => navigate('/')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
            Go to AECircle →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Plane className="h-7 w-7 text-blue-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-gray-400 text-sm mt-2">One account for your company profile.</p>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            {signupError && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500 text-sm">{signupError}</div>}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className={labelClass}>Email address</label>
                <input type="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  placeholder="your@email.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password <span className="text-gray-500 text-xs">(min 8 characters)</span></label>
                <input type="password" required minLength={8} value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Create a strong password" className={inputClass} />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Continue →'}
              </button>
              <button type="button" onClick={() => setStep('access')}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors">← Back</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setStep('signup')} className="text-gray-400 hover:text-white">←</button>
            <h1 className="text-2xl font-bold text-white">Create company profile</h1>
            {codeValid && <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">✓ Invite code applied</span>}
          </div>
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Entity / Individual name *</label>
                <input required className={inputClass} placeholder="e.g. Aviation Staffing Group" value={form.entity_name} onChange={e => set('entity_name', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Entity type *</label>
                <select required className={inputClass} value={form.entity_type} onChange={e => set('entity_type', e.target.value)}>
                  <option value="">Select type</option>
                  {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Activity *</label>
                <select required className={inputClass} value={form.activity} onChange={e => set('activity', e.target.value)}>
                  <option value="">Select activity</option>
                  {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} placeholder="e.g. London, UK" value={form.location} onChange={e => set('location', e.target.value)} maxLength={40} />
              </div>
              <div>
                <label className={labelClass}>Affiliation</label>
                <input className={inputClass} placeholder="e.g. Independent / Part of XYZ Group" value={form.affiliation} onChange={e => set('affiliation', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Website</label>
                <input className={inputClass} placeholder="e.g. https://yourcompany.com" value={form.website} onChange={e => set('website', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>About <span className="text-gray-500 text-xs">(max 300 chars)</span></label>
                <textarea className={inputClass} rows={3} placeholder="Brief description..." value={form.about} onChange={e => set('about', e.target.value)} maxLength={300} />
                <p className="text-xs text-gray-600 mt-1">{form.about.length}/300</p>
              </div>
              <div>
                <label className={labelClass}>Contact email</label>
                <input type="email" className={inputClass} placeholder="e.g. recruit@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Contact phone</label>
                <input className={inputClass} placeholder="e.g. +44 20 1234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input className={inputClass} placeholder="linkedin.com/company/yourname" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Other social handles</label>
                <input className={inputClass} placeholder="e.g. @yourcompany" value={form.social_handles} onChange={e => set('social_handles', e.target.value)} />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Creating profile...</> : 'Create company profile →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="h-7 w-7 text-blue-500" />
            <span className="text-2xl font-bold text-white">AECircle</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Join as a Company or Recruiter</h1>
          <p className="text-gray-400 text-sm mt-2">Connect with verified aviation engineers worldwide.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => setAccessMethod('code')}
            className={`p-4 rounded-xl border-2 text-left transition-colors ${accessMethod === 'code' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
            <div className="text-2xl mb-2">🎟️</div>
            <p className="text-white text-sm font-medium">I have an invite code</p>
            <p className="text-gray-500 text-xs mt-1">Free access for invited partners</p>
          </button>
          <button onClick={() => setAccessMethod('pay')}
            className={`p-4 rounded-xl border-2 text-left transition-colors ${accessMethod === 'pay' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
            <div className="text-2xl mb-2">💳</div>
            <p className="text-white text-sm font-medium">Purchase access</p>
            <p className="text-gray-500 text-xs mt-1">First year free during launch</p>
          </button>
        </div>
        {accessMethod === 'code' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <label className={labelClass}>Enter your invite code</label>
            <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="AEC-XXXXXX" className={inputClass + " uppercase tracking-widest font-mono"} />
            {codeError && <p className="text-red-400 text-xs mt-2">{codeError}</p>}
            <button onClick={validateCode} disabled={isLoading}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Validate code →'}
            </button>
          </div>
        )}
        {accessMethod === 'pay' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4">
              🎉 Launch offer — First year FREE
            </div>
            <p className="text-3xl font-bold text-white mb-1">$0 <span className="text-gray-500 text-lg line-through">$49</span></p>
            <p className="text-gray-400 text-sm mb-4">Then $49/year from 2027</p>
            <ul className="text-left space-y-2 mb-6 text-sm text-gray-300">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Company profile on aircraft.engineer</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 1 complimentary job post per week</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Access to engineer profiles</li>
              <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-gray-500" /> Premium contact unlock — $159/post</li>
            </ul>
            <button onClick={() => setStep('signup')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              Create my company profile →
            </button>
          </div>
        )}
        <p className="text-center text-xs text-gray-600 mt-6">
          Already have an account? <Link to="/" className="text-blue-500 hover:text-blue-400">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default CompanyRegister;
