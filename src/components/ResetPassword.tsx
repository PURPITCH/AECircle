import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;
type NewPasswordForm = z.infer<typeof newPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    // Check if we have a recovery session from the email link
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Check URL hash for recovery type
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || data.session.user) {
          // Check if came from reset email
          supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
              setIsResetMode(true);
            }
          });
        }
      }
    });

    // Listen for password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const { register: registerNew, handleSubmit: handleNewSubmit, formState: { errors: newErrors } } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onRequestReset = async (data: ResetForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw new Error(resetError.message);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onSetNewPassword = async (data: NewPasswordForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
      if (updateError) throw new Error(updateError.message);
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "block w-full pl-10 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500";

  // New password form — shown after clicking reset link in email
  if (isResetMode) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-white">Set new password</h2>
          <p className="mt-2 text-center text-sm text-gray-400">Choose a strong password for your account.</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10">
            {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500">{error}</div>}
            <form className="space-y-6" onSubmit={handleNewSubmit(onSetNewPassword)}>
              <div>
                <label className="block text-sm font-medium text-gray-300">New password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input {...registerNew('password')} type={showPassword ? 'text' : 'password'} className={inputClass} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {newErrors.password && <p className="mt-1 text-sm text-red-500">{newErrors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Confirm password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input {...registerNew('confirmPassword')} type={showPassword ? 'text' : 'password'} className={inputClass} placeholder="Repeat password" />
                </div>
                {newErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{newErrors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Updating...</> : 'Set new password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Email sent confirmation
  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-blue-500" />
              <h2 className="mt-4 text-2xl font-bold text-white">Check your email</h2>
              <p className="mt-2 text-sm text-gray-400">We've sent password reset instructions to your email address.</p>
              <div className="mt-6">
                <Link to="/" className="text-sm text-blue-500 hover:text-blue-400 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Request reset form
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-gray-400">Enter your email and we'll send reset instructions.</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10">
          {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500">{error}</div>}
          <form className="space-y-6" onSubmit={handleResetSubmit(onRequestReset)}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input {...registerReset('email')} type="email" className={inputClass} placeholder="Enter your email" disabled={isLoading} />
              </div>
              {resetErrors.email && <p className="mt-1 text-sm text-red-500">{resetErrors.email.message}</p>}
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</> : 'Send reset instructions'}
            </button>
            <div className="text-center">
              <Link to="/" className="text-sm text-blue-500 hover:text-blue-400 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
