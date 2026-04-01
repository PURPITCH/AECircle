import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, checkProfile } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error.message);
        navigate('/');
        return;
      }

      if (session) {
        // Check if user has a profile
        const profile = await checkProfile();
        
        // Redirect based on profile existence
        if (profile) {
          navigate('/app');
        } else {
          navigate('/app/create');
        }
      } else {
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
        <p className="mt-4 text-gray-300">Completing verification...</p>
      </div>
    </div>
  );
};