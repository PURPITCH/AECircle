import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export const ChangeEmail: React.FC = () => {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/'); return; }
      setCurrentEmail(data.user.email || '');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === currentEmail) {
      setError('Please enter a different email address.');
      return;
    }
    if (!password) {
      setError('Please enter your current password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Verify password first by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password,
      });
      if (signInError) throw new Error('Incorrect password. Please try again.');

      // Now update email — only new email needs to confirm
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/cv` }
      );
      if (updateError) throw new Error(updateError.message);

      // Update email in profiles table too
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ email: newEmail }).eq('id', user.id);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "block w-full pl-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 py-2.5 text-sm";

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Check your new inbox</h2>
            <p className="text-gray-400 text-sm mb-4">
              We've sent a confirmation link to:
            </p>
            <p className="text-blue-400 text-sm font-medium mb-6">{newEmail}</p>
            <p className="text-gray-500 text-xs mb-6">
              Click the link in that email to confirm your new address. Your old email has been notified.
            </p>
            <button onClick={() => navigate('/cv')}
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 mx-auto transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to my CV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">Change email</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Confirm with your password — only your new email needs to verify.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500 text-sm">{error}</div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input type="email" value={currentEmail} disabled
                  className="block w-full pl-10 bg-gray-700/50 border border-gray-600 rounded-md text-gray-400 py-2.5 text-sm cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  required placeholder="Enter new email"
                  className={inputClass} disabled={isLoading} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="Enter your password to confirm"
                  className={inputClass} disabled={isLoading} />
              </div>
              <p className="mt-1 text-xs text-gray-500">We use your password to verify it's really you.</p>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Verifying...</> : 'Update email address'}
            </button>

            <button type="button" onClick={() => navigate('/account-settings')}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Account Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
