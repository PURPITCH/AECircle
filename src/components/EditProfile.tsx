import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  picture: z.string().url('Must be a valid URL'),
  date_of_birth: z.string(),
  nationality: z.string().min(1, 'Nationality is required'),
  resident_status: z.string(),
  sex: z.enum(['Male', 'Female', 'Other']),
  height: z.number().min(100).max(300),
  weight: z.number().min(30).max(200),
  medical_conditions: z.array(z.string()),
  basic_training: z.array(z.string()),
  licenses: z.array(z.object({
    type: z.string(),
    issuingAuthority: z.string(),
  })),
  certifying_experience: z.array(z.object({
    type: z.enum(['line', 'base', 'workshop', 'techPub', 'planning', 'quality', 'safety']),
    description: z.string(),
    duration: z.string(),
  })),
  non_certifying_experience: z.array(z.object({
    type: z.enum(['line', 'base', 'workshop', 'techPub', 'planning', 'quality', 'safety']),
    description: z.string(),
    duration: z.string(),
  })),
  drivers_license: z.object({
    number: z.string(),
    issuingCountry: z.string(),
    vehicleType: z.string().optional(),
  }),
  continuous_training: z.array(z.string()),
  company_training: z.array(z.string()),
  has_tool_box: z.boolean(),
  other_training: z.array(z.string()),
});

interface EditProfileProps {
  profile: Profile;
  onCancel: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ profile, onCancel }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const onSubmit = async (data: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      navigate('/app');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Edit Profile</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-400">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Designation</label>
                <input
                  type="text"
                  {...register('designation')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Profile Picture URL</label>
                <input
                  type="url"
                  {...register('picture')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.picture && <p className="text-red-500 text-sm mt-1">{errors.picture.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Sex</label>
                <select
                  {...register('sex')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-400">Additional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Nationality</label>
                <input
                  type="text"
                  {...register('nationality')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Resident Status</label>
                <input
                  type="text"
                  {...register('resident_status')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Height (cm)</label>
                <input
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Weight (kg)</label>
                <input
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};