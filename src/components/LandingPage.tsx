import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, Mail, Plane, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) throw new Error(signInError.message);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyProfile) {
        navigate('/co/dashboard');
      } else {
        navigate('/cv');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Nav */}
        <nav className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-7 w-7 text-blue-500" />
            <span className="text-2xl font-bold text-white">AECircle</span>
            <span className="text-xs text-gray-500 ml-1 hidden sm:block">by aircraft.engineer</span>
          </div>
          <Link to="/signup"
            className="px-4 py-2 border border-blue-500 text-sm font-medium rounded-md text-blue-500 hover:bg-blue-500 hover:text-white transition-colors">
            Build my CV free →
          </Link>
        </nav>

        {/* Hero */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
              ✈ Built by an aircraft engineer · Free to join
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              The CV built for<br />
              <span className="text-blue-400">Aircraft Engineers.</span><br />
              Not Word. Not PDF.<br />
              <span className="text-gray-400">One link.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 leading-relaxed">
              Your current CV is 3 pages of tables that ATS systems can't read and recruiters skip in 10 seconds.
              AECircle gives you a standardised profile built around how aviation recruitment actually works.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: '✈', text: 'EASA · FAA · GCAA — your license exactly as issued, with type ratings and endorsement dates' },
                { icon: '🔧', text: 'Certifying vs Non-Certifying vs Post Holder — no more guessing what level you worked at' },
                { icon: '🔒', text: 'You control what recruiters see — contact info stays hidden until you allow it' },
                { icon: '📄', text: 'One link to share — aircraft.engineer/cv/XXXX-yourname — clean, white, PDF-ready' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <span className="text-gray-300 text-sm leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link to="/signup"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                Build my free CV →
              </Link>
              <span className="text-gray-500 text-sm">No credit card. No subscription.</span>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free forever for engineers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Built by a licensed engineer</span>
              </div>
            </div>
          </div>

          {/* Sign in form */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-1">Sign in to AECircle</h2>
            <p className="text-gray-400 text-sm mb-6">Welcome back, engineer.</p>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500 text-sm">{error}</div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input {...register('email')} type="email"
                    className="block w-full pl-10 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 py-2.5"
                    placeholder="Email" disabled={isLoading} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input {...register('password')} type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-12 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 py-2.5"
                    placeholder="Password" disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-300">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input {...register('rememberMe')} type="checkbox"
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    disabled={isLoading} />
                  <label className="ml-2 text-sm text-gray-300">Keep me logged in</label>
                </div>
                <Link to="/reset-password" className="text-sm text-blue-500 hover:text-blue-400">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors">
                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</> : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-400 text-sm mb-3">New to AECircle?</p>
              <Link to="/signup"
                className="w-full flex justify-center py-2.5 px-4 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">
                Build my free CV →
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-gray-600">
              By signing in you agree to our{' '}
              <Link to="/terms" className="text-blue-500 hover:text-blue-400">Terms & Conditions</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-500 hover:text-blue-400">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-gray-300">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/guidelines" className="hover:text-gray-300">Community Guidelines</Link>
            <Link to="/cookies" className="hover:text-gray-300">Cookie Policy</Link>
            <Link to="/copyright" className="hover:text-gray-300">Copyright Policy</Link>
            <button className="text-left hover:text-gray-300">Send Feedback</button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            AECircle © 2026 · aircraft.engineer · Built by an engineer, for engineers.
          </div>
        </footer>
      </div>
    </div>
  );
};
