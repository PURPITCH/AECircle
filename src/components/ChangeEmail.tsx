import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export const ChangeEmail: React.FC = () => {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
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
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/cv` }
      );
      if (updateError) throw new Error(updateError.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Check both inboxes</h2>
            <p className="text-gray-400 text-sm mb-2">
              We've sent a confirmation to:
            </p>
            <p className="text-blue-400 text-sm font-medium mb-1">{currentEmail}</p>
            <p className="text-gray-500 text-xs mb-4">and</p>
            <p className="text-blue-400 text-sm font-medium mb-6">{newEmail}</p>
            <p className="text-gray-500 text-xs mb-6">
              Confirm both emails to complete the change.
            </p>
            <button onClick={() => navigate('/cv')}
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 mx-auto">
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
          We'll send a confirmation to both your old and new email.
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
                  className="block w-full pl-10 bg-gray-700/50 border-gray-600 rounded-md text-gray-400 py-2.5 cursor-not-allowed" />
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
                  className="block w-full pl-10 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 py-2.5"
                  disabled={isLoading} />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending confirmation...</> : 'Send confirmation emails'}
            </button>
            <button type="button" onClick={() => navigate('/cv')}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
