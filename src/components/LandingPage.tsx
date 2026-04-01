import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Plane, Shield, Users, Award, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
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
  const [error, setError] = useState<string | null | JSX.Element>(null);

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

      if (signInError) {
        if (signInError.message === 'Failed to fetch') {
          throw new Error('Unable to connect to the authentication service. Please check your internet connection and try again.');
        }
        throw new Error(signInError.message);
      }

      navigate('/app');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-2xl font-bold text-white">AECircle</span>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center px-4 py-2 border border-blue-500 text-sm font-medium rounded-md text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-150"
            >
              Join now
            </Link>
          </div>
        </nav>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Connect with the Global Aviation Maintenance Community
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Join the premier network for Aircraft Engineers and Maintenance Professionals
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-500" />
                <span className="ml-3 text-gray-300">Verified professional profiles</span>
              </div>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="ml-3 text-gray-300">Connect with industry experts</span>
              </div>
              <div className="flex items-center">
                <Award className="h-6 w-6 text-blue-500" />
                <span className="ml-3 text-gray-300">Showcase your certifications</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Sign in to AECircle</h2>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full pl-10 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-12 bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password"
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

              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                  disabled={isLoading}
                />
                <label className="ml-2 block text-sm text-gray-300">
                  Keep me logged in
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-16 py-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm text-gray-400">
            <Link to="/user-agreement" className="hover:text-gray-300">User Agreement</Link>
            <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/guidelines" className="hover:text-gray-300">Community Guidelines</Link>
            <Link to="/cookies" className="hover:text-gray-300">Cookie Policy</Link>
            <Link to="/copyright" className="hover:text-gray-300">Copyright Policy</Link>
            <button className="text-left hover:text-gray-300">Send Feedback</button>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <span>AECircle © 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
};