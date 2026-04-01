import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null | JSX.Element>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false
          }
        }
      });

      if (signUpError) {
        if (signUpError.message === 'Failed to fetch') {
          throw new Error('Unable to connect to the authentication service. Please check your internet connection and try again.');
        }
        if (signUpError.message === 'User already registered' || 
            (typeof signUpError === 'object' && 'code' in signUpError && signUpError.code === 'user_already_exists')) {
          setError(
            <span className="flex flex-col gap-2">
              <span>This email is already registered.</span>
              <span>
                Please{' '}
                <Link to="/" className="text-blue-500 hover:text-blue-400 underline">
                  sign in
                </Link>{' '}
                instead.
              </span>
            </span>
          );
          return;
        }
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('No user data returned from signup');
      }

      setRegisteredEmail(data.email);
      setIsSuccess(true);
      
      // After successful signup, redirect to create profile page
      navigate('/app/create');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      setError(null);

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (resendError) {
        if (resendError.message === 'Failed to fetch') {
          throw new Error('Unable to connect to the authentication service. Please check your internet connection and try again.');
        }
        throw new Error(resendError.message);
      }

      setError('Verification email has been resent. Please check your inbox and spam folder.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-white">Check your email</h2>
              <p className="mt-2 text-sm text-gray-400">
                We've sent a verification link to
              </p>
              <p className="mt-1 text-sm font-medium text-blue-400">
                {registeredEmail}
              </p>
              <p className="mt-4 text-sm text-gray-300">
                Click the link in the email to verify your account and complete the registration process.
                Please check your spam folder if you don't see the email in your inbox.
              </p>

              {error && (
                <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500 text-blue-400">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-gray-400">
                    Didn't receive the email?
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="inline-flex items-center text-sm text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend verification email'
                    )}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setError(null);
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Try again with a different email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">Join AECircle</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg border border-gray-700 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-12 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-300 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('agreeToTerms')}
                    type="checkbox"
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-300">
                    By clicking Agree & Join or Continue, you agree to the AECircle{' '}
                    <Link to="/user-agreement" className="text-blue-500 hover:text-blue-400">
                      User Agreement
                    </Link>
                    ,{' '}
                    <Link to="/privacy" className="text-blue-500 hover:text-blue-400">
                      Privacy Policy
                    </Link>
                    , and{' '}
                    <Link to="/cookies" className="text-blue-500 hover:text-blue-400">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Agree & Join'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Already on AECircle?{' '}
                <Link to="/" className="font-medium text-blue-500 hover:text-blue-400">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};