import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password');
          return;
        }

        if (session) {
          // Check if company profile exists
          const { data: companyProfile } = await supabase
            .from('company_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (companyProfile) {
            navigate('/co/dashboard');
          } else {
            navigate('/cv');
          }
        } else {
          navigate('/');
        }
      });
    };
    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex items-center gap-3 text-blue-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Please wait...</span>
      </div>
    </div>
  );
};

export default AuthCallback;
