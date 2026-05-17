import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plane, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error(signInError.message);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const { data: companyProfile } = await supabase
        .from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (companyProfile) {
        navigate('/co/dashboard');
      } else {
        setError('No company profile found. Please register first.');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally { setIsLoading(false); }
  };

  const inputClass = "block w-full pl-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 py-2.5 text-sm";

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Plane className="h-7 w-7 text-blue-500" />
            <span className="text-2xl font-bold text-white">Aircraft.Engineer</span>
          </div>
          <p className="text-gray-400 text-sm">Company & Recruiter Portal</p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your company account</h2>

          {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Company email" className={inputClass} disabled={isLoading} />
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" className={inputClass + " pr-10"} disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/reset-password" className="text-xs text-blue-500 hover:text-blue-400">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Signing in...</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center space-y-3">
            <p className="text-gray-400 text-sm">Don't have a company account?</p>
            <Link to="/co/register"
              className="w-full flex justify-center py-2.5 px-4 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">
              Register your company →
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-gray-600">
            Are you an engineer? <Link to="/" className="text-blue-500 hover:text-blue-400">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
